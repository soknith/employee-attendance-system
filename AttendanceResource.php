<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'teacher_id' => $this->teacher_id,
            'teacher' => new TeacherResource($this->whenLoaded('teacher')),
            'attendance_date' => $this->attendance_date?->format('Y-m-d'),
            'check_in' => $this->check_in?->toISOString(),
            'check_out' => $this->check_out?->toISOString(),
            'status' => $this->status,
            'working_hours' => (float) $this->working_hours,
            'late_minutes' => $this->late_minutes,
            'remark' => $this->remark,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'accuracy' => $this->accuracy !== null ? (float) $this->accuracy : null,
            'distance' => $this->distance !== null ? (float) $this->distance : null,
            'device_name' => $this->device_name,
            'browser' => $this->browser,
            'operating_system' => $this->operating_system,
            'internet_status' => $this->internet_status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
