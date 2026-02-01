
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signIn, signInWithGoogle, signInWithFacebook } from '../lib/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import SocialButton from '../components/SocialButton';

interface LoginPageProps {
  onNavigate: () => void;
  onLoginSuccess: (needsOtp: boolean, email?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear errors when user types
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await signIn(formData.email, formData.password);

      if (response.success && response.user) {
        setUser(response.user);
        onLoginSuccess(false); // Login successful, no OTP needed
      } else if (response.requiresOtp) {
        // Email not verified, needs OTP
        onLoginSuccess(true, formData.email);
      } else {
        setError(response.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    if (provider === 'google') {
      signInWithGoogle();
    } else {
      signInWithFacebook();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-0 md:p-6 bg-appleGray">
      <div className="w-full md:max-w-[440px] md:min-h-0 bg-white/80 backdrop-blur-xl rounded-none md:rounded-[40px] shadow-none md:shadow-2xl md:shadow-black/5 p-8 md:p-12 border-0 md:border md:border-white/40">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6 overflow-hidden">
            <img
              src="https://img.icons8.com/fluency-systems-filled/96/ffffff/rocket.png"
              alt="SocialBoost Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-appleDark mb-2">SocialBoost</h1>
          <p className="text-gray-400 text-[15px]">Sign in to elevate your social presence</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <Input
              name="email"
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <Input
              name="password"
              label="Password"
              placeholder="••••••••"
              isPassword
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-apple p-3">
              <p className="text-[13px] text-red-600 font-medium">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Continue'}
          </Button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>

        </div>
        {/* Footer Link */}
        <div className="text-center">
          <p className="text-[14px] text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={onNavigate}
              className="text-primary font-semibold md:hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Sign up free
            </button>
          </p>
        </div>
      </div>

      {/* Policy Links */}
      <div className="mt-0 md:mt-12 hidden md:flex gap-6 text-[12px] text-gray-400 font-medium">
        <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
      </div>
    </div>
  );
};

export default LoginPage;

