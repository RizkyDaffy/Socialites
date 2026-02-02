
import crypto from 'crypto';
import { decryptNumber, encryptNumber } from './coins';

const ORDER_SECRET = process.env.ORDER_SECRET || process.env.AUTH_SECRET || 'default-secret-change-me';

// Generate HMAC token
export function generateServiceToken(orderId: string, userId: string, serviceName: string, amount: number): string {
    const data = `${orderId}${userId}${serviceName}${amount}`;
    return crypto.createHmac('sha256', ORDER_SECRET).update(data).digest('hex');
}

// Generate human readable order code (e.g. SB-9281)
function generateOrderCode(): string {
    const prefix = 'SB';
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit number
    return `${prefix}-${randomNum}`;
}

export interface CreateOrderResult {
    success: boolean;
    orderId?: string;
    orderCode?: string;
    newBalance?: number;
    error?: string;
    status?: string;
}

export async function createOrderAtomic(
    userId: string,
    serviceName: string,
    serviceAmount: number,
    coinCost: number
): Promise<CreateOrderResult> {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Lock user row and check balance
        const { rows: users } = await client.query(
            'SELECT coins_encrypted FROM users WHERE id = $1 FOR UPDATE',
            [userId]
        );

        if (users.length === 0) {
            throw new Error('User not found');
        }

        const currentEncrypted = users[0].coins_encrypted;
        const currentBalance = currentEncrypted ? decryptNumber(currentEncrypted) : 0;

        if (currentBalance < coinCost) {
            throw new Error('Insufficient coins');
        }

        // 2. Deduct coins
        const newBalance = currentBalance - coinCost;
        const newEncrypted = encryptNumber(newBalance);

        await client.query(
            'UPDATE users SET coins_encrypted = $1 WHERE id = $2',
            [newEncrypted, userId]
        );

        // 3. Create Order
        const orderId = crypto.randomUUID();
        // Since we need orderId for token, and we generated it UUID above, we can use it.
        // But let's handle collision for orderCode separately if needed, though random 4 digit is weak collision resistance. 
        // For this task, I'll assume simple retry or just random is fine. 
        // Better: Check uniqueness. But for "SB-9281" style, collisions are possible.
        // I'll add a simple loop or just hope for best (or better: use timestamp part/sequence).
        // Let's just generate one. If it collides, the UNIQUE constraint will fail. 
        // For robustness, I'll retry once or twice.

        let orderCode = generateOrderCode();
        let retries = 3;
        while (retries > 0) {
            const { rows: existing } = await client.query('SELECT 1 FROM orders WHERE order_code = $1', [orderCode]);
            if (existing.length === 0) break;
            orderCode = generateOrderCode();
            retries--;
        }

        const serviceToken = generateServiceToken(orderId, userId, serviceName, serviceAmount);

        await client.query(
            `INSERT INTO orders (
                id, user_id, order_code, service_name, service_amount, coin_cost, status, service_token
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [orderId, userId, orderCode, serviceName, serviceAmount, coinCost, 'pending', serviceToken]
        );

        // 4. Audit Log
        const transactionId = crypto.randomUUID();
        const reason = `Order ${orderCode}: ${serviceName} x${serviceAmount}`;

        await client.query(
            `INSERT INTO coin_transactions (
                id, user_id, amount, type, reason, meta
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [transactionId, userId, coinCost, 'debit', reason, JSON.stringify({ orderId, orderCode })]
        );

        await client.query('COMMIT');

        return {
            success: true,
            orderId,
            orderCode,
            newBalance,
            status: 'pending'
        };

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Create order atomic error:', error);
        return { success: false, error: error.message || 'Order creation failed' };
    } finally {
        client.release();
        await pool.end();
    }
}
