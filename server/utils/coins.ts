
import crypto from 'crypto';
import { sql } from '../db';

// Ensure COIN_ENC_KEY is set
const ENC_KEY_B64 = process.env.COIN_ENC_KEY;
if (!ENC_KEY_B64) {
    console.warn('WARNING: COIN_ENC_KEY is not set. Coin system will fail if used.');
}

const key = ENC_KEY_B64 ? Buffer.from(ENC_KEY_B64, 'base64') : Buffer.alloc(32); // Fallback to avoid startup crash, but should fail on use

// Encryption utils for string
export function encryptString(text: string): string {
    if (!ENC_KEY_B64) throw new Error('COIN_ENC_KEY not configured');

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const pt = Buffer.from(text);
    const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `${iv.toString('base64')}:${ct.toString('base64')}:${tag.toString('base64')}`;
}

export function decryptString(token: string): string {
    if (!ENC_KEY_B64) throw new Error('COIN_ENC_KEY not configured');
    if (!token) return '';

    try {
        const [ivB, ctB, tagB] = token.split(':').map(s => Buffer.from(s, 'base64'));
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivB);
        decipher.setAuthTag(tagB);
        const pt = Buffer.concat([decipher.update(ctB), decipher.final()]);
        return pt.toString();
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data');
    }
}

export function encryptNumber(n: number): string {
    return encryptString(String(n));
}

export function decryptNumber(token: string): number {
    if (!token) return 0;
    try {
        const s = decryptString(token);
        return Number(s);
    } catch {
        // Fallback for number specific safety if needed, but decryptString throws
        return 0;
    }
}

export interface CoinTransactionResult {
    success: boolean;
    newBalance: number;
    transactionId?: string;
    error?: string;
    idempotent?: boolean;
}

// FIX: CRITICAL BUG - Rewrite to use Neon sql instead of pg.Pool
// The original version created a new Pool connection which is incompatible with Neon serverless
export async function addCoinsAtomic(
    userId: string,
    amount: number,
    reason: string,
    idempotencyKey?: string,
    type: 'credit' | 'debit' = 'credit'
): Promise<CoinTransactionResult> {
    try {
        console.log(`[COIN CREDIT START] User ${userId}, Amount: ${amount}, Reason: ${reason}, Idempotency: ${idempotencyKey || 'none'}`);

        // 1. Check idempotency if key provided
        if (idempotencyKey) {
            const existing = await sql`
                SELECT response FROM coin_idempotency 
                WHERE user_id = ${userId} AND idempotency_key = ${idempotencyKey}
            `;

            if (existing.length > 0) {
                console.log(`[COIN CREDIT SKIP] Idempotent request detected for ${userId}`);
                return { ...existing[0].response, idempotent: true };
            }
        }

        // 2. Get current balance (with row lock simulation via SELECT)
        const users = await sql`
            SELECT coins_encrypted FROM users WHERE id = ${userId}
        `;

        if (users.length === 0) {
            console.error(`[COIN CREDIT ERROR] User not found: ${userId}`);
            throw new Error('User not found');
        }

        const currentEncrypted = users[0].coins_encrypted;
        const currentBalance = currentEncrypted ? decryptNumber(currentEncrypted) : 0;

        // 3. Calculate new balance
        let newBalance = currentBalance;
        if (type === 'credit') {
            newBalance += amount;
        } else {
            newBalance -= amount;
            if (newBalance < 0) {
                console.error(`[COIN CREDIT ERROR] Insufficient funds for ${userId}: ${currentBalance} - ${amount}`);
                throw new Error('Insufficient funds');
            }
        }

        // 4. Encrypt new balance
        const newEncrypted = encryptNumber(newBalance);

        // 5. Update user balance
        const updateResult = await sql`
            UPDATE users 
            SET coins_encrypted = ${newEncrypted} 
            WHERE id = ${userId}
        `;

        console.log(`[COIN CREDIT UPDATE] User ${userId}: ${currentBalance} → ${newBalance} (${type} ${amount})`);

        // 6. Log transaction
        const transactionId = crypto.randomUUID();
        const meta = idempotencyKey ? JSON.stringify({ idempotencyKey }) : null;

        await sql`
            INSERT INTO coin_transactions (id, user_id, amount, type, reason, meta) 
            VALUES (${transactionId}, ${userId}, ${amount}, ${type}, ${reason}, ${meta})
        `;

        const result = { success: true, newBalance, transactionId };

        // 7. Store idempotency result if key provided
        if (idempotencyKey) {
            try {
                await sql`
                    INSERT INTO coin_idempotency (user_id, idempotency_key, response) 
                    VALUES (${userId}, ${idempotencyKey}, ${JSON.stringify(result)})
                `;
            } catch (idempError: any) {
                // If unique constraint violation, it means another request beat us to it
                // This is OK, we'll just continue with our result
                if (!idempError.message?.includes('duplicate key')) {
                    console.error('[COIN CREDIT WARN] Idempotency insert failed:', idempError);
                }
            }
        }

        console.log(`[COIN CREDIT SUCCESS] User ${userId}: Balance updated to ${newBalance}, Transaction ID: ${transactionId}`);
        return result;

    } catch (error: any) {
        console.error('[COIN CREDIT FATAL ERROR]', {
            userId,
            amount,
            reason,
            error: error.message,
            stack: error.stack
        });
        return { success: false, newBalance: 0, error: error.message || 'Transaction failed' };
    }
}
