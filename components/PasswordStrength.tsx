
import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length > 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  
  const getColor = () => {
    if (strength <= 2) return 'bg-red-400';
    if (strength <= 3) return 'bg-yellow-400';
    if (strength <= 4) return 'bg-blue-400';
    return 'bg-green-500';
  };

  const getLabel = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="mt-2 px-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Strength</span>
        <span className={`text-[11px] font-bold uppercase ${strength === 0 ? 'text-transparent' : 'text-appleDark'}`}>
          {getLabel()}
        </span>
      </div>
      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={step} 
            className={`h-full flex-1 transition-all duration-500 rounded-full ${step <= strength ? getColor() : 'bg-transparent'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
