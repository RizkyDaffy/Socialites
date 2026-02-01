# Quick Start - Authentication System

## 📦 Install Dependencies

```bash
npm install
```

## 🔑 Configure Environment (.env.local)

Create `.env.local` with:

```env
DATABASE_URL=your-neondb-connection-string
AUTH_SECRET=your-random-32char-secret
AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
```

## 🚀 Run the App

```bash
npm run dev
```

Opens:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## ✨ Features

✅ Email/password authentication with bcrypt hashing  
✅ Email OTP verification (4-digit code, 3min expiry)  
✅ Google OAuth social login  
✅ Facebook OAuth social login  
✅ Session persistence (30 days)  
✅ Protected routes for all pages  
✅ Auto-account creation for social logins  

## 📖 Full Documentation

See the artifacts for detailed setup instructions.

## 🎯 Testing Checklist

- [ ] Signup with email/password
- [ ] Verify with OTP code
- [ ] Login with email/password  
- [ ] Google social login
- [ ] Facebook social login
- [ ] Session persistence after refresh
- [ ] Route protection when logged out
