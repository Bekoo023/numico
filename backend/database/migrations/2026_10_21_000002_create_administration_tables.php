<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('gebruikers')->cascadeOnDelete();
            $table->string('original_name');
            $table->string('path');
            $table->string('mime', 100);
            $table->string('sha256', 64);
            $table->string('status', 20)->default('uploaded');
            $table->string('vendor')->nullable();
            $table->date('receipt_date')->nullable();
            $table->string('currency', 3)->nullable();
            $table->bigInteger('total_cents')->nullable();
            $table->bigInteger('vat_cents')->nullable();
            $table->string('category')->nullable();
            $table->text('notes')->nullable();
            $table->json('extraction')->nullable();
            $table->text('error')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'sha256']);
            $table->index(['user_id', 'receipt_date']);
        });
        Schema::create('administration_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('gebruikers')->cascadeOnDelete();
            $table->string('role', 20);
            $table->text('content');
            $table->json('sources')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('administration_messages');
        Schema::dropIfExists('receipts');
    }
};
