/**
 * Rate Limiter for API requests
 * Enforces request rate limits with queueing
 *
 * Used by Semantic Scholar MCP to respect 1 req/sec limit
 */

export interface RateLimiterStats {
  queueLength: number;
  totalRequests: number;
  rejectedRequests: number;
  averageWaitTime: number;
  lastRequestTime: number;
}

export class RateLimiter {
  private queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    enqueuedAt: number;
  }> = [];

  private processing = false;
  private lastRequestTime = 0;
  private readonly minInterval: number; // milliseconds between requests
  private totalRequests = 0;
  private rejectedRequests = 0;
  private waitTimes: number[] = [];

  /**
   * Create a rate limiter
   * @param requestsPerSecond - Maximum requests per second (e.g., 1 for Semantic Scholar)
   */
  constructor(requestsPerSecond: number) {
    if (requestsPerSecond <= 0) {
      throw new Error("requestsPerSecond must be positive");
    }
    this.minInterval = 1000 / requestsPerSecond;
  }

  /**
   * Enqueue a request to be executed with rate limiting
   * @param fn - Async function to execute
   * @returns Promise that resolves with the function's result
   */
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn,
        resolve,
        reject,
        enqueuedAt: Date.now(),
      });

      // Start processing if not already running
      void this.processQueue();
    });
  }

  /**
   * Process the request queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      // Wait if we need to respect the rate limit
      if (timeSinceLastRequest < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastRequest;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      const task = this.queue.shift();
      if (!task) continue;

      // Track wait time
      const waitTime = Date.now() - task.enqueuedAt;
      this.waitTimes.push(waitTime);
      if (this.waitTimes.length > 100) {
        this.waitTimes.shift(); // Keep last 100 wait times
      }

      this.lastRequestTime = Date.now();
      this.totalRequests++;

      try {
        const result = await task.fn();
        task.resolve(result);
      } catch (error) {
        this.rejectedRequests++;
        task.reject(error);
      }
    }

    this.processing = false;
  }

  /**
   * Get current queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Get rate limiter statistics
   */
  getStats(): RateLimiterStats {
    const averageWaitTime =
      this.waitTimes.length > 0
        ? this.waitTimes.reduce((sum, time) => sum + time, 0) /
          this.waitTimes.length
        : 0;

    return {
      queueLength: this.queue.length,
      totalRequests: this.totalRequests,
      rejectedRequests: this.rejectedRequests,
      averageWaitTime: Math.round(averageWaitTime),
      lastRequestTime: this.lastRequestTime,
    };
  }

  /**
   * Clear the queue (use with caution)
   */
  clearQueue(): void {
    const queueLength = this.queue.length;
    this.queue.forEach((task) => {
      task.reject(new Error("Queue cleared"));
    });
    this.queue = [];
    console.warn(`Rate limiter queue cleared (${queueLength} tasks rejected)`);
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.totalRequests = 0;
    this.rejectedRequests = 0;
    this.waitTimes = [];
  }
}
