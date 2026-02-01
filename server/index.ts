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
