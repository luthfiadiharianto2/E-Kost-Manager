<?php

namespace Database\Factories;

use App\Models\Kamar;
use App\Models\Kost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kamar>
 */
class KamarFactory extends Factory
{
    protected $model = Kamar::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kost_id' => Kost::factory(),
            'tenant_id' => null,
            'nomor_kamar' => fake()->unique()->bothify('?##'),
            'tipe_kamar' => fake()->randomElement(['Standard', 'Deluxe', 'Superior', 'Executive']),
            'harga_sewa' => fake()->numberBetween(300000, 1500000),
            'status' => fake()->randomElement(['tersedia', 'terisi']),
        ];
    }
}

