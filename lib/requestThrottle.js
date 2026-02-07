/**
 * Request Throttling Utility
 * Prevents overwhelming the server with too many concurrent requests
 * Optimized for 3,000 concurrent users
 */

class RequestThrottle {
  constructor(maxConcurrent = 50, delay = 10) {
    this.maxConcurrent = maxConcurrent;
    this.delay = delay;
    this.queue = [];
    this.active = 0;
  }

  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.active++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.active--;
      if (this.delay > 0) {
        await new Promise(r => setTimeout(r, this.delay));
      }
      this.process();
    }
  }

  getStats() {
    return {
      active: this.active,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

// Global throttle instance for API requests
const apiThrottle = new RequestThrottle(50, 10);

// Global throttle instance for image requests
const imageThrottle = new RequestThrottle(100, 5);

export { RequestThrottle, apiThrottle, imageThrottle };
