<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'price',
        'facilities',
        'description',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
