// IndexedDB-based persistent image cache for production scale
class PersistentImageCache {
  constructor() {
    this.dbName = 'EllendorfImageCache';
    this.dbVersion = 1;
    this.storeName = 'images';
    this.db = null;
    this.initPromise = null;
    this.maxSize = 500 * 1024 * 1024; // 500MB max cache size
    this.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB not available, falling back to memory cache');
        resolve(false);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  async get(url) {
    await this.init();
    
    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if expired
        const now = Date.now();
        if (now - result.timestamp > this.maxAge) {
          // Delete expired entry
          this.delete(url);
          resolve(null);
          return;
        }

        // Convert base64 back to blob URL
        if (result.blob) {
          const blob = this.base64ToBlob(result.blob, result.contentType);
          const blobUrl = URL.createObjectURL(blob);
          resolve(blobUrl);
        } else {
          resolve(result.dataUrl || null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  async set(url, blob) {
    await this.init();
    
    if (!this.db) {
      return false;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        const entry = {
          url,
          blob: base64,
          contentType: blob.type || 'image/jpeg',
          timestamp: Date.now(),
          size: blob.size,
        };

        const request = store.put(entry);

        request.onsuccess = () => {
          // Clean up old entries if needed
          this.cleanup();
          resolve(true);
        };

        request.onerror = () => {
          resolve(false);
        };
      };

      reader.onerror = () => {
        resolve(false);
      };

      reader.readAsDataURL(blob);
    });
  }

  async delete(url) {
    await this.init();
    
    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(url);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }

  async cleanup() {
    await this.init();
    
    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const now = Date.now();
      let totalSize = 0;

      // First, calculate total size and delete expired entries
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const entries = getAllRequest.result;
        
        // Delete expired entries
        entries.forEach(entry => {
          if (now - entry.timestamp > this.maxAge) {
            store.delete(entry.url);
          } else {
            totalSize += entry.size || 0;
          }
        });

        // If still over limit, delete oldest entries
        if (totalSize > this.maxSize) {
          const sortedEntries = entries
            .filter(e => now - e.timestamp <= this.maxAge)
            .sort((a, b) => a.timestamp - b.timestamp);

          for (const entry of sortedEntries) {
            if (totalSize <= this.maxSize) break;
            store.delete(entry.url);
            totalSize -= entry.size || 0;
          }
        }

        resolve();
      };

      getAllRequest.onerror = () => resolve();
    });
  }

  base64ToBlob(base64, contentType) {
    const parts = base64.split(',');
    const byteString = atob(parts[1] || parts[0]);
    const mimeString = parts[0].match(/:(.*?);/)?.[1] || contentType;
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  async clear() {
    await this.init();
    
    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }
}

// Enhanced in-memory LRU cache with IndexedDB backing
class ImageCache {
  constructor(maxSize = 200) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
    this.persistentCache = new PersistentImageCache();
    this.loadingPromises = new Map(); // Track ongoing loads
    this.retryCount = new Map(); // Track retry attempts
    this.maxRetries = 3;
  }

  async init() {
    await this.persistentCache.init();
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
      }
    }
    
    this.cache.set(key, value);
    this.accessOrder.push(key);
    
    // Clean up old entries if they exceed max size
    while (this.accessOrder.length > this.maxSize) {
      const oldKey = this.accessOrder.shift();
      if (oldKey) {
        this.cache.delete(oldKey);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.loadingPromises.clear();
    this.retryCount.clear();
  }

  async getPersistent(key) {
    return await this.persistentCache.get(key);
  }

  async setPersistent(key, blob) {
    return await this.persistentCache.set(key, blob);
  }

  getRetryCount(key) {
    return this.retryCount.get(key) || 0;
  }

  incrementRetryCount(key) {
    const count = this.retryCount.get(key) || 0;
    this.retryCount.set(key, count + 1);
    return count + 1;
  }

  resetRetryCount(key) {
    this.retryCount.delete(key);
  }

  shouldRetry(key) {
    return this.getRetryCount(key) < this.maxRetries;
  }
}

// Global image cache instance
const imageCache = new ImageCache(200);

// Initialize persistent cache
if (typeof window !== 'undefined') {
  imageCache.init();
}

// Enhanced preload image function with retry logic and persistent cache
export const preloadImage = async (url, options = {}) => {
  const { retry = true, timeout = 30000 } = options;

  return new Promise(async (resolve, reject) => {
    // Check in-memory cache first
    const cachedValue = imageCache.get(url);
    if (cachedValue && cachedValue !== null && !(cachedValue instanceof Promise)) {
      resolve(cachedValue);
      return;
    }

    // Check if already loading
    if (imageCache.loadingPromises.has(url)) {
      try {
        const result = await imageCache.loadingPromises.get(url);
        resolve(result);
        return;
      } catch (error) {
        // If the ongoing load fails, we'll retry below
      }
    }

    // Check persistent cache
    const persistentCached = await imageCache.getPersistent(url);
    if (persistentCached) {
      imageCache.set(url, persistentCached);
      resolve(persistentCached);
      return;
    }

    // Create loading promise
    const loadPromise = new Promise(async (resolveLoad, rejectLoad) => {
      const loadImage = async (attempt = 1) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const timeoutId = setTimeout(() => {
          img.src = ''; // Cancel load
          rejectLoad(new Error(`Image load timeout: ${url}`));
        }, timeout);

        img.onload = async () => {
          clearTimeout(timeoutId);
          
          try {
            // Try to convert to blob and store in persistent cache
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                await imageCache.setPersistent(url, blob);
              }
            }, 'image/jpeg', 0.9);
          } catch (error) {
            // Ignore blob conversion errors
            console.warn('Failed to cache image blob:', error);
          }

          imageCache.set(url, url);
          imageCache.resetRetryCount(url);
          resolveLoad(url);
        };

        img.onerror = async (error) => {
          clearTimeout(timeoutId);
          
          const retryCount = imageCache.incrementRetryCount(url);
          
          if (retry && imageCache.shouldRetry(url)) {
            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
            console.warn(`Image load failed (attempt ${retryCount}), retrying in ${delay}ms:`, url);
            
            setTimeout(() => {
              loadImage(attempt + 1);
            }, delay);
          } else {
            console.warn(`Failed to load image after ${retryCount} attempts:`, url);
            imageCache.set(url, null); // Cache null to prevent repeated failed attempts
            rejectLoad(new Error(`Failed to load image: ${url}`));
          }
        };

        img.src = url;
      };

      loadImage();
    });

    // Store loading promise
    imageCache.loadingPromises.set(url, loadPromise);

    try {
      const result = await loadPromise;
      imageCache.loadingPromises.delete(url);
      resolve(result);
    } catch (error) {
      imageCache.loadingPromises.delete(url);
      reject(error);
    }
  });

  return loadPromise;
};

export default imageCache;
