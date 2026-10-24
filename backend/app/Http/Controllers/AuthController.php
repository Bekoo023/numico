<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'voornaam'          => 'required|string|max:255',
            'achternaam'        => 'required|string|max:255',
            'email'             => 'required|email|unique:gebruikers,email',
            'password'          => 'required|string|min:6|confirmed',
            'leeftijd'          => 'nullable|integer|min:16|max:120',
            'aanhef'            => 'required|in:meneer,mevrouw',
            'bedrijfsnaam'      => 'nullable|string|max:255',
            'aantal_werknemers' => 'nullable|integer|min:0',
            'kvk_nummer'        => 'nullable|digits:8',
        ]);

        $validated['email'] = strtolower($validated['email']);

        $user = User::create([
            'voornaam'          => $validated['voornaam'],
            'achternaam'        => $validated['achternaam'],
            'email'             => $validated['email'],
            'password'          => $validated['password'],
            'leeftijd'          => $validated['leeftijd'] ?? null,
            'aanhef'            => $validated['aanhef'],
            'bedrijfsnaam'      => $validated['bedrijfsnaam'] ?? null,
            'aantal_werknemers' => $validated['aantal_werknemers'] ?? null,
            'kvk_nummer'        => $validated['kvk_nummer'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'     => 'Registratie succesvol',
            'user'        => $user,
            'token'       => $token,
            'token_type'  => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower($credentials['email']);
        $user  = User::where('email', $email)->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'De opgegeven gegevens zijn incorrect.',
                'errors'  => ['email' => ['De opgegeven gegevens zijn incorrect.']],
            ], 401);
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'     => 'Succesvol ingelogd',
            'user'        => $user,
            'token'       => $token,
            'token_type'  => 'Bearer',
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Succesvol uitgelogd',
        ], 200);
    }

    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ], 200);
    }
}
