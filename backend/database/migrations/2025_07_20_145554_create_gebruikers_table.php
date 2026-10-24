<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGebruikersTable extends Migration
{
    public function up(): void
    {
        Schema::create('gebruikers', function (Blueprint $table) {
            $table->id();
            $table->string('voornaam');
            $table->string('achternaam');
            $table->integer('leeftijd')->nullable();
            $table->enum('aanhef', ['meneer', 'mevrouw'])->nullable();
            $table->string('bedrijfsnaam')->nullable();
            $table->integer('aantal_werknemers')->nullable();
            $table->string('kvk_nummer')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gebruikers');
    }
}