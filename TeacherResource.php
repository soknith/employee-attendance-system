<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'teacher_code' => $this->teacher_code,
            'first_name_kh' => $this->first_name_kh,
            'last_name_kh' => $this->last_name_kh,
            'first_name_en' => $this->first_name_en,
            'last_name_en' => $this->last_name_en,
            'full_name_en' => $this->full_name_en,
            'full_name_kh' => $this->full_name_kh,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'photo' => $this->photo,
            'position' => $this->position,
            'join_date' => $this->join_date?->format('Y-m-d'),
            'employment_status' => $this->employment_status,
            'gps_enabled' => $this->gps_enabled,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
