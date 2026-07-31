<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\LeaveRepository;
use Illuminate\Http\Request;

class LeaveRequestService
{
    public function __construct(private LeaveRepository $leaveRepository)
    {
    }

    public function paginate(Request $request)
    {
        return $this->leaveRepository->paginate(
            $request->only(['teacher_id', 'status']),
            $request->integer('per_page', 15),
        );
    }

    public function find(int $id)
    {
        return $this->leaveRepository->find($id);
    }

    public function create(User $user, array $data)
    {
        $data['teacher_id'] = $user->teacher_id ?? $data['teacher_id'] ?? null;

        $data['days'] = $this->calculateDays($data['start_date'], $data['end_date']);

        return $this->leaveRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        if (isset($data['start_date']) && isset($data['end_date'])) {
            $data['days'] = $this->calculateDays($data['start_date'], $data['end_date']);
        }

        return $this->leaveRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->leaveRepository->delete($id);
    }

    public function approve(int $id, User $approver, string $remarks = '')
    {
        return $this->leaveRepository->update($id, [
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'remarks' => $remarks,
        ]);
    }

    public function reject(int $id, User $approver, string $remarks = '')
    {
        return $this->leaveRepository->update($id, [
            'status' => 'rejected',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'remarks' => $remarks,
        ]);
    }

    private function calculateDays(string $startDate, string $endDate): int
    {
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);

        return $start->diffInDays($end) + 1;
    }
}
