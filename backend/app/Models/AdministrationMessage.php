<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdministrationMessage extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['user_id'];

    protected function casts(): array
    {
        return ['sources' => 'array'];
    }
}
