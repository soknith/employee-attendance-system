<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->date('attendance_date');
            $table->timestamp('check_in')->nullable();
            $table->timestamp('check_out')->nullable();
            $table->enum('status', ['present', 'late', 'absent', 'leave', 'holiday'])->default('present');
            $table->decimal('working_hours', 5, 2)->default(0);
            $table->integer('late_minutes')->default(0);
            $table->text('remark')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('accuracy', 8, 2)->nullable();
            $table->decimal('distance', 8, 2)->nullable();
            $table->string('device_name')->nullable();
            $table->string('browser')->nullable();
            $table->string('operating_system')->nullable();
            $table->enum('internet_status', ['online', 'offline'])->default('online');
            $table->timestamps();

            $table->index('teacher_id');
            $table->index('attendance_date');
            $table->index('status');
            $table->unique(['teacher_id', 'attendance_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
