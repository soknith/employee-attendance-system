<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teaching_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->string('subject');
            $table->string('grade')->nullable();
            $table->string('classroom')->nullable();
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->foreignId('academic_year_id')->nullable()->constrained()->onDelete('set null');
            $table->string('semester')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->index('teacher_id');
            $table->index('academic_year_id');
            $table->index('day_of_week');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teaching_schedules');
    }
};
