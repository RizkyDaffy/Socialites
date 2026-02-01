
import crypto from 'crypto';
import { sql } from '../db';

// Ensure COIN_ENC_KEY is set
const ENC_KEY_B64 = process.env.COIN_ENC_KEY;
if (!ENC_KEY_B64) {
    console.warn('WARNING: COIN_ENC_KEY is not set. Coin system will fail if used.');
}

const key = ENC_KEY_B64 ? Buffer.from(ENC_KEY_B64, 'base64') : Buffer.alloc(32); // Fallback to avoid startup crash, but should fail on use

export function encryptNumber(n: number): string {
    if (!ENC_KEY_B64) throw new Error('COIN_ENC_KEY not configured');

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const pt = Buffer.from(String(n));
    const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Format: iv:ciphertext:tag (all base64)
    return `${iv.toString('base64')}:${ct.toString('base64')}:${tag.toString('base64')}`;
}

export function decryptNumber(token: string): number {
    if (!ENC_KEY_B64) throw new Error('COIN_ENC_KEY not configured');
    if (!token) return 0; // Treat empty/null as 0

    try {
        const [ivB, ctB, tagB] = token.split(':').map(s => Buffer.from(s, 'base64'));
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivB);
        decipher.setAuthTag(tagB);
        const pt = Buffer.concat([decipher.update(ctB), decipher.final()]);
        return Number(pt.toString());
    } catch (error) {
        console.error('Decryption failed:', error);
        // In a real system, might want to throw, but for safety return 0 or handle upstream
        throw new Error('Failed to decrypt balance');
    }
}

export interface CoinTransactionResult {
    success: boolean;
    newBalance: number;
    transactionId?: string;
    error?: string;
    idempotent?: boolean;
}

export async function addCoinsAtomic(
    userId: string,
    amount: number,
    reason: string,
    idempotencyKey?: string,
    type: 'credit' | 'debit' = 'credit'
): Promise<CoinTransactionResult> {
    const { Pool } = await import('pg');
    // Create a new pool for this transaction. 
    // In production, this should reuse a shared pool instance from db.ts if exported, 
    // but better-auth uses its own pool which isn't easily accessible here without refactor.
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check idempotency if key provided
        // We check inside transaction to be safe or use the table constraint
        if (idempotencyKey) {
            const { rows: existing } = await client.query(
                'SELECT response FROM coin_idempotency WHERE user_id = $1 AND idempotency_key = $2',
                [userId, idempotencyKey]
            );

            if (existing.length > 0) {
                await client.query('ROLLBACK');
                return { ...existing[0].response, idempotent: true };
            }
        }

        // 2. Lock user row
        const { rows: users } = await client.query(
            'SELECT coins_encrypted FROM users WHERE id = $1 FOR UPDATE',
            [userId]
        );

        if (users.length === 0) {
            throw new Error('User not found');
        }

        const currentEncrypted = users[0].coins_encrypted;
        const currentBalance = currentEncrypted ? decryptNumber(currentEncrypted) : 0;

        // Calculate new balance
        let newBalance = currentBalance;
        if (type === 'credit') {
            newBalance += amount;
        } else {
            newBalance -= amount;
            if (newBalance < 0) {
                // Optional: Allow negative? Assuming no for now.
                throw new Error('Insufficient funds');
            }
        }

        // Encrypt new balance
        const newEncrypted = encryptNumber(newBalance);

        // Update user
        await client.query(
            'UPDATE users SET coins_encrypted = $1 WHERE id = $2',
            [newEncrypted, userId]
        );

        // Log transaction
        const transactionId = crypto.randomUUID();
        const meta = idempotencyKey ? JSON.stringify({ idempotencyKey }) : null;

        await client.query(
            'INSERT INTO coin_transactions (id, user_id, amount, type, reason, meta) VALUES ($1, $2, $3, $4, $5, $6)',
            [transactionId, userId, amount, type, reason, meta]
        );

        const result = { success: true, newBalance, transactionId };

        // Store idempotency result if key provided
        if (idempotencyKey) {
            await client.query(
                'INSERT INTO coin_idempotency (user_id, idempotency_key, response) VALUES ($1, $2, $3)',
                [userId, idempotencyKey, result]
            );
        }

        await client.query('COMMIT');
        return result;

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Add coins atomic error:', error);
        return { success: false, newBalance: 0, error: error.message || 'Transaction failed' };
    } finally {
        client.release();
        await pool.end();
    }
}
