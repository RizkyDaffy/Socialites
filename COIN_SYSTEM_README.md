
# Secure Coin System Setup

## Environment Variable Required
The system uses strong encryption for user balances. You MUST set the `COIN_ENC_KEY` environment variable in your `.env` or `.env.local` file.

**Format**: 32-byte key encoded in Base64.

### How to generate a key:
Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Example .env:
```
COIN_ENC_KEY=6gQQGkoTIgvkmbYL7ioWXC/Ci1iyuDGgCQtQTdj6ovjKQ=
```

> [!WARNING]
> If you change this key, all existing encrypted balances in the database will become unreadable (balance = 0). Backup your key!
