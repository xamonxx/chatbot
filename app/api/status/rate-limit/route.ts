import { NextResponse } from 'next/server';
import { getRateLimitStatus, RATE_LIMIT_CONFIG } from '../../../lib/rate-limiter';

/**
 * API untuk memonitor status rate limiter
 * GET /api/status/rate-limit
 */
export async function GET() {
    try {
        const status = getRateLimitStatus();

        return NextResponse.json({
            success: true,
            status: 'healthy',
            rateLimiter: {
                availableTokens: status.availableTokens,
                maxTokensPerMinute: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE,
                queueLength: status.queueLength,
                minDelayBetweenRequests: RATE_LIMIT_CONFIG.MIN_DELAY_BETWEEN_REQUESTS_MS + 'ms'
            },
            cache: {
                currentSize: status.cacheStats.size,
                maxSize: status.cacheStats.maxSize,
                ttl: RATE_LIMIT_CONFIG.CACHE_TTL_MS / 1000 + 's'
            },
            retryConfig: {
                maxRetries: RATE_LIMIT_CONFIG.MAX_RETRIES,
                initialDelay: RATE_LIMIT_CONFIG.INITIAL_RETRY_DELAY_MS + 'ms',
                maxDelay: RATE_LIMIT_CONFIG.MAX_RETRY_DELAY_MS + 'ms'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
