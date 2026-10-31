<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kamars', function (Blueprint $table) {
            $table->id();
            // Relasi ke pemilik kost melalui kolom kost_id (tanpa constraint FK agar tidak bentrok urutan migrasi)
            $table->foreignId('kost_id')->index();
            // Relasi opsional ke tenant (user dengan role tenant) yang menempati kamar ini
            $table->foreignId('tenant_id')->nullable()->index();

            $table->string('nomor_kamar')->unique();
            $table->string('tipe_kamar');
            $table->integer('harga_sewa');
            // "tersedia" atau "terisi"
            $table->enum('status', ['tersedia', 'terisi'])->default('tersedia');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kamars');
    }
};
