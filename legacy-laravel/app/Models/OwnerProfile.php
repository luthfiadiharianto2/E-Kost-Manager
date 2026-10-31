<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OwnerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_kost',
        'alamat',
        'kode_pos',
        'provinsi',
        'kota',
        'kecamatan',
        'kelurahan',
        'pilihan_pembayaran',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
