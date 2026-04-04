<?php

namespace App\Http\Controllers\Admin;

use App\Models\Purchase;
use App\Models\PurchaseShipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PurchaseShipmentController extends AdminController
{
    public function store(Request $request, Purchase $purchase): RedirectResponse
    {
        abort_unless($purchase->team_id === $this->currentTeam()->id, 403);
        abort_unless($purchase->status === 'ordered', 422, 'La compra debe estar en estado Ordenada.');

        $validated = $request->validate([
            'package_number'   => ['required', 'string', 'max:100'],
            'tracking_number'  => ['nullable', 'string', 'max:100'],
            'tax'              => ['required', 'numeric', 'min:0'],
            'items'            => ['required', 'array', 'min:1'],
            'items.*.id'       => ['required', 'integer', 'exists:purchase_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $shipment = $purchase->shipments()->create([
            'package_number'  => $validated['package_number'],
            'tracking_number' => $validated['tracking_number'] ?? null,
            'tax'             => $validated['tax'],
            'status'          => 'in_transit',
        ]);

        foreach ($validated['items'] as $itemData) {
            $item = $purchase->items()
                ->whereNull('shipment_id')
                ->find((int) $itemData['id']);

            if (! $item) {
                continue;
            }

            $qty = min((int) $itemData['quantity'], $item->quantity);

            if ($qty === $item->quantity) {
                $item->update(['shipment_id' => $shipment->id]);
            } else {
                // Crear registro restante (sin asignar)
                $purchase->items()->create([
                    'product_id'  => $item->product_id,
                    'quantity'    => $item->quantity - $qty,
                    'unit_cost'   => $item->unit_cost,
                    'subtotal'    => number_format((float) $item->unit_cost * ($item->quantity - $qty), 2, '.', ''),
                    'shipment_id' => null,
                ]);

                // Asignar cantidad parcial al paquete
                $item->update([
                    'quantity'    => $qty,
                    'subtotal'    => number_format((float) $item->unit_cost * $qty, 2, '.', ''),
                    'shipment_id' => $shipment->id,
                ]);
            }
        }

        return back()->with('success', 'Paquete creado correctamente.');
    }

    public function destroy(PurchaseShipment $shipment): RedirectResponse
    {
        abort_unless($shipment->purchase->team_id === $this->currentTeam()->id, 403);

        $shipment->load('items.product');

        // Si ya fue recibido, revertir el stock
        if ($shipment->status === 'received') {
            foreach ($shipment->items as $item) {
                $item->product->decrement('stock', $item->quantity);
            }
        }

        // Liberar los items (quedan sin asignar) y fusionar si ya existe un item igual sin asignar
        foreach ($shipment->items as $item) {
            $existing = $shipment->purchase->items()
                ->where('product_id', $item->product_id)
                ->whereNull('shipment_id')
                ->first();

            if ($existing) {
                $newQty = $existing->quantity + $item->quantity;
                $existing->update([
                    'quantity' => $newQty,
                    'subtotal' => number_format((float) $item->unit_cost * $newQty, 2, '.', ''),
                ]);
                $item->delete();
            } else {
                $item->update(['shipment_id' => null]);
            }
        }

        // Revertir estado de la compra si estaba cerrada
        $purchase = $shipment->purchase;
        if ($purchase->status === 'received') {
            $purchase->update(['status' => 'ordered', 'received_at' => null]);
        }

        $shipment->delete();

        // Recalcular totales de la compra
        $purchase->load('shipments');
        $totalTax = $purchase->shipments->sum(fn ($s) => (float) $s->tax);
        $purchase->update([
            'tax'   => $totalTax,
            'total' => (float) $purchase->subtotal - (float) $purchase->discount + $totalTax,
        ]);

        return back()->with('success', 'Paquete eliminado correctamente.');
    }

    public function update(Request $request, PurchaseShipment $shipment): RedirectResponse
    {
        abort_unless($shipment->purchase->team_id === $this->currentTeam()->id, 403);
        abort_if($shipment->status !== 'in_transit', 422, 'Solo se pueden editar paquetes en tránsito.');

        $validated = $request->validate([
            'package_number'  => ['required', 'string', 'max:100'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'tax'             => ['required', 'numeric', 'min:0'],
        ]);

        $shipment->update($validated);
        $shipment->recalculatePurchase();

        return back()->with('success', 'Paquete actualizado correctamente.');
    }

    public function receive(PurchaseShipment $shipment): RedirectResponse
    {
        abort_unless($shipment->purchase->team_id === $this->currentTeam()->id, 403);
        abort_if($shipment->status !== 'in_transit', 422, 'Este paquete ya fue procesado.');

        $shipment->receive();

        return back()->with('success', 'Paquete recibido. Stock actualizado.');
    }

    public function notReceived(PurchaseShipment $shipment): RedirectResponse
    {
        abort_unless($shipment->purchase->team_id === $this->currentTeam()->id, 403);
        abort_if($shipment->status !== 'in_transit', 422, 'Este paquete ya fue procesado.');

        $shipment->markNotReceived();

        return back()->with('success', 'Paquete marcado como no recibido.');
    }
}
