<?php

namespace Database\Factories;

use App\Models\Kost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kost>
 */
class KostFactory extends Factory
{
    protected $model = Kost::class;

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
            'alamat_kost' => fake()->address(),
            'jumlah_kamar' => fake()->numberBetween(5, 50),
            'harga' => fake()->numberBetween(300000, 2000000),
        ];
    }
}

