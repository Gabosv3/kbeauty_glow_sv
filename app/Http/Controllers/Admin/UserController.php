<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends AdminController
{
    public function index(): Response
    {
        $currentTeam = $this->currentTeam();
        $members = $currentTeam->members()
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->pivot->role,
            ]);

        return Inertia::render('admin/users/index', [
            'members' => $members,
        ]);
    }
}
