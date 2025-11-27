/**
 * Simple in-memory rate limiter for authentication endpoints
 * Tracks attempts per identifier (email/IP) with automatic cleanup
 */

interface RateLimitEntry {
    count: number
    firstAttempt: number
    resetAt: number
}

class RateLimiter {
    private attempts: Map<string, RateLimitEntry> = new Map()
    private readonly maxAttempts: number
    private readonly windowMs: number

    constructor(maxAttempts: number = 5, windowMinutes: number = 15) {
        this.maxAttempts = maxAttempts
        this.windowMs = windowMinutes * 60 * 1000

        // Cleanup old entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000)
    }

    /**
     * Check if identifier is rate limited
     * @param identifier - Email or IP address
     * @returns true if allowed, false if rate limited
     */
    check(identifier: string): boolean {
        const now = Date.now()
        const entry = this.attempts.get(identifier)

        if (!entry) {
            // First attempt
            this.attempts.set(identifier, {
                count: 1,
                firstAttempt: now,
                resetAt: now + this.windowMs,
            })
            return true
        }

        // Check if window has expired
        if (now > entry.resetAt) {
            // Reset the window
            this.attempts.set(identifier, {
                count: 1,
                firstAttempt: now,
                resetAt: now + this.windowMs,
            })
            return true
        }

        // Within window - increment count
        if (entry.count >= this.maxAttempts) {
            return false // Rate limited
        }

        entry.count++
        this.attempts.set(identifier, entry)
        return true
    }

    /**
     * Reset attempts for an identifier (e.g., after successful login)
     */
    reset(identifier: string): void {
        this.attempts.delete(identifier)
    }

    /**
     * Get remaining attempts for an identifier
     */
    getRemaining(identifier: string): number {
        const entry = this.attempts.get(identifier)
        if (!entry) return this.maxAttempts

        const now = Date.now()
        if (now > entry.resetAt) return this.maxAttempts

        return Math.max(0, this.maxAttempts - entry.count)
    }

    /**
     * Get time until reset in seconds
     */
    getResetTime(identifier: string): number {
        const entry = this.attempts.get(identifier)
        if (!entry) return 0

        const now = Date.now()
        if (now > entry.resetAt) return 0

        return Math.ceil((entry.resetAt - now) / 1000)
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = Date.now()
        for (const [key, entry] of this.attempts.entries()) {
            if (now > entry.resetAt) {
                this.attempts.delete(key)
            }
        }
    }
}

// Export singleton instances for different endpoints
export const loginRateLimiter = new RateLimiter(5, 15) // 5 attempts per 15 minutes
export const registerRateLimiter = new RateLimiter(3, 60) // 3 registrations per hour
