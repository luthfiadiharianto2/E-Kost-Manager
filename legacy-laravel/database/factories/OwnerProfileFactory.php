<?php

namespace Database\Factories;

use App\Models\OwnerProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OwnerProfile>
 */
class OwnerProfileFactory extends Factory
{
    protected $model = OwnerProfile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'nama_kost' => fake()->company() . ' Kost',
            'alamat' => fake()->address(),
            'kode_pos' => fake()->postcode(),
            'provinsi' => fake()->state(),
            'kota' => fake()->city(),
            'kecamatan' => fake()->streetName(),
            'kelurahan' => fake()->streetName(),
            'pilihan_pembayaran' => fake()->randomElement(['Transfer Bank', 'QRIS', 'Cash', 'E-Wallet']),
        ];
    }
}

