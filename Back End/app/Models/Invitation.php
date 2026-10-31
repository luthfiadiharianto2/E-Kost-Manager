<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'email',
        'name',
        'token',
        'expires_at',
        'is_used',
        'accepted_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Relasi ke pemilik kos
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Generate token unik
     */
    public static function generateToken(): string
    {
        return Str::random(64);
    }

    /**
     * Cek apakah undangan masih valid
     */
    public function isValid(): bool
    {
        return !$this->is_used &&
            $this->expires_at->isFuture();
    }

    /**
     * Tandai undangan sebagai digunakan
     */
    public function markAsUsed(): void
    {
        $this->update([
            'is_used' => true,
            'accepted_at' => now(),
        ]);
    }
}
