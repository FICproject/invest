export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidMobile = (mobile: string): boolean => {
  const cleanMobile = mobile.replace(/\D/g, '');
  return cleanMobile.length === 10;
};

export const isValidPan = (pan: string): boolean => {
  // Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.trim().toUpperCase());
};

export const isValidIfsc = (ifsc: string): boolean => {
  // Format: 4 letters, '0', 6 alphanumeric characters (e.g. HDFC0001234)
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc.trim().toUpperCase());
};

export const isValidPassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

export const validateInvestmentAmount = (
  amount: number,
  min: number,
  max?: number
): { valid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Please enter a valid investment amount.' };
  }
  if (amount < min) {
    return {
      valid: false,
      error: `Minimum investment amount is ₹${min.toLocaleString('en-IN')}.`,
    };
  }
  if (max && amount > max) {
    return {
      valid: false,
      error: `Maximum investment limit is ₹${max.toLocaleString('en-IN')}.`,
    };
  }
  return { valid: true };
};
