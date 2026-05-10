/**
 * Formats a number as Indian Rupee currency
 * Uses en-IN locale for proper Indian number formatting (e.g., ₹12,99,999)
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    // Fallback for unsupported currencies
    return `₹${amount.toFixed(2)}`;
  }
};

/**
 * Formats a number with Indian locale (e.g., 12,99,999)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '—';
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Formats a percentage value
 * @param {number} value - The value
 * @param {number} total - The total
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, total) => {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};
