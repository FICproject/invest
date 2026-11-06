/**
 * Input format and security validators
 */

export const calculateAge = (dobString) => {
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

export const validateDOB = (dobString) => {
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

export const getMaxDOB18YearsAgo = () => {
  const today = new Date();
  const year = today.getFullYear() - 18;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase().trim());
};

export const validateMobile = (mobile) => {
  if (!mobile) return false;
  // Indian mobile format: exactly 10 digits, starts with 6, 7, 8, or 9
  const str = String(mobile).trim();
  return /^[6-9]\d{9}$/.test(str);
};

export const validatePAN = (pan) => {
  if (!pan) return false;
  // 5 uppercase letters, 4 digits, 1 uppercase letter
  const str = String(pan).toUpperCase().trim();
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(str);
};

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  // Exactly 12 digits
  const str = String(aadhaar).trim();
  return /^\d{12}$/.test(str);
};

export const maskAadhaar = (aadhaar) => {
  if (!aadhaar) return '';
  const str = String(aadhaar).trim();
  if (str.length < 4) return 'XXXXXXXXXXXX';
  return 'XXXXXXXX' + str.slice(-4);
};

export const validateBankAccount = (accountNumber) => {
  if (!accountNumber) return false;
  // Numeric bank account between 9 and 18 digits, preserves leading zeros as string
  const str = String(accountNumber).trim();
  return /^\d{9,18}$/.test(str);
};

export const validateIFSC = (ifsc) => {
  if (!ifsc) return false;
  // 4 letters, 0, 6 letters or digits
  const str = String(ifsc).toUpperCase().trim();
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(str);
};

export const evaluatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Empty', color: 'gray' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
  if (score === 2) return { score, label: 'Fair', color: '#F59E0B' };
  if (score === 3) return { score, label: 'Good', color: '#3B82F6' };
  return { score: 4, label: 'Strong', color: '#10B981' };
};

export const validateCIN = (cin) => {
  if (!cin) return false;
  const str = String(cin).toUpperCase().trim();
  return /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(str);
};

export const validateGSTIN = (gstin) => {
  if (!gstin) return false;
  const str = String(gstin).toUpperCase().trim();
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(str);
};

export const ERROR_MESSAGES = {
  DOB_UNDERAGE: 'You must be at least 18 years old to register.',
  DOB_REQUIRED: 'Please enter your Date of Birth.',
  DOB_FUTURE: 'Date of Birth cannot be a future date.',
  MOBILE_INVALID: 'Please enter a valid 10-digit mobile number.',
  PAN_INVALID: 'Please enter a valid PAN number (e.g., ABCDE1234F).',
  AADHAAR_INVALID: 'Aadhaar number must contain exactly 12 digits.',
  BANK_ACCOUNT_INVALID: 'Please enter a valid bank account number (9–18 digits).',
  IFSC_INVALID: 'Please enter a valid 11-character IFSC code.',
  CIN_INVALID: 'Please enter a valid 21-character CIN (e.g., U12345MH2020PTC123456).',
  GSTIN_INVALID: 'Please enter a valid 15-character GSTIN (e.g., 27ABCDE1234F1Z5).',
  INCORPORATION_FUTURE: 'Incorporation date cannot be in the future.'
};
