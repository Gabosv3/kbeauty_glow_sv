<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Support\Facades\Auth;

abstract class AdminController extends Controller
{
    protected function currentTeam(): Team
    {
        $user = Auth::user();
        $team = $user->currentTeam ?? $user->ownedTeams()->first();

        abort_if(! $team, 403, 'No tienes un equipo asignado.');

        return $team;
    }
}
