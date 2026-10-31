<?php

namespace Database\Factories;

use App\Models\Invitation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invitation>
 */
class InvitationFactory extends Factory
{
    protected $model = Invitation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'email' => fake()->unique()->safeEmail(),
            'name' => fake()->name(),
            'token' => Invitation::generateToken(),
            'expires_at' => now()->addDays(7),
            'is_used' => false,
            'accepted_at' => null,
        ];
    }
}

