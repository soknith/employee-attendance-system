<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->string('school_name_kh');
            $table->string('school_name_en');
            $table->string('school_logo')->nullable();
            $table->text('school_address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('attendance_radius')->default(100);
            $table->time('morning_checkin_start')->default('07:00');
            $table->time('morning_checkin_end')->default('11:00');
            $table->time('afternoon_checkin_start')->default('13:00');
            $table->time('afternoon_checkin_end')->default('17:00');
            $table->string('language')->default('en');
            $table->string('theme')->default('light');
            $table->string('timezone')->default('Asia/Phnom_Penh');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
