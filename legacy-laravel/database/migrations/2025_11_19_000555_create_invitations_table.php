<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('email');
            $table->string('name')->nullable();
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->index(['token', 'is_used']);
            $table->index(['email', 'is_used']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
