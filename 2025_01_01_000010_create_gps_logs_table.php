<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gps_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('attendance_record_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('accuracy', 8, 2)->nullable();
            $table->decimal('distance', 8, 2)->nullable();
            $table->integer('radius')->nullable();
            $table->enum('gps_status', ['success', 'failed', 'denied', 'timeout', 'low_accuracy'])->default('success');
            $table->string('device')->nullable();
            $table->string('browser')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('network')->nullable();
            $table->decimal('battery_level', 5, 2)->nullable();
            $table->text('message')->nullable();
            $table->timestamps();

            $table->index('teacher_id');
            $table->index('attendance_record_id');
            $table->index('gps_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gps_logs');
    }
};
