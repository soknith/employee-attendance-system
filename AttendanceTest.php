<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\SchoolSetting;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    private User $teacherUser;

    private Teacher $teacher;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'teacher', 'display_name' => 'Teacher']);
        $department = \App\Models\Department::create([
            'name_kh' => 'ភាសាខ្មែរ',
            'name_en' => 'Khmer Language',
        ]);

        $this->teacher = Teacher::create([
            'department_id' => $department->id,
            'teacher_code' => 'TCH001',
            'first_name_kh' => 'សុវណ្ណ',
            'first_name_en' => 'Sovann',
            'gender' => 'male',
            'gps_enabled' => true,
            'status' => true,
        ]);

        $this->teacherUser = User::create([
            'teacher_id' => $this->teacher->id,
            'role_id' => $role->id,
            'username' => 'teacher1',
            'email' => 'teacher@test.com',
            'password' => 'Password@2026',
            'status' => 'active',
        ]);

        SchoolSetting::create([
            'school_name_kh' => 'សាលាសុវណ្ណគិរី',
            'school_name_en' => 'SovannKiri School',
            'latitude' => 11.556373,
            'longitude' => 104.928209,
            'attendance_radius' => 150,
            'morning_checkin_start' => '07:00',
            'morning_checkin_end' => '11:00',
            'afternoon_checkin_start' => '13:00',
            'afternoon_checkin_end' => '17:00',
        ]);
    }

    public function test_check_in_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/attendance/check-in', [
            'latitude' => 11.556373,
            'longitude' => 104.928209,
        ]);

        $response->assertStatus(401);
    }

    public function test_check_in_requires_gps_coordinates(): void
    {
        $response = $this->actingAs($this->teacherUser, 'sanctum')
            ->postJson('/api/v1/attendance/check-in', []);

        $response->assertStatus(422);
    }

    public function test_verify_gps_endpoint_works(): void
    {
        $response = $this->actingAs($this->teacherUser, 'sanctum')
            ->postJson('/api/v1/attendance/verify-gps', [
                'latitude' => 11.556373,
                'longitude' => 104.928209,
                'accuracy' => 10,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['valid', 'inside_radius', 'distance', 'radius'],
            ]);
    }
}
