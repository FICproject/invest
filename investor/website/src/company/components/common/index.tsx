import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantStyles = {
    primary:
      'bg-[#F4B41A] hover:bg-[#E8A51D] text-[#1F2421] font-bold shadow-sm shadow-[#F4B41A]/20 focus:ring-[#F4B41A] hover:scale-[1.01] active:scale-[0.99]',
    secondary:
      'bg-[#FFFDF7] hover:bg-[#FFF9ED] text-[#1F2421] border border-[#EFE8D8] focus:ring-[#F4B41A]',
    outline:
      'bg-transparent hover:bg-[#FFFDF7] text-[#1F2421] border border-[#E5E0D0] focus:ring-[#F4B41A]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-400',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth} border border-slate-100`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-brand-50/50 to-white">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const Loader: React.FC<{ text?: string }> = ({ text = 'Loading data...' }) => (
  <div className="flex flex-col items-center justify-center py-16 space-y-3">
    <div className="w-10 h-10 border-4 border-[#FDF0D0] border-t-[#F4B41A] rounded-full animate-spin"></div>
    <p className="text-sm text-slate-500 font-medium">{text}</p>
  </div>
);

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'slate';
}> = ({ children, variant = 'slate' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-[#FFF9ED] text-[#B37400] border-[#F4E9CD]',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-[#FFF9ED] text-[#DE8E0A] border-[#F4E9CD]',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-[#EFE8D8] shadow-sm p-6 transition-all duration-200 ${
      onClick ? 'cursor-pointer hover:border-[#F4B41A] hover:shadow-md' : ''
    } ${className}`}
  >
    {children}
  </div>
);

