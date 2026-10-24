<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    protected $guarded = ['id', 'user_id'];

    protected $hidden = ['path', 'sha256', 'user_id'];

    protected function casts(): array
    {
        return ['total_cents' => 'integer', 'vat_cents' => 'integer', 'receipt_date' => 'date:Y-m-d', 'extraction' => 'array', 'confirmed_at' => 'datetime'];
    }
}
