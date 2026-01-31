/**
 * API-Football Rate Limiter
 *
 * Implements rate limiting and request queuing to prevent exceeding API limits.
 * Supports both daily (100 requests) and per-minute (10 requests) limits for free tier.
 *
 * Features:
 * - Request queuing when limits would be exceeded
 * - Automatic retry with exponential backoff
 * - Warning notifications when approaching limits
 * - Persistent storage of request counts
 * - Graceful degradation when limits are reached
 *
 * @see https://www.api-football.com/documentation-v3#section/Rate-Limit
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requestsPerDay: number;
  requestsPerMinute: number;
  warningThresholdPercent: number; // Show warning at this % of limit
  enableQueue: boolean;
  maxQueueSize: number;
  retryAttempts: number;
  retryDelayMs: number;
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  daily: {
    limit: number;
    used: number;
    remaining: number;
    resetAt: Date;
    percentUsed: number;
  };
  perMinute: {
    limit: number;
    used: number;
    remaining: number;
    resetAt: Date;
    percentUsed: number;
  };
  queueSize: number;
  isLimited: boolean;
  nextAvailableSlot: Date | null;
}

/**
 * Queued request
 */
interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
  retryCount: number;
}

/**
 * Request tracking data
 */
interface RequestTracking {
  dailyCount: number;
  dailyResetAt: number; // Unix timestamp
  minuteCount: number;
  minuteResetAt: number; // Unix timestamp
  requestTimestamps: number[]; // Last N request timestamps
}

/**
 * Rate limit warning callback
 */
export type RateLimitWarningCallback = (status: RateLimitStatus) => void;

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public status: RateLimitStatus,
    public retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: RateLimitConfig = {
  requestsPerDay: 100,
  requestsPerMinute: 10,
  warningThresholdPercent: 80, // Warn at 80% usage
  enableQueue: true,
  maxQueueSize: 50,
  retryAttempts: 3,
  retryDelayMs: 1000,
};

// ============================================================================
// RATE LIMITER CLASS
// ============================================================================

export class RateLimiter {
  private config: RateLimitConfig;
  private queue: QueuedRequest<unknown>[] = [];
  private processing = false;
  private warningCallbacks: RateLimitWarningCallback[] = [];
  private storageKey = 'api-football-rate-limit';

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Execute a request with rate limiting
   */
  async execute<T>(requestFn: () => Promise<T>): Promise<T> {
    const status = this.getStatus();

    // Check if we've hit the daily limit
    if (status.daily.remaining <= 0) {
      throw new RateLimitError(
        'Daily rate limit exceeded. Please try again tomorrow.',
        status,
        this.getTimeUntilReset('daily')
      );
    }

    // Check if we've hit the per-minute limit
    if (status.perMinute.remaining <= 0) {
      if (!this.config.enableQueue) {
        throw new RateLimitError(
          'Per-minute rate limit exceeded. Please wait a moment.',
          status,
          this.getTimeUntilReset('minute')
        );
      }

      // Queue the request
      return this.queueRequest(requestFn);
    }

    // Check queue size limit
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new RateLimitError(
        'Request queue is full. Please try again later.',
        status,
        this.getTimeUntilReset('minute')
      );
    }

