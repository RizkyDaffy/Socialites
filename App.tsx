
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OtpPage from './pages/OtpPage';
import DashboardPage from './pages/DashboardPage';
import EarnCoinsPage from './pages/EarnCoinsPage';
import MissionPage from './pages/MissionPage';
import ServicesPage from './pages/ServicesPage';
import BuyCoinsPage from './pages/BuyCoinsPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import BonusHarianPage from './pages/BonusHarianPage';

type Page = 'login' | 'signup' | 'otp' | 'dashboard' | 'earnCoins' | 'mission' | 'services' | 'buyCoins' | 'orderHistory' | 'dailyBonus';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [pendingEmail, setPendingEmail] = useState<string>('');

  // Handle successful login
  const handleLoginSuccess = (needsOtp: boolean, email?: string) => {
    if (needsOtp && email) {
      // User exists but email not verified - go to OTP
      setPendingEmail(email);
      setCurrentPage('otp');
    } else {
      // Fully authenticated - go to dashboard
      setCurrentPage('dashboard');
    }
  };

  // Handle successful signup
  const handleSignupSuccess = (email: string) => {
    setPendingEmail(email);
    setCurrentPage('otp');
  };

  // Handle successful OTP verification
  const handleOtpVerified = () => {
    setCurrentPage('dashboard');
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setCurrentPage('login');
  };

  // If user is already authenticated, show app content
  if (isAuthenticated && user) {
    // If on login/signup/otp pages but authenticated, redirect to dashboard
    if (['login', 'signup', 'otp'].includes(currentPage)) {
      setCurrentPage('dashboard');
    }

    return (
      <ProtectedRoute redirectTo={() => setCurrentPage('login')}>
        {currentPage === 'dashboard' && (
          <DashboardPage
            onGetCoins={() => setCurrentPage('earnCoins')}
            onBuyCoins={() => setCurrentPage('buyCoins')}
            onOrderHistory={() => setCurrentPage('orderHistory')}
            onServices={() => setCurrentPage('services')}
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'earnCoins' && (
          <EarnCoinsPage
            onBack={() => setCurrentPage('dashboard')}
            onMissionClick={() => setCurrentPage('mission')}
            onServicesClick={() => setCurrentPage('services')}
            onBuyCoinsClick={() => setCurrentPage('buyCoins')}
            onOrderHistoryClick={() => setCurrentPage('orderHistory')}
            onDailyBonusClick={() => setCurrentPage('dailyBonus')}
          />
        )}
        {currentPage === 'mission' && (
          <MissionPage onBack={() => setCurrentPage('earnCoins')} />
        )}
        {currentPage === 'services' && (
          <ServicesPage onBack={() => setCurrentPage('earnCoins')} />
        )}
        {currentPage === 'buyCoins' && (
          <BuyCoinsPage onBack={() => setCurrentPage('earnCoins')} />
        )}
        {currentPage === 'orderHistory' && (
          <OrderHistoryPage onBack={() => setCurrentPage('earnCoins')} />
        )}
        {currentPage === 'dailyBonus' && (
          <BonusHarianPage onBack={() => setCurrentPage('earnCoins')} />
        )}
      </ProtectedRoute>
    );
  }

  // Show authentication pages for non-authenticated users
  return (
    <div className="min-h-screen transition-opacity duration-500">
      {currentPage === 'login' && (
        <LoginPage
          onNavigate={() => setCurrentPage('signup')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentPage === 'signup' && (
        <SignupPage
          onNavigate={() => setCurrentPage('login')}
          onSignupSuccess={handleSignupSuccess}
        />
      )}
      {currentPage === 'otp' && pendingEmail && (
        <OtpPage
          email={pendingEmail}
          onBack={() => setCurrentPage('signup')}
          onVerify={handleOtpVerified}
        />
      )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
