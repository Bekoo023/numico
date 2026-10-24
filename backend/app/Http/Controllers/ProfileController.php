<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        if ($request->has('email')) {
            $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        }

        $validated = $request->validate([
            'voornaam' => ['sometimes', 'required', 'string', 'max:255'],
            'achternaam' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('gebruikers', 'email')->ignore($user->id)],
            'bedrijfsnaam' => ['sometimes', 'nullable', 'string', 'max:255'],
            'aantal_werknemers' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:2147483647'],
            'kvk_nummer' => ['sometimes', 'nullable', 'regex:/^[0-9]{8}$/'],
        ]);

        $user->fill($validated)->save();

        return response()->json(['user' => $user->fresh(), 'message' => 'Je gegevens zijn opgeslagen.']);
    }
}