    // Execute immediately
    return this.executeRequest(requestFn);
  }

  /**
   * Get current rate limit status
   */
  getStatus(): RateLimitStatus {
    const tracking = this.getTracking();
    const now = Date.now();

    // Reset counters if needed
    if (now >= tracking.dailyResetAt) {
      tracking.dailyCount = 0;
      tracking.dailyResetAt = this.getNextDayReset();
    }

    if (now >= tracking.minuteResetAt) {
      tracking.minuteCount = 0;
      tracking.minuteResetAt = this.getNextMinuteReset();
      // Clean up old timestamps
      tracking.requestTimestamps = tracking.requestTimestamps.filter(
        (ts) => ts > now - 60000
      );
    }

    this.saveTracking(tracking);

    const dailyRemaining = Math.max(
      0,
      this.config.requestsPerDay - tracking.dailyCount
    );
    const minuteRemaining = Math.max(
      0,
      this.config.requestsPerMinute - tracking.minuteCount
    );

    const dailyPercentUsed =
      (tracking.dailyCount / this.config.requestsPerDay) * 100;
    const minutePercentUsed =
      (tracking.minuteCount / this.config.requestsPerMinute) * 100;

    const isLimited = dailyRemaining === 0 || minuteRemaining === 0;

    let nextAvailableSlot: Date | null = null;
    if (isLimited) {
      if (dailyRemaining === 0) {
        nextAvailableSlot = new Date(tracking.dailyResetAt);
      } else if (minuteRemaining === 0) {
        nextAvailableSlot = new Date(tracking.minuteResetAt);
      }
    }

    return {
      daily: {
        limit: this.config.requestsPerDay,
        used: tracking.dailyCount,
        remaining: dailyRemaining,
        resetAt: new Date(tracking.dailyResetAt),
        percentUsed: dailyPercentUsed,
      },
      perMinute: {
        limit: this.config.requestsPerMinute,
        used: tracking.minuteCount,
        remaining: minuteRemaining,
        resetAt: new Date(tracking.minuteResetAt),
        percentUsed: minutePercentUsed,
      },
      queueSize: this.queue.length,
      isLimited,
      nextAvailableSlot,
    };
  }

  /**
   * Register a warning callback
   */
  onWarning(callback: RateLimitWarningCallback): () => void {
    this.warningCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.warningCallbacks.indexOf(callback);
      if (index > -1) {
        this.warningCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Reset rate limit counters (for testing)
   */
  reset(): void {
    const tracking: RequestTracking = {
      dailyCount: 0,
      dailyResetAt: this.getNextDayReset(),
      minuteCount: 0,
      minuteResetAt: this.getNextMinuteReset(),
      requestTimestamps: [],
    };
    this.saveTracking(tracking);
    this.queue = [];
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue
   */
  clearQueue(): void {
    this.queue.forEach((req) => {
      req.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Execute a request immediately
   */
  private async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const tracking = this.getTracking();

    // Increment counters
    tracking.dailyCount++;
    tracking.minuteCount++;
    tracking.requestTimestamps.push(Date.now());
    this.saveTracking(tracking);

    // Check if we should trigger a warning
    const status = this.getStatus();
    this.checkWarningThreshold(status);

    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      // Decrement counters on error (request didn't count)
      tracking.dailyCount = Math.max(0, tracking.dailyCount - 1);
      tracking.minuteCount = Math.max(0, tracking.minuteCount - 1);
      tracking.requestTimestamps.pop();
      this.saveTracking(tracking);
      throw error;
    }
  }

  /**
   * Queue a request for later execution
   */
  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queuedRequest: QueuedRequest<T> = {
        id: this.generateRequestId(),
        execute: requestFn,
        resolve: resolve as (value: unknown) => void,
        reject,
        timestamp: Date.now(),
        retryCount: 0,
      };

      this.queue.push(queuedRequest as QueuedRequest<unknown>);
      this.processQueue();
    });
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const status = this.getStatus();

      // Check if we can process more requests
      if (status.perMinute.remaining <= 0) {
        // Wait until the next minute slot
        const waitTime = this.getTimeUntilReset('minute');
        await this.delay(waitTime);
        continue;
      }

      if (status.daily.remaining <= 0) {
        // Daily limit reached, reject all queued requests
        this.queue.forEach((req) => {
          req.reject(
            new RateLimitError(
              'Daily rate limit exceeded',
              status,
              this.getTimeUntilReset('daily')
            )
          );
        });
        this.queue = [];
        break;
      }

      // Get the next request
      const request = this.queue.shift();
      if (!request) break;

      try {
        const result = await this.executeRequest(request.execute);
        request.resolve(result);
      } catch (error) {
        // Retry logic
        if (request.retryCount < this.config.retryAttempts) {
          request.retryCount++;
          this.queue.unshift(request); // Put back at front of queue
          await this.delay(
            this.config.retryDelayMs * Math.pow(2, request.retryCount)
          );
        } else {
          request.reject(
            error instanceof Error ? error : new Error('Request failed')
          );
        }
      }

      // Wait a bit between requests to respect rate limits
      const delayBetweenRequests = 60000 / this.config.requestsPerMinute;
      await this.delay(delayBetweenRequests);
    }

    this.processing = false;
  }

  /**
   * Check if warning threshold is reached
   */
  private checkWarningThreshold(status: RateLimitStatus): void {
    const { warningThresholdPercent } = this.config;

    if (
      status.daily.percentUsed >= warningThresholdPercent ||
      status.perMinute.percentUsed >= warningThresholdPercent
    ) {
      this.warningCallbacks.forEach((callback) => callback(status));
    }
  }

  /**
   * Get tracking data from storage
   */
  private getTracking(): RequestTracking {
    try {
      if (typeof window === 'undefined') {
        // Server-side: return default tracking
        return this.getDefaultTracking();
      }

      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.getDefaultTracking();
      }

      const tracking = JSON.parse(stored) as RequestTracking;

      // Validate and sanitize
      if (
        typeof tracking.dailyCount !== 'number' ||
        typeof tracking.minuteCount !== 'number'
      ) {
        return this.getDefaultTracking();
      }

      return tracking;
    } catch {
      return this.getDefaultTracking();
    }
  }

  /**
   * Save tracking data to storage
   */
  private saveTracking(tracking: RequestTracking): void {
    try {
      if (typeof window === 'undefined') {
        // Server-side: no-op (could implement Redis/DB storage)
        return;
      }

      localStorage.setItem(this.storageKey, JSON.stringify(tracking));
    } catch {
      // Storage failed, continue without persisting
    }
  }

  /**
   * Get default tracking data
   */
  private getDefaultTracking(): RequestTracking {
    return {
      dailyCount: 0,
      dailyResetAt: this.getNextDayReset(),
      minuteCount: 0,
      minuteResetAt: this.getNextMinuteReset(),
      requestTimestamps: [],
    };
  }

  /**
   * Get timestamp for next day reset (midnight UTC)
   */
  private getNextDayReset(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * Get timestamp for next minute reset
   */
  private getNextMinuteReset(): number {
    const now = Date.now();
    return now + 60000 - (now % 60000);
  }

  /**
   * Get time until reset in milliseconds
   */
  private getTimeUntilReset(type: 'daily' | 'minute'): number {
    const tracking = this.getTracking();
    const now = Date.now();

    if (type === 'daily') {
      return Math.max(0, tracking.dailyResetAt - now);
    } else {
      return Math.max(0, tracking.minuteResetAt - now);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Default rate limiter instance for API-Football free tier
 */
export const apiFootballRateLimiter = new RateLimiter({
  requestsPerDay: 100,
  requestsPerMinute: 10,
  warningThresholdPercent: 80,
  enableQueue: true,
  maxQueueSize: 50,
  retryAttempts: 3,
  retryDelayMs: 1000,
});

/**
 * Setup warning notifications
 */
export function setupRateLimitWarnings(
  callback: RateLimitWarningCallback
): () => void {
  return apiFootballRateLimiter.onWarning(callback);
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(): RateLimitStatus {
  return apiFootballRateLimiter.getStatus();
}
