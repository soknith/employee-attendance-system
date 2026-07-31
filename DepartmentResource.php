<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_kh' => $this->name_kh,
            'name_en' => $this->name_en,
            'description' => $this->description,
            'status' => $this->status,
            'teachers_count' => $this->when(isset($this->teachers_count), $this->teachers_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
