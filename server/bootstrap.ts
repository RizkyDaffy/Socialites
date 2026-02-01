import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not loaded');
    process.exit(1);
}
