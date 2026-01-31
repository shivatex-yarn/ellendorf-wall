import { NextResponse } from 'next/server';

// In-memory cache with TTL (Time To Live)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum cache entries

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function getRateLimitKey(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : (request.ip || 'unknown');
  return `rate_limit_${ip}`;
}

function checkRateLimit(request) {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function getCachedData(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now > entry.timestamp + entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCachedData(key, data) {
  // Evict oldest entries if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }

  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  });
}

// Cache for all wallpapers data (since external API returns all at once)
let allWallpapersCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWallpapersFromSource(page = 1, limit = 100, category = null) {
  const baseUrl = process.env.EXTERNAL_API_BASE || 'https://riw-wall-admin-2-4-2.onrender.com';
  const now = Date.now();
  
  // Check if we have cached data that's still valid
  if (allWallpapersCache && (now - cacheTimestamp) < CACHE_DURATION) {
    // Return paginated results from cache
    let filtered = allWallpapersCache;
    
    if (category) {
      filtered = filtered.filter(w => w.subCategory?.name === category);
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);
    
    return {
      data: paginatedData,
      total: filtered.length,
    };
  }
  
  try {
    // Fetch all data from external API (it returns all at once)
    const url = `${baseUrl}/api/wallpaper`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Process all data
    let allData = Array.isArray(data) ? data : (data.data || data.items || []);
    
    // Filter active wallpapers and process
    allData = allData
      .filter((w) => w.status?.toLowerCase() === 'active')
      .map((w) => ({
        ...w,
        imageUrl: w.imageUrl || '/placeholder.jpg',
      }))
      .sort((a, b) => {
        const catA = a.subCategory?.name || 'Other';
        const catB = b.subCategory?.name || 'Other';
        return catA.localeCompare(catB);
      });
    
    // Cache all data
    allWallpapersCache = allData;
    cacheTimestamp = now;
    
    // Return paginated results
    let filtered = allData;
    if (category) {
      filtered = filtered.filter(w => w.subCategory?.name === category);
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);
    
    return {
      data: paginatedData,
      total: filtered.length,
    };
  } catch (error) {
    console.error('Error fetching from external API:', error);
    throw error;
  }
}

export async function GET(request) {
  try {
    // Rate limiting
    if (!checkRateLimit(request)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const category = searchParams.get('category') || null;
    const cacheKey = `wallpapers_${page}_${limit}_${category || 'all'}`;

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
        },
      });
    }

    // Fetch from source
    const result = await fetchWallpapersFromSource(page, limit, category);
    
    // Process and sort data
    const processedData = result.data
      .filter((w) => w.status?.toLowerCase() === 'active')
      .map((w) => ({
        ...w,
        imageUrl: w.imageUrl || '/placeholder.jpg',
      }))
      .sort((a, b) => {
        const catA = a.subCategory?.name || 'Other';
        const catB = b.subCategory?.name || 'Other';
        return catA.localeCompare(catB);
      });

    const response = {
      data: processedData,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };

    // Cache the response
    setCachedData(cacheKey, response);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallpapers', message: error.message },
      { status: 500 }
    );
  }
}
