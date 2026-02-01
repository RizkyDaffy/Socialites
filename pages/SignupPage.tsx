
import React, { useState } from 'react';
import { signUp } from '../lib/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import PasswordStrength from '../components/PasswordStrength';

interface SignupPageProps {
  onNavigate: () => void;
  onSignupSuccess: (email: string) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onNavigate, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    let errorMsg = '';

    if (name === 'username') {
      processedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
      if (value.length > 8) errorMsg = 'Max username length is 8 characters';
      if (/[^a-zA-Z0-9]/.test(value)) errorMsg = 'Only letters and numbers allowed';
    }

    if (name === 'email') {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        errorMsg = 'Please enter a valid email address';
      }
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    setErrors(prev => ({ ...prev, [name]: errorMsg, general: '' }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    // Check for any existing errors
    if (errors.username || errors.email || errors.password) {
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      const response = await signUp(formData.email, formData.password, formData.username);

      if (response.success) {
        // Proceed to OTP page with email
        onSignupSuccess(formData.email);
      } else {
        setErrors(prev => ({ ...prev, general: response.error || 'Failed to create account' }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, general: 'An error occurred. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-0 md:p-6 bg-appleGray md:py-12">
      <div className="w-full md:max-w-[480px] min-h-screen md:min-h-0 bg-white/80 backdrop-blur-xl rounded-none md:rounded-[40px] shadow-none md:shadow-2xl md:shadow-black/5 p-8 md:p-12 border-0 md:border md:border-white/40">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-6 overflow-hidden">
            <img
              src="https://img.icons8.com/fluency-systems-filled/96/ffffff/rocket.png"
              alt="SocialBoost Logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-appleDark mb-2">Create Account</h1>
          <p className="text-gray-400 text-[15px]">Join the next generation of social growth</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1">
            <Input
              name="username"
              label="Username"
              placeholder="Up to 8 alphanumeric chars"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <p className="text-[11px] text-red-500 font-medium px-2">{errors.username}</p>}
          </div>

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
            {errors.email && <p className="text-[11px] text-red-500 font-medium px-2">{errors.email}</p>}
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
            <PasswordStrength password={formData.password} />
            {errors.password && <p className="text-[11px] text-red-500 font-medium px-2">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <Input
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              isPassword
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <p className="text-[11px] text-red-500 font-medium px-2">{errors.confirmPassword}</p>}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-apple p-3">
              <p className="text-[13px] text-red-600 font-medium">{errors.general}</p>
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-[14px] text-gray-500">
            Already a member?{' '}
            <button
              onClick={onNavigate}
              className="text-primary font-semibold md:hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      <div className="mt-0 md:mt-12 hidden md:block text-[12px] text-gray-400 text-center max-w-sm leading-relaxed px-4">
        By creating an account, you agree to our <a href="#" className="underline">Terms</a>, <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">Cookie Use</a>.
      </div>
    </div>
  );
};

export default SignupPage;
