/**
 * Connect Invest Mobile Data & Format Validators
 * Matches exact Web & Backend Form Validation Rules
 */

export const calculateAge = (dobString: string): number => {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const validateDOB = (dobString: string): { valid: boolean; message?: string } => {
  if (!dobString) {
    return { valid: false, message: 'Please enter your Date of Birth.' };
  }
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) {
    return { valid: false, message: 'Please enter a valid Date of Birth.' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDob = new Date(dob);
  checkDob.setHours(0, 0, 0, 0);
  if (checkDob > today) {
    return { valid: false, message: 'Date of Birth cannot be a future date.' };
  }
  const age = calculateAge(dobString);
  if (age < 18) {
    return { valid: false, message: 'You must be at least 18 years old to register.' };
  }
  return { valid: true };
};

export const isValidEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase().trim());
};

export const isValidMobile = (mobile: string): boolean => {
  if (!mobile) return false;
  const str = String(mobile).replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(str);
};

export const isValidPan = (pan: string): boolean => {
  if (!pan) return false;
  const str = String(pan).toUpperCase().trim();
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(str);
};

export const isValidAadhaar = (aadhaar: string): boolean => {
  if (!aadhaar) return false;
  const str = String(aadhaar).replace(/\D/g, '').trim();
  return /^\d{12}$/.test(str);
};

export const maskAadhaar = (aadhaar: string): string => {
  if (!aadhaar) return '';
  const str = String(aadhaar).replace(/\D/g, '').trim();
  if (str.length < 4) return 'XXXXXXXXXXXX';
  return 'XXXXXXXX' + str.slice(-4);
};

export const isValidBankAccount = (accountNumber: string): boolean => {
  if (!accountNumber) return false;
  const str = String(accountNumber).trim();
  return /^\d{9,18}$/.test(str);
};

export const isValidIfsc = (ifsc: string): boolean => {
  if (!ifsc) return false;
  const str = String(ifsc).toUpperCase().trim();
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(str);
};

export const isValidCin = (cin: string): boolean => {
  if (!cin) return false;
  const str = String(cin).toUpperCase().trim();
  return /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(str);
};

export const isValidGstin = (gstin: string): boolean => {
  if (!gstin) return false;
  const str = String(gstin).toUpperCase().trim();
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(str);
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
