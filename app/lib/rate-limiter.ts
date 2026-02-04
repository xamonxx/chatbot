/**
 * =====================================================
 * RATE-LIMITER.TS - Anti Rate Limit Utilities
 * =====================================================
 * Mencegah API kena limit dengan:
 * 1. Token Bucket Rate Limiter
 * 2. Request Queue dengan Delay
 * 3. Retry dengan Exponential Backoff
 * 4. Response Caching
 * =====================================================
 */

// ============ KONFIGURASI ============
const CONFIG = {
    // Rate limit settings
    MAX_REQUESTS_PER_MINUTE: 30,  // OpenRouter free tier: ~50/min
    MIN_DELAY_BETWEEN_REQUESTS_MS: 2000, // 2 detik antara request

    // Retry settings
    MAX_RETRIES: 3,
    INITIAL_RETRY_DELAY_MS: 1000,
    MAX_RETRY_DELAY_MS: 30000,

    // Cache settings
    CACHE_TTL_MS: 5 * 60 * 1000, // 5 menit
    MAX_CACHE_SIZE: 50
};

// ============ TOKEN BUCKET RATE LIMITER ============
class TokenBucket {
    private tokens: number;
    private lastRefill: number;
    private readonly maxTokens: number;
    private readonly refillRate: number; // tokens per second

    constructor(maxTokens: number, refillRatePerMinute: number) {
        this.maxTokens = maxTokens;
        this.tokens = maxTokens;
        this.lastRefill = Date.now();
        this.refillRate = refillRatePerMinute / 60; // convert to per second
    }

    private refill(): void {
        const now = Date.now();
        const timePassed = (now - this.lastRefill) / 1000; // in seconds
        this.tokens = Math.min(this.maxTokens, this.tokens + timePassed * this.refillRate);
        this.lastRefill = now;
    }

    async acquire(): Promise<boolean> {
        this.refill();
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }

    async waitForToken(): Promise<void> {
        while (!(await this.acquire())) {
            // Wait for refill
            const waitTime = Math.ceil((1 - this.tokens) / this.refillRate * 1000);
            await delay(Math.min(waitTime, 5000));
        }
    }

    getAvailableTokens(): number {
        this.refill();
        return Math.floor(this.tokens);
    }
}

// Global rate limiter instance
const rateLimiter = new TokenBucket(
    CONFIG.MAX_REQUESTS_PER_MINUTE,
    CONFIG.MAX_REQUESTS_PER_MINUTE
);

// ============ REQUEST QUEUE ============
interface QueuedRequest<T> {
    execute: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
    priority: number;
}

class RequestQueue {
    private queue: QueuedRequest<any>[] = [];
    private processing = false;
    private lastRequestTime = 0;

    async add<T>(execute: () => Promise<T>, priority: number = 0): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ execute, resolve, reject, priority });
            // Sort by priority (higher = first)
            this.queue.sort((a, b) => b.priority - a.priority);
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const request = this.queue.shift()!;

            // Wait for rate limiter
            await rateLimiter.waitForToken();

            // Ensure minimum delay between requests
            const timeSinceLastRequest = Date.now() - this.lastRequestTime;
            if (timeSinceLastRequest < CONFIG.MIN_DELAY_BETWEEN_REQUESTS_MS) {
                await delay(CONFIG.MIN_DELAY_BETWEEN_REQUESTS_MS - timeSinceLastRequest);
            }

            try {
                this.lastRequestTime = Date.now();
                const result = await request.execute();
                request.resolve(result);
            } catch (error) {
                request.reject(error as Error);
            }
        }

        this.processing = false;
    }

    getQueueLength(): number {
        return this.queue.length;
    }
}

// Global queue instance
const requestQueue = new RequestQueue();

