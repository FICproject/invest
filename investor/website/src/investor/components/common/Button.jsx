import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'gold' | 'outline' | 'ghost' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    boxShadow: variant === 'primary' || variant === 'gold' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
  };

  const sizeStyles = {
    sm: { padding: '8px 14px', fontSize: '13px' },
    md: { padding: '11px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '15px' }
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: '#FFFFFF'
    },
    gold: {
      backgroundColor: 'var(--color-gold)',
      color: '#FFFFFF'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      border: '1px solid var(--border-color)'
    },
    dark: {
      backgroundColor: '#1E0F14',
      color: '#FFFFFF',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-main)'
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant]
      }}
      className={`ci-button ci-button-${variant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#FFFFFF',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block'
          }}
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
        </>
      )}
    </button>
  );
};
