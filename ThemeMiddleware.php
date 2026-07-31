<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ThemeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $theme = $request->header('X-Theme', 'light');

        if (in_array($theme, ['light', 'dark', 'auto'])) {
            $response->headers->set('X-Theme', $theme);
        }

        return $response;
    }
}
