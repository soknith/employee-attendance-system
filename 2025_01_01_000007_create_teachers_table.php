<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->string('teacher_code')->unique();
            $table->string('first_name_kh');
            $table->string('last_name_kh')->nullable();
            $table->string('first_name_en')->nullable();
            $table->string('last_name_en')->nullable();
            $table->enum('gender', ['male', 'female'])->default('male');
            $table->date('date_of_birth')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('photo')->nullable();
            $table->string('position')->nullable();
            $table->date('join_date')->nullable();
            $table->enum('employment_status', ['active', 'inactive', 'suspended', 'retired'])->default('active');
            $table->boolean('gps_enabled')->default(true);
            $table->boolean('status')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('department_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
