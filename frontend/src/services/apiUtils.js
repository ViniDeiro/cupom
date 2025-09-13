import api from './api';

// Formatação de moeda
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatação de data
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// APIs específicas
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const couponsAPI = {
  getAll: () => api.get('/coupons'),
  getById: (id) => api.get(`/coupons/${id}`),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
  getTypes: () => api.get('/coupons/tipos'),
  getUserCoupons: () => api.get('/coupons/user'),
  checkSpecialDay: () => api.get('/coupons/dia-especial'),
  buyCoupon: (data) => api.post('/coupons/comprar', data)
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  getAllProducts: () => api.get('/products/admin/todos'),
  getProducts: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/products?${params.toString()}`);
  },
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/admin/categorias'),
  create: (data) => api.post('/products', data),
  createProduct: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getAllOrders: () => api.get('/orders/admin/todos'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  getUserOrders: () => api.get('/orders/user')
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getReports: () => api.get('/admin/reports'),
  getCouponsReport: () => api.get('/admin/coupons-report'),
  getOrdersReport: () => api.get('/admin/orders-report')
};



export default api;