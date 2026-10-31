<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('tenant')->after('password');
            });
        }

        if (!Schema::hasColumn('users', 'phone')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('phone')->nullable()->after('role');
            });
        }

        if (!Schema::hasColumn('users', 'whatsapp')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('whatsapp')->nullable()->after('phone');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'whatsapp')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('whatsapp');
            });
        }

        if (Schema::hasColumn('users', 'phone')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('phone');
            });
        }

        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
    }
};
