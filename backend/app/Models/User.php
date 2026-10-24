<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'gebruikers';

    protected $fillable = [
        'voornaam',
        'achternaam',
        'leeftijd',
        'aanhef',
        'bedrijfsnaam',
        'aantal_werknemers',
        'kvk_nummer',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed', // => geen Hash::make() in controller
        ];
    }
}
