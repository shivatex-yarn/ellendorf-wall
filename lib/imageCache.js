// High-performance image cache with request throttling and load balancing
// Optimized for 4000+ images and 300+ concurrent users

class ImageCache {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.requestQueue = [];
    this.activeRequests = 0;
    this.maxConcurrentRequests = 6; // Limit concurrent image loads
    this.maxRetries = 2; // Reduced retries for faster failure
    this.retryDelays = [500, 1000]; // Faster retries
    this.priorityQueue = new Map(); // Priority-based loading
    this.db = null;
    this.cacheSize = 0;
    this.maxCacheSize = 500; // Limit in-memory cache size
    this.isProcessing = false;
  }

  init() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initIndexedDB();
    }
    this.startQueueProcessor();
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('imageCache', 2);
      
      request.onerror = () => {
        console.warn('IndexedDB not available, using memory cache only');
        resolve();
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.cleanupOldCache();
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async cleanupOldCache() {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const index = store.index('timestamp');
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      const range = IDBKeyRange.upperBound(sevenDaysAgo);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  get(url) {
    return this.cache.get(url);
  }

  set(url, value) {
    // Implement LRU cache eviction
    if (this.cacheSize >= this.maxCacheSize && !this.cache.has(url)) {
      // Remove oldest entry (simple FIFO for performance)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.cacheSize--;
      }
    }
    
    if (!this.cache.has(url)) {
      this.cacheSize++;
    }
    
    this.cache.set(url, value);
    
    // Save to persistent cache asynchronously (don't block)
    if (this.db) {
      this.saveToIndexedDB(url, value).catch(() => {
        // Silently fail
      });
    }
  }

  async saveToIndexedDB(url, blobUrl) {
    if (!this.db) return;
    
    try {
      // Only save if it's a blob URL or data URL
      if (blobUrl.startsWith('blob:') || blobUrl.startsWith('data:')) {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        
        const transaction = this.db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        
        await store.put({
          url,
          blob,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      // Silently fail - don't block main thread
    }
  }

  async getPersistent(url) {
    if (!this.db) return null;
    
    try {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(url);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.blob) {
            const age = Date.now() - result.timestamp;
            if (age < 7 * 24 * 60 * 60 * 1000) {
              const blobUrl = URL.createObjectURL(result.blob);
              resolve(blobUrl);
            } else {
              this.deleteFromIndexedDB(url);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      return null;
    }
  }

  async deleteFromIndexedDB(url) {
    if (!this.db) return;
    try {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      await store.delete(url);
    } catch (error) {
      // Ignore
    }
  }

  startQueueProcessor() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    const processQueue = () => {
      // Process priority items first
      const priorityItems = this.requestQueue.filter(item => item.priority > 0);
      const normalItems = this.requestQueue.filter(item => item.priority === 0);
      const sortedQueue = [...priorityItems.sort((a, b) => b.priority - a.priority), ...normalItems];
      
      while (this.activeRequests < this.maxConcurrentRequests && sortedQueue.length > 0) {
        const item = sortedQueue.shift();
        const index = this.requestQueue.indexOf(item);
        if (index > -1) {
          this.requestQueue.splice(index, 1);
        }
        
        this.activeRequests++;
        this.loadImageWithRetry(item.url, item.options, item.priority)
          .then(item.resolve)
          .catch(item.reject)
          .finally(() => {
            this.activeRequests--;
            // Continue processing
            requestAnimationFrame(processQueue);
          });
      }
      
      if (this.requestQueue.length > 0) {
        requestAnimationFrame(processQueue);
      } else {
        this.isProcessing = false;
      }
    };
    
    requestAnimationFrame(processQueue);
  }

  async loadImageWithRetry(url, options, priority) {
    let attempt = 0;
    
    while (attempt < this.maxRetries) {
      try {
        const loadedUrl = await this.loadImageWithTimeout(url, options.timeout || 10000);
        this.set(url, loadedUrl);
        return loadedUrl;
      } catch (error) {
        attempt++;
        
        if (attempt >= this.maxRetries) {
          throw new Error(`Failed to load image after ${this.maxRetries} attempts: ${url}`);
        }
        
        if (options.retry) {
          const delay = this.retryDelays[attempt - 1] || 1000;
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Image load failed (attempt ${attempt}), retrying in ${delay}ms: ${url}`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  loadImageWithTimeout(url, timeout) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      let timeoutId;
      let isResolved = false;
      
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        img.onload = null;
        img.onerror = null;
        img.src = '';
      };

      const success = () => {
        if (isResolved) return;
        isResolved = true;
        cleanup();
        
        if (img.complete && img.naturalWidth > 0) {
          resolve(url);
        } else {
          reject(new Error('Image failed to load'));
        }
      };

      const failure = (error) => {
        if (isResolved) return;
        isResolved = true;
        cleanup();
        reject(error || new Error(`Image load error: ${url}`));
      };

      img.onload = success;
      img.onerror = () => failure(new Error(`Image load error: ${url}`));

      timeoutId = setTimeout(() => {
        failure(new Error(`Image load timeout: ${url}`));
      }, timeout);

      img.crossOrigin = 'anonymous';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = url;
    });
  }
}

// Preload image with priority and queue management
export async function preloadImage(url, options = {}) {
  if (!url) {
    throw new Error('URL is required');
  }

  // Check cache first
  const cached = imageCache.get(url);
  if (cached && !(cached instanceof Promise)) {
    return cached;
  }

  // Check if already loading
  const existingPromise = imageCache.loadingPromises.get(url);
  if (existingPromise) {
    return existingPromise;
  }

  // Check persistent cache
  try {
    const persistent = await imageCache.getPersistent(url);
    if (persistent) {
      imageCache.set(url, persistent);
      return persistent;
    }
  } catch (error) {
    // Continue to network load
  }

  // Create promise and add to queue
  const promise = new Promise((resolve, reject) => {
    const priority = options.priority || (options.retry ? 1 : 0);
    
    imageCache.requestQueue.push({
      url,
      options: { retry: options.retry !== false, timeout: options.timeout || 10000 },
      priority,
      resolve,
      reject
    });

    // Start processing if not already
    if (!imageCache.isProcessing) {
      imageCache.startQueueProcessor();
    }
  });

  imageCache.loadingPromises.set(url, promise);
  
  promise.finally(() => {
    imageCache.loadingPromises.delete(url);
  });

  return promise;
}

// Create singleton instance
const imageCache = new ImageCache();

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  imageCache.init();
}

export default imageCache;
