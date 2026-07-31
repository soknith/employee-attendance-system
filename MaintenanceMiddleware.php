<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MaintenanceMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->isDownForMaintenance()) {
            return response()->json([
                'success' => false,
                'message' => 'System is under maintenance. Please try again later.',
            ], 503);
        }

        return $next($request);
    }
}
