/**
 * Input format and security validators
 */

export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const validateMobile = (mobile) => {
  // 10 digits Indian mobile format
  const re = /^[6-9]\d{9}$/;
  return re.test(String(mobile).replace(/\D/g, '').slice(-10));
};

export const validatePAN = (pan) => {
  // 5 letters, 4 digits, 1 letter
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(String(pan).toUpperCase().trim());
};

export const validateIFSC = (ifsc) => {
  // 4 letters, 0, 6 letters or digits
  const re = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return re.test(String(ifsc).toUpperCase().trim());
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
