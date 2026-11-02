import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  name,
  required = false,
  prefix,
  icon: Icon,
  disabled = false,
  autoComplete,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }} className={className}>
      {label && (
        <label
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>
            {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
          </span>
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: disabled ? 'rgba(0,0,0,0.03)' : 'var(--bg-surface)',
          border: error ? '1.5px solid #EF4444' : '1px solid var(--border-color)',
          borderRadius: '8px',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        {prefix && (
          <span
            style={{
              padding: '0 12px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-muted)',
              borderRight: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderTopLeftRadius: '7px',
              borderBottomLeftRadius: '7px',
              height: '44px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {prefix}
          </span>
        )}

        {Icon && !prefix && (
          <span style={{ paddingLeft: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <Icon size={18} />
          </span>
        )}

        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            height: '44px',
            padding: prefix ? '0 12px' : Icon ? '0 12px 0 8px' : '0 14px',
            fontSize: '14px',
            color: 'var(--text-main)',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            borderRadius: '8px'
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 12px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '2px' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{helperText}</span>
      ) : null}
    </div>
  );
};
