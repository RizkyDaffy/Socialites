// Authentication client for communicating with the backend API

const API_URL = '/api/auth'; // Uses Vite proxy

export interface User {
    id: string;
    email: string;
    name: string | null;
    isVerified: boolean;
    image?: string | null;
}

export interface AuthResponse {
    success: boolean;
    sessionId?: string;
    user?: User;
    error?: string;
    message?: string;
    requiresOtp?: boolean;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: 'Failed to sign up. Please try again.', };
    }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.sessionId) {
            localStorage.setItem('sessionId', data.sessionId);
        }

        return data;
    } catch (error) {
        console.error('Signin error:', error);
        return { success: false, error: 'Failed to sign in. Please try again.' };
    }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(email: string, code: string): Promise<AuthResponse> {
    try {
        const response = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });

        const data = await response.json();

        if (data.sessionId) {
            localStorage.setItem('sessionId', data.sessionId);
        }

        return data;
    } catch (error) {
        console.error('OTP verification error:', error);
        return { success: false, error: 'Failed to verify OTP. Please try again.' };
    }
}

/**
 * Resend OTP code
 */
export async function resendOTP(email: string): Promise<AuthResponse> {
    try {
        const response = await fetch(`${API_URL}/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Resend OTP error:', error);
        return { success: false, error: 'Failed to resend OTP. Please try again.' };
    }
}

/**
 * Get current session
 */
export async function getSession(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const sessionId = localStorage.getItem('sessionId');

        if (!sessionId) {
            return { success: false, error: 'No active session' };
        }

        const response = await fetch(`${API_URL}/session`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionId}`,
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get session error:', error);
        return { success: false, error: 'Failed to get session' };
    }
}

/**
 * ADDED: TTL HEARTBEAT
 * Send heartbeat to keep session alive
 */
export async function sendHeartbeat(): Promise<{ success: boolean; error?: string; extended?: boolean }> {
    try {
        const sessionId = localStorage.getItem('sessionId');

        if (!sessionId) {
            return { success: false, error: 'No active session' };
        }

        const response = await fetch(`${API_URL}/session/heartbeat`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionId}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // Session expired or invalid
            if (response.status === 401) {
                localStorage.removeItem('sessionId');
            }
            return { success: false, error: data.error || 'Heartbeat failed' };
        }

        return data;
    } catch (error) {
        console.error('Heartbeat error:', error);
        return { success: false, error: 'Failed to send heartbeat' };
    }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
    try {
        const sessionId = localStorage.getItem('sessionId');

        if (sessionId) {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                },
            });
        }

        localStorage.removeItem('sessionId');
    } catch (error) {
        console.error('Signout error:', error);
        localStorage.removeItem('sessionId');
    }
}

/**
 * Sign in with Google (Social Login)
 */
export function signInWithGoogle(): void {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_URL}/oauth/google`;
}

/**
 * Sign in with Facebook (Social Login)
 */
export function signInWithFacebook(): void {
    // Redirect to Facebook OAuth endpoint
    window.location.href = `${API_URL}/oauth/facebook`;
}

/**
 * Mask email for privacy
 */
export function maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;

    const maskedLocal = localPart[0] + '***';
    return `${maskedLocal}@${domain}`;
}
