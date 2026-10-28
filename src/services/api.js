const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// ── Core fetch wrapper ────────────────────────────────────────
export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body)  headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `API error (${response.status})`);
  return data;
}

// Helper to get stored token
const getToken = () => localStorage.getItem('naturenest_token');
const getCustomerToken = () => localStorage.getItem('msv_organic_token');

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  signup:         (name, email, password) => api('/auth/signup', { method: 'POST', body: { name, email, password } }),
  login:          (email, password)       => api('/auth/login',  { method: 'POST', body: { email, password } }),
  getMe:          ()                      => api('/auth/me',     { token: getToken() }),
  getCustomerMe:  (token)                 => api('/auth/me',     { token: token || getCustomerToken() }),
  getWorkers:     ()                      => api('/auth/workers', { token: getToken() }),
  registerWorker: (data)                  => api('/auth/register', { method: 'POST', body: data, token: getToken() }),
};

// ── Products ──────────────────────────────────────────────────
export const productAPI = {
  getAll:   (params = {}) => api('/products?' + new URLSearchParams(params), { token: getToken() }),
  getOne:   (id)          => api(`/products/${id}`,  { token: getToken() }),
  create:   (data)        => api('/products',        { method: 'POST', body: data, token: getToken() }),
  update:   (id, data)    => api(`/products/${id}`,  { method: 'PUT',  body: data, token: getToken() }),
  delete:   (id)          => api(`/products/${id}`,  { method: 'DELETE', token: getToken() }),
};

// ── Inventory ─────────────────────────────────────────────────
export const inventoryAPI = {
  getAll:   (params = {}) => api('/inventory?' + new URLSearchParams(params), { token: getToken() }),
  getStats: ()            => api('/inventory/stats', { token: getToken() }),
  getLogs:  ()            => api('/inventory/logs',  { token: getToken() }),
  addStock: (productId, data) => api(`/inventory/${productId}/add-stock`, { method: 'POST', body: data, token: getToken() }),
  update:   (productId, data) => api(`/inventory/${productId}/update`,    { method: 'PUT',  body: data, token: getToken() }),
};

// ── Orders ────────────────────────────────────────────────────
export const orderAPI = {
  getAll:       (params = {}) => api('/orders?' + new URLSearchParams(params), { token: getToken() }),
  getStats:     ()            => api('/orders/stats', { token: getToken() }),
  getOne:       (id)          => api(`/orders/${id}`, { token: getToken() }),
  create:       (data)        => api('/orders',       { method: 'POST', body: data, token: getToken() }),
  updateStatus: (id, data)    => api(`/orders/${id}/status`, { method: 'PUT', body: data, token: getToken() }),
};

// ── Customers ─────────────────────────────────────────────────
export const customerAPI = {
  getAll:  (params = {}) => api('/customers?' + new URLSearchParams(params), { token: getToken() }),
  getOne:  (id)          => api(`/customers/${id}`, { token: getToken() }),
  create:  (data)        => api('/customers',       { method: 'POST', body: data, token: getToken() }),
  update:  (id, data)    => api(`/customers/${id}`, { method: 'PUT',  body: data, token: getToken() }),
  delete:  (id)          => api(`/customers/${id}`, { method: 'DELETE', token: getToken() }),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard:  ()               => api('/analytics/dashboard',  { token: getToken() }),
  getSales:      (period = 30)    => api(`/analytics/sales?period=${period}`, { token: getToken() }),
  getCategories: ()               => api('/analytics/categories', { token: getToken() }),
};

// ── Settings ──────────────────────────────────────────────────
export const settingsAPI = {
  getStore:          ()             => api('/settings/store',             { token: getToken() }),
  updateStore:       (data)         => api('/settings/store',             { method: 'PUT', body: data, token: getToken() }),
  getPayment:        ()             => api('/settings/payment',           { token: getToken() }),
  updatePayment:     (method, data) => api(`/settings/payment/${method}`, { method: 'PUT', body: data, token: getToken() }),
  getCategories:     ()             => api('/settings/categories',        { token: getToken() }),
};