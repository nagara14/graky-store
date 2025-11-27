/**
 * Password validation utilities
 */

export interface PasswordValidationResult {
    valid: boolean
    errors: string[]
}

/**
 * Validate password strength with comprehensive rules
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = []

    if (!password || password.length < 8) {
        errors.push('Password minimal 8 karakter')
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password harus mengandung minimal 1 huruf besar')
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password harus mengandung minimal 1 huruf kecil')
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password harus mengandung minimal 1 angka')
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    if (!email) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    if (!input) return ''
    return input.trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .slice(0, 500) // Limit length
}
