import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-purple-500';
      case 'secondary':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 focus:ring-gray-500';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 focus:ring-yellow-500';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 focus:ring-blue-500';
      case 'outline':
        return 'border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 bg-transparent';
      default:
        return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-purple-500';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs rounded-lg';
      case 'sm':
        return 'px-3 py-2 text-sm rounded-lg';
      case 'md':
        return 'px-4 py-2 text-sm rounded-xl';
      case 'lg':
        return 'px-6 py-3 text-base rounded-xl';
      case 'xl':
        return 'px-8 py-4 text-lg rounded-2xl';
      default:
        return 'px-4 py-2 text-sm rounded-xl';
    }
  };

  const baseStyles = 'font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl';
  const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${disabledStyles}
        ${widthStyles}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {leftIcon && !isLoading && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        
        {isLoading && (
          <svg className="h-4 w-4 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
        
        <span>{children}</span>
        
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </div>
    </button>
  );
};

export default Button; 