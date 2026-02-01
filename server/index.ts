import './bootstrap';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { betterAuth } from 'better-auth';
import { sql, initializeDatabase } from './db';
import { generateOTP, sendOTPEmail } from './mailer';
import { Pool } from 'pg';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon to use WebSocket for Better Auth compatibility
neonConfig.webSocketConstructor = ws;

const app = express();
const PORT = process.env.PORT || 3000;

// Create a PostgreSQL pool for Better Auth
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Initialize Better Auth with pool connection
// IMPORTANT: baseURL should be where the frontend is accessed (port 5173)
// because OAuth callbacks redirect users back to the frontend
const auth = betterAuth({
    database: pool as any,
    emailAndPassword: {
        enabled: false, // We handle this manually
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            redirectURI: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/auth/callback/google`,
        },
        facebook: {
            clientId: process.env.FACEBOOK_APP_ID!,
            clientSecret: process.env.FACEBOOK_APP_SECRET!,
            redirectURI: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/auth/callback/facebook`,
        },
    },
    secret: process.env.AUTH_SECRET!,
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Better Auth handlers for OAuth ONLY - must be before custom routes
app.all('/api/auth/oauth/*', auth.handler);
app.all('/api/auth/callback/*', auth.handler);

// Sign up endpoint (email/password - custom implementation)
app.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user with better-auth (it will hash the password with bcrypt)
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Hash password using bcrypt (we'll import it properly)
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        await sql`
      INSERT INTO users (id, email, password, name, is_verified, created_at, updated_at)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${name || ''}, FALSE, NOW(), NOW())
    `;

        // Generate and send OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

        await sql`
      INSERT INTO otp_codes (email, code, expires_at)
      VALUES (${email}, ${otpCode}, ${expiresAt})
    `;

        // Send OTP email
        await sendOTPEmail(email, otpCode);

        res.status(201).json({
            success: true,
            message: 'Account created. Please verify your email with the OTP sent.',
            userId,
            email,
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account', details: error.message });
    }
});

// Login endpoint (email/password)
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user from database
        const users = await sql`
      SELECT id, email, password, is_verified, name FROM users WHERE email = ${email}
    `;

        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password using bcrypt
        const bcrypt = await import('bcrypt');
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.is_verified) {
            // Generate new OTP for unverified users
            const otpCode = generateOTP();
            const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

            await sql`
        INSERT INTO otp_codes (email, code, expires_at)
        VALUES (${email}, ${otpCode}, ${expiresAt})
      `;

            await sendOTPEmail(email, otpCode);

            return res.status(403).json({
                error: 'Email not verified',
                requiresOtp: true,
                message: 'A new OTP has been sent to your email.',
            });
        }

        // Create session
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        // ADDED: TTL HEARTBEAT - 5 minutes TTL instead of 30 days
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await sql`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${expiresAt})
    `;

        res.json({
            success: true,
            sessionId,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isVerified: user.is_verified,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login', details: error.message });
    }
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        // Get OTP from database
        const otps = await sql`
      SELECT id, code, expires_at FROM otp_codes 
      WHERE email = ${email} 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

        if (!otps || otps.length === 0) {
            return res.status(404).json({ error: 'No OTP found for this email' });
        }

        const otp = otps[0];

        // Check if expired
        if (new Date() > new Date(otp.expires_at)) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // Verify code
        if (otp.code !== code) {
            return res.status(400).json({ error: 'Invalid OTP code' });
        }

        // Update user as verified
        await sql`
      UPDATE users 
      SET is_verified = TRUE, email_verified_at = NOW(), updated_at = NOW()
      WHERE email = ${email}
    `;

        // Delete used OTP
        await sql`
      DELETE FROM otp_codes WHERE id = ${otp.id}
    `;

        // Get user and create session
        const users = await sql`
      SELECT id, email, name, is_verified FROM users WHERE email = ${email}
    `;

        const user = users[0];
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        // ADDED: TTL HEARTBEAT - 5 minutes TTL instead of 30 days
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await sql`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${expiresAt})
    `;

        res.json({
            success: true,
            message: 'Email verified successfully',
            sessionId,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isVerified: user.is_verified,
            },
        });
    } catch (error: any) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Failed to verify OTP', details: error.message });
    }
});

// Resend OTP endpoint
app.post('/api/auth/resend-otp', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const users = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate new OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

        await sql`
      INSERT INTO otp_codes (email, code, expires_at)
      VALUES (${email}, ${otpCode}, ${expiresAt})
    `;

        await sendOTPEmail(email, otpCode);

        res.json({ success: true, message: 'OTP resent successfully' });
    } catch (error: any) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend OTP', details: error.message });
    }
});

// Get session endpoint
app.get('/api/auth/session', async (req: Request, res: Response) => {
    try {
        const sessionId = req.headers.authorization?.replace('Bearer ', '');

        if (!sessionId) {
            return res.status(401).json({ error: 'No session provided' });
        }

        // Get session from database
        const sessions = await sql`
      SELECT s.id, s.user_id, s.expires_at, u.email, u.name, u.is_verified, u.image
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId}
    `;

        if (!sessions || sessions.length === 0) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        const session = sessions[0];

        // Check if expired
        if (new Date() > new Date(session.expires_at)) {
            await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
            return res.status(401).json({ error: 'Session expired' });
        }

        res.json({
            success: true,
            user: {
                id: session.user_id,
                email: session.email,
                name: session.name,
                isVerified: session.is_verified,
                image: session.image,
            },
        });
    } catch (error: any) {
        console.error('Session check error:', error);
        res.status(500).json({ error: 'Failed to check session', details: error.message });
    }
});

// ADDED: TTL HEARTBEAT - Heartbeat endpoint to extend session lifetime
app.post('/api/auth/session/heartbeat', async (req: Request, res: Response) => {
    try {
        const sessionId = req.headers.authorization?.replace('Bearer ', '');

        if (!sessionId) {
            return res.status(401).json({ error: 'No session provided' });
        }

        // Get session from database
        const sessions = await sql`
      SELECT id, user_id, expires_at, updated_at
      FROM sessions
      WHERE id = ${sessionId}
    `;

        if (!sessions || sessions.length === 0) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        const session = sessions[0];

        // Check if already expired
        const now = new Date();
        if (now > new Date(session.expires_at)) {
            await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
            return res.status(401).json({ error: 'Session expired' });
        }

        // ADDED: TTL HEARTBEAT - Only extend if expires_at - now < 2 minutes (threshold)
        const timeRemaining = new Date(session.expires_at).getTime() - now.getTime();
        const TWO_MINUTES_MS = 2 * 60 * 1000;

        if (timeRemaining < TWO_MINUTES_MS) {
            // Extend session by 5 minutes
            const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

            await sql`
        UPDATE sessions
        SET expires_at = ${newExpiresAt}, updated_at = NOW()
        WHERE id = ${sessionId}
      `;

            return res.json({
                success: true,
                extended: true,
                message: 'Session extended'
            });
        }

        // Just update the updated_at timestamp
        await sql`
      UPDATE sessions
      SET updated_at = NOW()
      WHERE id = ${sessionId}
    `;

        res.json({
            success: true,
            extended: false,
            message: 'Heartbeat received'
        });
    } catch (error: any) {
        console.error('Heartbeat error:', error);
        res.status(500).json({ error: 'Failed to process heartbeat', details: error.message });
    }
});

// ADDED: COIN SYSTEM imports
import { decryptNumber, addCoinsAtomic } from './utils/coins';

// ADDED: COIN SYSTEM - Get balance and daily status
app.get('/api/coins', async (req: Request, res: Response) => {
    try {
        const sessionId = req.headers.authorization?.replace('Bearer ', '');
        if (!sessionId) return res.status(401).json({ error: 'Unauthorized' });

        const sessions = await sql`SELECT user_id FROM sessions WHERE id = ${sessionId}`;
        if (!sessions.length) return res.status(401).json({ error: 'Invalid session' });
        const userId = sessions[0].user_id;

        const users = await sql`
            SELECT coins_encrypted, daily_last_claimed_at, daily_streak_day 
            FROM users WHERE id = ${userId}
        `;
        if (!users.length) return res.status(404).json({ error: 'User not found' });
        const user = users[0];

        const balance = user.coins_encrypted ? decryptNumber(user.coins_encrypted) : 0;

        // Calculate next reward info
        const now = new Date();
        const lastClaim = user.daily_last_claimed_at ? new Date(user.daily_last_claimed_at) : null;

        let streakDay = user.daily_streak_day || 0;
        let canClaim = false;
        let timeUntilNextClaim = 0;

        if (!lastClaim) {
            canClaim = true;
            streakDay = 1;
        } else {
            const yesterday = new Date(now);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            yesterday.setUTCHours(0, 0, 0, 0);

            const lastClaimDate = new Date(lastClaim);
            lastClaimDate.setUTCHours(0, 0, 0, 0);

            const today = new Date(now);
            today.setUTCHours(0, 0, 0, 0);

            if (lastClaimDate.getTime() === today.getTime()) {
                // Already claimed today
                canClaim = false;
                // Time until tomorrow 00:00 UTC (or local? prompt said UTC)
                // Let's stick to UTC for consistency
                const tomorrow = new Date(today);
                tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
                timeUntilNextClaim = tomorrow.getTime() - now.getTime();
            } else if (lastClaimDate.getTime() === yesterday.getTime()) {
                // Claimed yesterday, streak continues
                canClaim = true;
                streakDay = Math.min((user.daily_streak_day || 0) + 1, 7);
            } else {
                // Streak broken
                canClaim = true;
                streakDay = 1;
            }
        }

        const dailyRewards = [
            { day: 1, amount: 5 },
            { day: 2, amount: 5 },
            { day: 3, amount: 10 },
            { day: 4, amount: 5 },
            { day: 5, amount: 5 },
            { day: 6, amount: 5 },
            { day: 7, amount: 50 },
        ];

        const nextReward = dailyRewards.find(r => r.day === streakDay) || dailyRewards[0];

        res.json({
            coins: balance,
            daily: {
                claimedToday: !canClaim,
                streakDay: user.daily_streak_day || 0, // Current stored streak
                nextStreakDay: streakDay, // What they will get on claim
                nextReward: nextReward.amount,
                timeUntilNextClaim,
                canClaim
            }
        });
    } catch (error: any) {
        console.error('Get coins error:', error);
        res.status(500).json({ error: 'Failed to get coins' });
    }
});

// ADDED: COIN SYSTEM - Get daily status (alias/specialized)
app.get('/api/daily/status', async (req: Request, res: Response) => {
    // Re-use logic or redirect? Let's just forward to coins which has all info
    // For cleaner code in frontend, we'll keep it separate if needed, but the requirements said specific endpoint.
    // We can implement it same as above or just one endpoint.
    // Let's copy logic briefly or refactor. For 'patch-style', I'll just copy the needed parts to avoid refactoring the whole file structure.

    // Actually, let's just use the logic from /api/coins, filtering output if needed.
    // But to save space and time, I will make the frontend call /api/coins for everything.
    // However, the prompt ASKED for GET /api/daily/status.

    try {
        const sessionId = req.headers.authorization?.replace('Bearer ', '');
        if (!sessionId) return res.status(401).json({ error: 'Unauthorized' });

        const sessions = await sql`SELECT user_id FROM sessions WHERE id = ${sessionId}`;
        if (!sessions.length) return res.status(401).json({ error: 'Invalid session' });
        const userId = sessions[0].user_id;

        const users = await sql`
            SELECT daily_last_claimed_at, daily_streak_day 
            FROM users WHERE id = ${userId}
        `;
        if (!users.length) return res.status(404).json({ error: 'User not found' });
        const user = users[0];

        const now = new Date();
        const lastClaim = user.daily_last_claimed_at ? new Date(user.daily_last_claimed_at) : null;

        let streakDay = 1;
        let canClaim = true;
        let claimedToday = false;

        if (lastClaim) {
            const yesterday = new Date(now);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            yesterday.setUTCHours(0, 0, 0, 0);

            const lastClaimDate = new Date(lastClaim);
            lastClaimDate.setUTCHours(0, 0, 0, 0);

            const today = new Date(now);
            today.setUTCHours(0, 0, 0, 0);

            if (lastClaimDate.getTime() === today.getTime()) {
                claimedToday = true;
                canClaim = false;
                streakDay = user.daily_streak_day;
            } else if (lastClaimDate.getTime() === yesterday.getTime()) {
                streakDay = Math.min(user.daily_streak_day + 1, 7);
            } else {
                streakDay = 1;
            }
        }

        const dailyRewards = [
            { day: 1, amount: 5 },
            { day: 2, amount: 5 },
            { day: 3, amount: 10 },
            { day: 4, amount: 5 },
            { day: 5, amount: 5 },
            { day: 6, amount: 5 },
            { day: 7, amount: 50 },
        ];

        res.json({
            streakDay, // The day they are ON or will CLAIM
            claimedToday,
            rewards: dailyRewards
        });
    } catch (error) {
        res.status(500).json({ error: 'Status error' });
    }
});

// ADDED: COIN SYSTEM - Claim Daily Reward
app.post('/api/daily/claim', async (req: Request, res: Response) => {
    try {
        const sessionId = req.headers.authorization?.replace('Bearer ', '');
        const idempotencyKey = req.headers['idempotency-key'] as string;

        if (!sessionId) return res.status(401).json({ error: 'Unauthorized' });
        if (!idempotencyKey) return res.status(400).json({ error: 'Idempotency-Key header is required' });

        const sessions = await sql`SELECT user_id FROM sessions WHERE id = ${sessionId}`;
        if (!sessions.length) return res.status(401).json({ error: 'Invalid session' });
        const userId = sessions[0].user_id;

        // Check if already claimed today
        const users = await sql`SELECT daily_last_claimed_at, daily_streak_day FROM users WHERE id = ${userId}`;
        const user = users[0];

        const now = new Date();
        const lastClaim = user.daily_last_claimed_at ? new Date(user.daily_last_claimed_at) : null;

        if (lastClaim) {
            const today = new Date(now);
            today.setUTCHours(0, 0, 0, 0);
            const lastClaimDate = new Date(lastClaim);
            lastClaimDate.setUTCHours(0, 0, 0, 0);

            if (lastClaimDate.getTime() === today.getTime()) {
                // Double check idempotency will handle the specific transaction, but logic check first
                // However, if we are retrying the SAME claim, idempotency logic in utils/coins should return success.
                // But if this is a NEW request for same day, reject.
                // We'll let the atomic function handle the balance, but we must calculate amount first.
            }
        }

        // Logic to determine amount
        let streakDay = 1;
        if (lastClaim) {
            const yesterday = new Date(now);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            yesterday.setUTCHours(0, 0, 0, 0);
            const lastClaimDate = new Date(lastClaim);
            lastClaimDate.setUTCHours(0, 0, 0, 0);
            const today = new Date(now);
            today.setUTCHours(0, 0, 0, 0);

            if (lastClaimDate.getTime() === today.getTime()) {
                return res.status(400).json({ error: 'Already claimed today' });
            } else if (lastClaimDate.getTime() === yesterday.getTime()) {
                streakDay = Math.min((user.daily_streak_day || 0) + 1, 7);
            }
        }

        const dailyRewards = [
            { day: 1, amount: 5 },
            { day: 2, amount: 5 },
            { day: 3, amount: 10 },
            { day: 4, amount: 5 },
            { day: 5, amount: 5 },
            { day: 6, amount: 5 },
            { day: 7, amount: 50 },
        ];
        const reward = dailyRewards.find(r => r.day === streakDay) || dailyRewards[0];

        // Atomic Add
        const result = await addCoinsAtomic(userId, reward.amount, `Daily Claim Day ${streakDay}`, idempotencyKey);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        // Update user daily stats if successful (and not just idempotent replay)
        if (!result.idempotent) {
            await sql`
                UPDATE users 
                SET daily_last_claimed_at = NOW(), 
                    daily_streak_day = ${streakDay}
                WHERE id = ${userId}
            `;
        }

        res.json({
            success: true,
            balance: result.newBalance,
            added: reward.amount,
            streakDay,
            transactionId: result.transactionId
        });

    } catch (error: any) {
        console.error('Claim error:', error);
        res.status(500).json({ error: 'Claim failed' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
        const sessionId = req.headers.authorization?.replace('Bearer ', '');

        if (sessionId) {
            await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout', details: error.message });
    }
});

// Start server
async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📧 Email service: ${process.env.RESEND_API_KEY ? 'Configured' : 'Not configured'}`);
            console.log(`🔐 OAuth: Google ${process.env.GOOGLE_CLIENT_ID ? '✓' : '✗'}, Facebook ${process.env.FACEBOOK_APP_ID ? '✓' : '✗'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
