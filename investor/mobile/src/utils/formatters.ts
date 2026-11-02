export const formatCurrency = (amount?: number | null, compact = false): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, '')} K`;
    }
  }

  // Format with Indian Rupee grouping (en-IN)
  return '₹' + amount.toLocaleString('en-IN');
};

export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return '—';
  }
};

export const formatDateTime = (dateString?: string | Date | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return '—';
  }
};

export const formatPercent = (rate?: number | null): string => {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return '0%';
  }
  return `${rate}%`;
};

export const maskMobile = (mobile?: string): string => {
  if (!mobile || mobile.length < 10) return mobile || '';
  return mobile.slice(0, 2) + '******' + mobile.slice(-2);
};

export const maskAccountNumber = (accountNumber?: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber || '';
  return '•••• ' + accountNumber.slice(-4);
};

export const maskPan = (pan?: string): string => {
  if (!pan || pan.length < 10) return pan || '';
  return pan.slice(0, 2) + '*****' + pan.slice(-2);
};
