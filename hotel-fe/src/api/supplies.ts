const ENDPOINT = '/api';

export const getSupplies = async () => {
  const response = await fetch(`${ENDPOINT}/supplies`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('hotel_token')}` }
  });
  if (!response.ok) throw new Error('Failed to load supplies');
  const data = await response.json();
  // Xử lý $values nếu có
  const suppliesData = data.$values || data;
  return Array.isArray(suppliesData) ? suppliesData : [];
};

// Thêm export {} nếu không có export nào khác
export {};