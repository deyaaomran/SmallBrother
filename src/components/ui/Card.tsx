import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = false,
  onClick
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return 'backdrop-blur-lg bg-white/80 border border-white/20 shadow-lg';
      case 'gradient':
        return 'bg-gradient-to-br from-white via-purple-50 to-indigo-100 border border-purple-200 shadow-md';
      case 'elevated':
        return 'bg-white shadow-lg border-0';
      case 'bordered':
        return 'bg-white border-2 border-gray-200 shadow-sm';
      default:
        return 'bg-white shadow-md border border-gray-200';
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      case 'xl':
        return 'p-10';
      default:
        return 'p-6';
    }
  };

  const baseStyles = 'rounded-3xl overflow-hidden transition-all duration-300';
  const hoverStyles = hover ? 'hover:shadow-xl hover:scale-105 transform cursor-pointer' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${getVariantStyles()}
        ${getPaddingStyles()}
        ${hoverStyles}
        ${clickableStyles}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card; 