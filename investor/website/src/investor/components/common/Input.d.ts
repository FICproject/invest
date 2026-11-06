import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: any;
  onChange?: any;
  onBlur?: any;
  error?: string;
  helperText?: string;
  name?: string;
  required?: boolean;
  prefix?: string;
  icon?: any;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  maxLength?: number;
  max?: string | number;
  min?: string | number;
}

export declare const Input: React.FC<InputProps>;

