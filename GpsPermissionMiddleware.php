<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GpsPermissionMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->has(['latitude', 'longitude'])) {
            return response()->json([
                'success' => false,
                'message' => 'GPS location is required',
            ], 422);
        }

        return $next($request);
    }
}