// ============ RESPONSE CACHE ============
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class ResponseCache<T> {
    private cache = new Map<string, CacheEntry<T>>();
    private readonly maxSize: number;
    private readonly ttlMs: number;

    constructor(maxSize: number = CONFIG.MAX_CACHE_SIZE, ttlMs: number = CONFIG.CACHE_TTL_MS) {
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
    }

    private generateKey(input: any): string {
        return JSON.stringify(input).toLowerCase().trim();
    }

    get(input: any): T | null {
        const key = this.generateKey(input);
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    set(input: any, data: T): void {
        const key = this.generateKey(input);

        // Evict oldest if full
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.ttlMs
        });
    }

    clear(): void {
        this.cache.clear();
    }

    getStats(): { size: number; maxSize: number } {
        return { size: this.cache.size, maxSize: this.maxSize };
    }
}

// Global cache for AI responses
export const aiResponseCache = new ResponseCache<string>();

// ============ RETRY WITH EXPONENTIAL BACKOFF ============
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        initialDelay?: number;
        maxDelay?: number;
        onRetry?: (attempt: number, error: Error, nextDelay: number) => void;
    } = {}
): Promise<T> {
    const maxRetries = options.maxRetries ?? CONFIG.MAX_RETRIES;
    const initialDelay = options.initialDelay ?? CONFIG.INITIAL_RETRY_DELAY_MS;
    const maxDelay = options.maxDelay ?? CONFIG.MAX_RETRY_DELAY_MS;

    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if rate limited (429) or server error (5xx)
            const isRetryable =
                error.status === 429 ||
                error.status >= 500 ||
                error.message?.includes('rate') ||
                error.message?.includes('limit') ||
                error.message?.includes('timeout') ||
                error.code === 'ETIMEDOUT' ||
                error.code === 'ECONNRESET';

            if (!isRetryable || attempt === maxRetries) {
                throw error;
            }

            // Calculate delay with exponential backoff + jitter
            const baseDelay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
            const jitter = Math.random() * 0.3 * baseDelay; // 0-30% jitter
            const delayMs = Math.floor(baseDelay + jitter);

            if (options.onRetry) {
                options.onRetry(attempt + 1, error, delayMs);
            }

            console.log(`[Rate Limit] Retry ${attempt + 1}/${maxRetries} after ${delayMs}ms`);
            await delay(delayMs);
        }
    }

    throw lastError;
}

// ============ SMART API CALLER ============
export async function smartApiCall<T>(
    input: any,
    apiFn: () => Promise<T>,
    options: {
        useCache?: boolean;
        priority?: number;
        skipQueue?: boolean;
    } = {}
): Promise<T> {
    const { useCache = true, priority = 0, skipQueue = false } = options;

    // 1. Check cache first
    if (useCache) {
        const cached = aiResponseCache.get(input);
        if (cached) {
            console.log('[Cache] Hit - returning cached response');
            return cached as T;
        }
    }

    // 2. Wrap with retry logic
    const executeWithRetry = () => retryWithBackoff(apiFn, {
        onRetry: (attempt, error, nextDelay) => {
            console.log(`[Retry] Attempt ${attempt}: ${error.message}. Next in ${nextDelay}ms`);
        }
    });

    // 3. Add to queue or execute directly
    let result: T;
    if (skipQueue) {
        await rateLimiter.waitForToken();
        result = await executeWithRetry();
    } else {
        result = await requestQueue.add(executeWithRetry, priority);
    }

    // 4. Cache the result
    if (useCache && result) {
        aiResponseCache.set(input, result as any);
    }

    return result;
}

// ============ HELPER FUNCTIONS ============
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ STATUS & MONITORING ============
export function getRateLimitStatus(): {
    availableTokens: number;
    queueLength: number;
    cacheStats: { size: number; maxSize: number };
} {
    return {
        availableTokens: rateLimiter.getAvailableTokens(),
        queueLength: requestQueue.getQueueLength(),
        cacheStats: aiResponseCache.getStats()
    };
}

// ============ EXPORTS ============
export {
    rateLimiter,
    requestQueue,
    delay,
    CONFIG as RATE_LIMIT_CONFIG
};
