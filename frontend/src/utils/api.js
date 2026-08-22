const API_BASE = import.meta.env.VITE_API_BASE || '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body, token, customerToken, headers = {}, ...rest } = options;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (customerToken) {
    requestHeaders['X-Customer-Token'] = customerToken;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    ...rest,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data);
    throw new ApiError(message || 'Something went wrong', response.status, data);
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, options) => request(path, { ...options, method: 'POST' }),
  patch: (path, options) => request(path, { ...options, method: 'PATCH' }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  put: (path, options) => request(path, { ...options, method: 'PUT' }),
};

// Staff API
export const staffApi = {
  login: (username, password) => api.post('/staff/login/', { body: { username, password } }),

  dashboard: (token) => api.get('/staff/dashboard/', { token }),
  tables: (token) => api.get('/staff/tables/', { token }),
  orders: (token) => api.get('/staff/orders/', { token }),
  menu: (token) => api.get('/staff/menu/', { token }),
  categories: (token) => api.get('/staff/categories/', { token }),
  bills: (token) => api.get('/staff/bills/', { token }),

  openTable: (tableId, token) => api.post(`/staff/tables/${tableId}/open/`, { token }),
  closeTable: (tableId, token) => api.post(`/staff/tables/${tableId}/close/`, { token }),

  updateOrderStatus: (orderId, status, token, rejectionReason) =>
    api.post(`/staff/orders/${orderId}/status/`, { token, body: { status, rejection_reason: rejectionReason } }),

  markBillPaid: (billId, token) => api.post(`/staff/bills/${billId}/paid/`, { token }),
  sendBill: (billId, token) => api.post(`/staff/bills/${billId}/send/`, { token }),

  createMenuItem: (token, data) => api.post('/staff/menu/', { token, body: data }),
  updateMenuItem: (itemId, token, data) => api.patch(`/staff/menu/${itemId}/`, { token, body: data }),
  deleteMenuItem: (itemId, token) => api.delete(`/staff/menu/${itemId}/`, { token }),
  updateAvailability: (itemId, token, state) => api.patch(`/staff/menu/${itemId}/availability/`, { token, body: { state } }),
  toggleSpecial: (itemId, token, isSpecial) => api.patch(`/staff/menu/${itemId}/special/`, { token, body: { is_special: isSpecial } }),

  createCategory: (token, name) => api.post('/staff/categories/', { token, body: { name } }),
  deleteCategory: (categoryId, token) => api.delete(`/staff/categories/${categoryId}/`, { token }),
};

// Customer API
export const customerApi = {
  getTable: (restaurantSlug, tableId) => api.get(`/customer/table/${restaurantSlug}/${tableId}/`),
  createSession: (restaurantSlug, tableId) =>
    api.post('/customer/sessions/', { body: { restaurant_slug: restaurantSlug, table_id: tableId } }),
  getMenu: (customerToken) => api.get('/customer/menu/', { customerToken }),
  getOrders: (customerToken) => api.get('/customer/orders/', { customerToken }),
  getBill: (customerToken) => api.get('/customer/bill/', { customerToken }),
  placeOrder: (customerToken, items, orderLevelNote) =>
    api.post('/customer/orders/', { customerToken, body: { items, order_level_note: orderLevelNote } }),
  requestBill: (customerToken) => api.post('/customer/bill/request/', { customerToken }),
  demoPayment: (customerToken) => api.post('/customer/payment/demo/', { customerToken }),
};

// Utility
export { ApiError };