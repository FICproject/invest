/**
 * Format number to Indian Rupee representation (e.g. ₹ 2,50,000)
 */
export const formatCurrency = (amount, includeSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? '₹ 0' : '0';
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);

  return includeSymbol ? `₹ ${formatted}` : formatted;
};

/**
 * Format large amounts to abbreviated Indian notations (e.g. ₹ 14.00 Cr, ₹ 2.5 L)
 */
export const formatLargeCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '₹ 0';

  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} L`;
  }
  return formatCurrency(amount);
};
