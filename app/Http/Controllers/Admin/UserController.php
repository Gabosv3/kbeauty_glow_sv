<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TeamRole;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends AdminController
{
    /** Roles que se pueden asignar desde aquí; el propietario solo lo es quien creó el equipo. */
    private const ASSIGNABLE_ROLES = ['admin', 'member'];

    public function index(): Response
    {
        $members = $this->currentTeam()->members()
            ->withTrashed()
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->pivot->role,
                'deleted_at' => $user->deleted_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/users/index', [
            'members' => $members,
            'currentUserId' => auth()->id(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $team = $this->currentTeam();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(self::ASSIGNABLE_ROLES)],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'current_team_id' => $team->id,
        ]);

        $team->members()->attach($user->id, ['role' => $data['role']]);

        return back()->with('success', 'Usuario creado.');
    }

    public function update(Request $request, int $user): RedirectResponse
    {
        $team = $this->currentTeam();
        $member = $team->members()->withTrashed()->where('users.id', $user)->firstOrFail();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')->ignore($member->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', Rule::in([...self::ASSIGNABLE_ROLES, TeamRole::Owner->value])],
        ]);

        $member->fill(['name' => $data['name'], 'email' => $data['email']]);

        if (! empty($data['password'])) {
            $member->password = $data['password'];
        }

        $member->save();

        // El rol del propietario y el propio no se cambian desde aquí.
        $isOwner = $member->pivot->role === TeamRole::Owner->value;

        if (! $isOwner && $member->id !== auth()->id() && $data['role'] !== TeamRole::Owner->value) {
            $team->members()->updateExistingPivot($member->id, ['role' => $data['role']]);
        }

        return back()->with('success', 'Usuario actualizado.');
    }

    public function destroy(int $user): RedirectResponse
    {
        $member = $this->currentTeam()->members()->where('users.id', $user)->firstOrFail();

        abort_if($member->id === auth()->id(), 422, 'No puedes eliminar tu propio usuario.');
        abort_if($member->pivot->role === TeamRole::Owner->value, 422, 'No se puede eliminar al propietario del equipo.');

        $member->delete(); // soft delete: se puede restaurar

        return back()->with('success', 'Usuario eliminado. Puedes restaurarlo desde "Eliminados".');
    }

    public function restore(int $user): RedirectResponse
    {
        $member = $this->currentTeam()->members()->onlyTrashed()->where('users.id', $user)->firstOrFail();

        $member->restore();

        return back()->with('success', 'Usuario restaurado.');
    }
}
