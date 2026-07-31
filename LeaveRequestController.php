<?php

namespace App\Http\Controllers\Api;

use App\Events\LeaveApproved;
use App\Events\LeaveRejected;
use App\Http\Controllers\Controller;
use App\Http\Requests\LeaveRequestStoreRequest;
use App\Http\Resources\LeaveRequestResource;
use App\Services\LeaveRequestService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private LeaveRequestService $leaveService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->leaveService->paginate($request);

        return $this->paginateResponse($records, 'Leave requests retrieved');
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->leaveService->find($id);

        if (!$record) {
            return $this->errorResponse('Leave request not found', 404);
        }

        return $this->successResponse(new LeaveRequestResource($record), 'Leave request retrieved');
    }

    public function store(LeaveRequestStoreRequest $request): JsonResponse
    {
        $record = $this->leaveService->create($request->user(), $request->validated());

        return $this->successResponse(new LeaveRequestResource($record), 'Leave request created', 201);
    }

    public function update(LeaveRequestStoreRequest $request, int $id): JsonResponse
    {
        $record = $this->leaveService->update($id, $request->validated());

        if (!$record) {
            return $this->errorResponse('Leave request not found', 404);
        }

        return $this->successResponse(new LeaveRequestResource($record), 'Leave request updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->leaveService->delete($id);

        if (!$deleted) {
            return $this->errorResponse('Leave request not found', 404);
        }

        return $this->successResponse(null, 'Leave request deleted');
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $record = $this->leaveService->approve($id, $request->user(), $request->get('remarks', ''));

        if (!$record) {
            return $this->errorResponse('Leave request not found', 404);
        }

        event(new LeaveApproved($record->id, $record->teacher_id, $request->user()->id));

        return $this->successResponse(new LeaveRequestResource($record), 'Leave request approved');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $record = $this->leaveService->reject($id, $request->user(), $request->get('remarks', ''));

        if (!$record) {
            return $this->errorResponse('Leave request not found', 404);
        }

        event(new LeaveRejected($record->id, $record->teacher_id, $request->user()->id));

        return $this->successResponse(new LeaveRequestResource($record), 'Leave request rejected');
    }
}
