
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = true, className = '', ...props }) => {
  const baseStyles = "px-6 py-4 rounded-apple font-semibold text-[15px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-[#345BA1] shadow-lg shadow-primary/20",
    secondary: "bg-white text-appleDark border border-gray-200 hover:bg-gray-50",
    ghost: "bg-transparent text-primary hover:bg-primary/5"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
