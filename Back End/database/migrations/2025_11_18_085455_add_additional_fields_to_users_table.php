<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'name')) {
                $table->string('name')->nullable(false)->change();
            }

            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->unique()->after('name');
            }

            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }

            if (!Schema::hasColumn('users', 'whatsapp')) {
                $table->string('whatsapp')->nullable()->after('phone');
            }

            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('whatsapp');
            }

            if (Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('tenant')->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = collect(['username', 'phone', 'whatsapp', 'address'])
                ->filter(fn ($column) => Schema::hasColumn('users', $column))
                ->all();

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }

            if (Schema::hasColumn('users', 'name')) {
                $table->string('name')->nullable()->change();
            }

            if (Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('penyewa')->change();
            }
        });
    }
};
