<?php

namespace App\Http\Middleware;

use App\Services\ActivityLogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ActivityMiddleware
{
    public function __construct(private ActivityLogService $activityLogService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user() && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $this->activityLogService->log(
                $request->user()->id,
                $request->segment(2) ?? 'api',
                strtolower($request->method()),
                $request->path(),
            );
        }

        return $response;
    }
}
