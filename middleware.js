import { NextResponse } from 'next/server';

// Request tracking for load balancing considerations
const requestCounts = new Map();
const REQUEST_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 200;

function getClientIdentifier(request) {
  // Try to get a unique identifier for the client
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : (request.ip || 'unknown');
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}_${userAgent.substring(0, 50)}`;
}

function shouldThrottle(request) {
  const identifier = getClientIdentifier(request);
  const now = Date.now();
  const key = `${identifier}_${Math.floor(now / REQUEST_WINDOW)}`;
  
  const count = requestCounts.get(key) || 0;
  if (count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  requestCounts.set(key, count + 1);
  
  // Clean up old entries
  if (requestCounts.size > 1000) {
    const keysToDelete = [];
    const currentWindow = Math.floor(now / REQUEST_WINDOW);
    
    for (const [k] of requestCounts) {
      const window = parseInt(k.split('_').pop() || '0', 10);
      if (currentWindow - window > 2) {
        keysToDelete.push(k);
      }
    }
    
    keysToDelete.forEach(k => requestCounts.delete(k));
  }
  
  return false;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Apply middleware only to API routes and wallcovering collections
  if (pathname.startsWith('/api/') || pathname.startsWith('/wallcoveringcollections')) {
    // Throttle excessive requests
    if (shouldThrottle(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 }
      );
    }

    // Add CORS headers for API routes
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next();
      
      // Set security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      
      // Add cache headers for static assets
      if (pathname.includes('/images/') || pathname.includes('/assets/')) {
        response.headers.set(
          'Cache-Control',
          'public, max-age=31536000, immutable'
        );
      }
      
      return response;
    }

    // For wallcovering collections page, add performance headers
    if (pathname.startsWith('/wallcoveringcollections')) {
      const response = NextResponse.next();
      
      // Preload hints
      response.headers.set('Link', '</api/wallpapers?page=1&limit=100>; rel=prefetch');
      
      // Add resource hints
      response.headers.set('X-DNS-Prefetch-Control', 'on');
      
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/wallcoveringcollections/:path*',
  ],
};
