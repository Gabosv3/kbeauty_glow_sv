<?php

namespace App\Http\Controllers\Admin;

use App\Models\Carrier;
use App\Models\Sale;
use App\Models\Shipment;
use App\Services\StoreSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Logística de salida: despachos de ventas a clientes y planificador semanal. */
class ShipmentController extends AdminController
{
    public function index(): Response
    {
        $teamId = $this->currentTeam()->id;

        $shipments = Shipment::where('team_id', $teamId)
            ->with([
                'carrier:id,name,tracking_url',
                'sale:id,reference,customer_name,customer_phone,delivery_department,delivery_municipality,delivery_address',
            ])
            ->latest()
            ->get();

        return Inertia::render('admin/logistics/index', [
            'shipments' => $shipments,
            'carriers' => Carrier::where('team_id', $teamId)->withCount('shipments')->orderBy('name')->get(),
            // Ventas que todavía se pueden despachar: ni canceladas ni con despacho.
            'sales' => Sale::where('team_id', $teamId)
                ->whereNotIn('status', ['cancelled', 'refunded'])
                ->whereNotIn('id', $shipments->pluck('sale_id'))
                ->latest()
                ->get(['id', 'reference', 'customer_name', 'delivery_department', 'total']),
            'free_shipping_from' => (float) app(StoreSettings::class)->get('free_shipping_from'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $teamId = $this->currentTeam()->id;

        $saleData = $request->validate([
            'sale_id' => [
                'required',
                Rule::exists('sales', 'id')->where('team_id', $teamId)->whereNull('deleted_at'),
                Rule::unique('shipments', 'sale_id')->whereNull('deleted_at'),
            ],
        ], ['sale_id.unique' => 'Esa venta ya tiene un despacho.']);

        $data = $this->validated($request);
        $sale = Sale::findOrFail($saleData['sale_id']);

        Shipment::create([
            ...$data,
            'sale_id' => $sale->id,
            'team_id' => $teamId,
            'cost' => $this->costFor($sale, $data['carrier_id'] ?? null),
        ]);

        return back()->with('success', 'Despacho creado correctamente.');
    }

    public function update(Request $request, Shipment $shipment): RedirectResponse
    {
        $this->authorizeShipment($shipment);

        $data = $this->validated($request);

        $shipment->update([...$data, 'cost' => $this->costFor($shipment->sale, $data['carrier_id'] ?? null)]);

        return back()->with('success', 'Despacho actualizado correctamente.');
    }

    public function status(Request $request, Shipment $shipment): RedirectResponse
    {
        $this->authorizeShipment($shipment);

        $shipment->update($request->validate(['status' => ['required', Rule::in(Shipment::STATUSES)]]));

        return back();
    }

    public function date(Request $request, Shipment $shipment): RedirectResponse
    {
        $this->authorizeShipment($shipment);

        $shipment->update($request->validate(['ship_date' => ['nullable', 'date']]));

        return back();
    }

    public function destroy(Shipment $shipment): RedirectResponse
    {
        $this->authorizeShipment($shipment);

        $shipment->delete();

        return back()->with('success', 'Despacho eliminado correctamente.');
    }

    /** Etiqueta imprimible (sin menú) para la paquetera. */
    public function label(Shipment $shipment): Response
    {
        $this->authorizeShipment($shipment);

        $shipment->load(['carrier:id,name', 'sale.items.product:id,name']);

        $sale = $shipment->sale;
        $shipping = (float) $shipment->cost;
        // En los pedidos web el envío ya viene dentro del total de la venta.
        $collect = (float) $sale->total + ((float) $sale->shipping_cost > 0 ? 0 : $shipping);

        $settings = app(StoreSettings::class)->all();

        return Inertia::render('admin/logistics/label', [
            'label' => [
                'folio' => $sale->reference,
                'date' => $sale->created_at?->format('d/m/Y'),
                'customer' => $sale->customer_name,
                'phone' => $sale->customer_phone,
                'point' => collect([$sale->delivery_address, $sale->delivery_municipality, $sale->delivery_department])->filter()->implode(', '),
                'ship_date' => $shipment->ship_date?->format('Y-m-d'),
                'carrier' => $shipment->carrier?->name,
                'tracking' => $shipment->tracking_number,
                'items' => $sale->items->map(fn ($i) => [
                    'qty' => $i->quantity,
                    'name' => $i->product?->name ?? 'Producto',
                    'unit' => (float) $i->unit_price,
                    'subtotal' => (float) $i->subtotal,
                ])->values(),
                'shipping' => $shipping,
                'total' => round($collect, 2),
            ],
            'store' => ['name' => config('store.name'), 'whatsapp' => $settings['whatsapp']],
        ]);
    }

    private function authorizeShipment(Shipment $shipment): void
    {
        abort_unless($shipment->team_id === $this->currentTeam()->id, 403);
    }

    /** Envío gratis desde el mínimo de Ajustes; si no, el precio de la paquetera. */
    private function costFor(Sale $sale, ?int $carrierId): float
    {
        $min = (float) app(StoreSettings::class)->get('free_shipping_from');

        if ($min > 0 && (float) $sale->total >= $min) {
            return 0.0;
        }

        $carrier = $carrierId ? Carrier::where('team_id', $this->currentTeam()->id)->find($carrierId) : null;

        return (float) ($carrier?->shipping_price ?? 0);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            'carrier_id' => ['nullable', Rule::exists('carriers', 'id')->where('team_id', $this->currentTeam()->id)->whereNull('deleted_at')],
            'tracking_number' => ['nullable', 'string', 'max:80'],
            'status' => ['required', Rule::in(Shipment::STATUSES)],
            'ship_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
