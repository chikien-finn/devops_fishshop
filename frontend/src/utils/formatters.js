/**
 * Format number as Vietnamese Dong (VND)
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format Date to readable Vietnamese string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format order ID to unified 6-character uppercase order code (e.g. 8A37A4)
 * @param {string} id
 * @returns {string}
 */
export const formatOrderCode = (id) => {
  if (!id) return '';
  return String(id).slice(-6).toUpperCase();
};


