import React from 'react';

/**
 * Reusable loading spinner component with different sizes and variants
 */
const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary',
  text = '',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variantClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]}
          border-2 rounded-full animate-spin
        `}
      />
      {text && (
        <p className={`mt-2 text-center ${
          variant === 'white' ? 'text-white' : 'text-gray-600'
        } ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;