
// Enhanced Image Cache with LRU (Least Recently Used) strategy
// Optimized for better memory management and performance
class ImageCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
    this.loadingPromises = new Map(); // Track ongoing loads to prevent duplicates
    this.failedUrls = new Set(); // Track failed URLs to avoid retrying immediately
    this.retryCount = new Map(); // Track retry attempts
  }

  has(key) {
    return this.cache.has(key);
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end of access order (most recently used)
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.accessOrder.push(key);
      return this.cache.get(key);
    }
    return null;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used item
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
        this.loadingPromises.delete(lruKey);
        this.retryCount.delete(lruKey);
      }
    }
    
    this.cache.set(key, value);
    this.accessOrder.push(key);
    
    // Clean up old entries if they exceed max size
    while (this.accessOrder.length > this.maxSize) {
      const oldKey = this.accessOrder.shift();
      if (oldKey) {
        this.cache.delete(oldKey);
        this.loadingPromises.delete(oldKey);
        this.retryCount.delete(oldKey);
      }
    }
  }

  getLoadingPromise(key) {
    return this.loadingPromises.get(key);
  }

  setLoadingPromise(key, promise) {
    this.loadingPromises.set(key, promise);
  }

  markFailed(key) {
    this.failedUrls.add(key);
    const count = this.retryCount.get(key) || 0;
    this.retryCount.set(key, count + 1);
  }

  canRetry(key, maxRetries = 3) {
    const retries = this.retryCount.get(key) || 0;
    return retries < maxRetries && !this.cache.has(key);
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.loadingPromises.clear();
    this.failedUrls.clear();
    this.retryCount.clear();
  }
}

// Global image cache instance - Increased for 3,000 concurrent users
const imageCache = new ImageCache(3000);

// Enhanced preload image function with retry logic for large images
const preloadImage = (url, priority = false, retryAttempt = 0, maxRetries = 3) => {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (imageCache.has(url)) {
      const cachedValue = imageCache.get(url);
      if (cachedValue === null) {
        // If cached value is null (failed), retry if allowed
        if (imageCache.canRetry(url, maxRetries) && retryAttempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, retryAttempt), 5000);
          setTimeout(() => {
            preloadImage(url, priority, retryAttempt + 1, maxRetries)
              .then(resolve)
              .catch(reject);
          }, delay);
          return;
        }
        reject(new Error(`Image previously failed: ${url}`));
        return;
      } else if (cachedValue instanceof Promise) {
        // If it's a pending promise, wait for it
        cachedValue.then(resolve).catch(reject);
        return;
      } else {
        // If it's already loaded, resolve immediately
        resolve(cachedValue);
        return;
      }
    }

    // Check if there's already a loading promise
    const existingPromise = imageCache.getLoadingPromise(url);
    if (existingPromise) {
      existingPromise.then(resolve).catch(reject);
      return;
    }

    // Use direct Image() load only - no fetch to avoid CORS; works for any size/domain
    // Reduced timeout for faster pagination (2s for priority, 5s for normal)
    const timeout = priority ? 2000 : 5000; // 2s for priority (pagination), 5s for normal
    const imagePromise = new Promise((resolveLoad, rejectLoad) => {
      const timeoutId = setTimeout(() => {
        imageCache.loadingPromises.delete(url);
        rejectLoad(new Error(`Image load timeout: ${url}`));
      }, timeout);

      const cleanup = () => {
        clearTimeout(timeoutId);
        imageCache.loadingPromises.delete(url);
      };

      const img = new Image();
      img.crossOrigin = "anonymous";
      if (priority && typeof img.fetchPriority === 'string') {
        img.fetchPriority = 'high';
      }

      img.onload = () => {
        cleanup();
        imageCache.set(url, url);
        resolveLoad(url);
      };

      img.onerror = () => {
        cleanup();
        imageCache.markFailed(url);
        imageCache.set(url, null);
        rejectLoad(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });

    // Store the promise in cache
    imageCache.setLoadingPromise(url, imagePromise);
    
    // Wait for the image to load
    imagePromise
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        // Retry logic for failed images
        if (retryAttempt < maxRetries && imageCache.canRetry(url, maxRetries)) {
          const delay = Math.min(1000 * Math.pow(2, retryAttempt), 5000);
          setTimeout(() => {
            preloadImage(url, priority, retryAttempt + 1, maxRetries)
              .then(resolve)
              .catch(reject);
          }, delay);
        } else {
          reject(error);
        }
      });
  });
};

// Batch preload images with concurrency control and progress tracking
// Optimized for 3,000 concurrent users - increased concurrency
const preloadImagesBatch = async (urls, concurrency = 16, priority = false, onProgress) => {
  const results = [];
  const total = urls.length;
  let completed = 0;
  
  // Use requestIdleCallback for non-priority batches to not block main thread
  if (!priority && 'requestIdleCallback' in window) {
    return new Promise((resolve) => {
      requestIdleCallback(async () => {
        for (let i = 0; i < urls.length; i += concurrency) {
          const batch = urls.slice(i, i + concurrency);
          const batchPromises = batch.map(url => 
            preloadImage(url, priority)
              .then(() => {
                completed++;
                if (onProgress) onProgress(completed, total);
                return { url, success: true };
              })
              .catch((error) => {
                completed++;
                if (onProgress) onProgress(completed, total);
                return { url, success: false, error };
              })
          );
          const batchResults = await Promise.allSettled(batchPromises);
          results.push(...batchResults);
          
          // Minimal delay between batches for priority loading (pagination)
          if (i + concurrency < urls.length) {
            await new Promise(resolve => setTimeout(resolve, priority ? 0 : 10));
          }
        }
        resolve(results);
      }, { timeout: 2000 });
    });
  }
  
  // Priority batches load immediately
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchPromises = batch.map(url => 
      preloadImage(url, priority)
        .then(() => {
          completed++;
          if (onProgress) onProgress(completed, total);
          return { url, success: true };
        })
        .catch((error) => {
          completed++;
          if (onProgress) onProgress(completed, total);
          return { url, success: false, error };
        })
    );
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // No delay for priority batches (pagination needs to be instant)
    if (i + concurrency < urls.length) {
      await new Promise(resolve => setTimeout(resolve, priority ? 0 : 10));
    }
  }
  return results;
};

// Preload all images aggressively during loading state
const preloadAllImages = async (wallpapers, onProgress) => {
  if (!wallpapers || wallpapers.length === 0) {
    if (onProgress) onProgress(0, 0);
    return;
  }

  const imageUrls = wallpapers
    .filter(wp => wp.imageUrl && wp.imageUrl !== "/placeholder.jpg")
    .map(wp => wp.imageUrl);

  if (imageUrls.length === 0) {
    if (onProgress) onProgress(0, 0);
    return;
  }

  // Use link preload for first batch (fastest method)
  const firstBatch = imageUrls.slice(0, 12);
  firstBatch.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = 'high';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Preload all images in batches with progress tracking
  // Optimized for high concurrency (3,000 users)
  const results = await preloadImagesBatch(
    imageUrls,
    16, // Increased concurrency for 3,000 concurrent users
    true, // High priority
    onProgress
  );

  // Retry failed images
  const failed = results
    .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
    .map(r => r.status === 'fulfilled' ? r.value.url : null)
    .filter(Boolean);

  if (failed.length > 0) {
    console.log(`Retrying ${failed.length} failed images...`);
    // Retry with lower concurrency to avoid overwhelming the server
    await preloadImagesBatch(failed, 8, false, onProgress);
  }

  return results;
};

export { imageCache, preloadImage, preloadImagesBatch, preloadAllImages };