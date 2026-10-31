<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Kost;
use App\Models\User;

class Kamar extends Model
{
    use HasFactory;

    protected $fillable = [
        'kost_id',
        'tenant_id',
        'nomor_kamar',
        'tipe_kamar',
        'harga_sewa',
        'status',
    ];

    public function kost()
    {
        return $this->belongsTo(Kost::class);
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }
}