
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { verifyOTP, resendOTP, maskEmail } from '../lib/auth';
import Button from '../components/Button';

interface OtpPageProps {
  email: string;
  onBack: () => void;
  onVerify: () => void;
}

const OtpPage: React.FC<OtpPageProps> = ({ email, onBack, onVerify }) => {
  const { setUser } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(179); // 02:59 in seconds
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}.${secs.toString().padStart(2, '0')}`;
  };

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    const char = value.slice(-1);
    newOtp[index] = char;
    setOtp(newOtp);
    setError(''); // Clear error when user types

    // Auto-focus next input
    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');

    if (code.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyOTP(email, code);

      if (response.success && response.user) {
        setUser(response.user);
        onVerify(); // Navigate to dashboard
      } else {
        setError(response.error || 'Invalid verification code');
        setOtp(['', '', '', '']); // Clear OTP
        inputRefs[0].current?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await resendOTP(email);

      if (response.success) {
        setTimer(179); // Reset timer
        setOtp(['', '', '', '']); // Clear input
        inputRefs[0].current?.focus();
      } else {
        setError(response.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-[400px] flex flex-col items-center">

        {/* Back Button */}
        <button
          onClick={onBack}
          className="self-start mb-8 text-gray-400 hover:text-appleDark transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>

        {/* Content */}
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-[28px] font-bold text-appleDark">We've sent you a code</h1>
          <p className="text-gray-500 text-[15px]">Enter the code sent to</p>
          <p className="text-appleDark font-bold text-[16px] tracking-wide mt-2">
            {maskEmail(email)}
          </p>
        </div>

        {/* OTP Input Grid */}
        <div className="flex gap-4 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-[72px] h-[86px] text-center text-3xl font-bold bg-white border-[1.5px] border-gray-300 rounded-[14px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 w-full bg-red-50 border border-red-200 rounded-apple p-3">
            <p className="text-[13px] text-red-600 font-medium text-center">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <Button
          className="py-4.5 text-[17px] font-bold tracking-tight shadow-md"
          onClick={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Button>

        {/* Footer Info */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-gray-500 text-[14px]">
            Resend available in <span className="font-bold text-appleDark">{formatTime(timer)} seconds</span>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[14px]">
            <span className="text-gray-500">Didn't receive the code?</span>
            <button
              onClick={handleResend}
              disabled={timer > 0 || isLoading}
              className={`font-bold transition-colors ${timer > 0 || isLoading ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:text-blue-700'}`}
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
