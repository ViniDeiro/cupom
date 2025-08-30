import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base do axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      // Token expirado ou inválido
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        
        // Redirecionar para login se não estiver na página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        toast.error('Sessão expirada. Faça login novamente.');
        return Promise.reject(error);
      }
      
      // Erro de validação ou outros erros do servidor
      if (data?.erro) {
        toast.error(data.erro);
      } else {
        toast.error('Erro inesperado. Tente novamente.');
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Timeout da requisição. Verifique sua conexão.');
    } else {
      toast.error('Erro de conexão. Verifique sua internet.');
    }
    
    return Promise.reject(error);
  }
);

// Funções de API para autenticação
export const authAPI = {
  // Registro de usuário
  register: (dados) => api.post('/auth/register', dados),
  
  // Login de usuário
  login: (dados) => api.post('/auth/login', dados),
  
  // Login de administrador
  adminLogin: (dados) => api.post('/auth/admin/login', dados),
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    window.location.href = '/';
  }
};

// Funções de API para produtos
export const productsAPI = {
  // Listar produtos
  getProducts: (params = {}) => api.get('/products', { params }),
  
  // Obter produto por ID
  getProduct: (id) => api.get(`/products/${id}`),
  
  // Listar categorias
  getCategories: () => api.get('/products/admin/categorias'),
  
  // Listar todos os produtos (admin)
  getAllProducts: (params = {}) => api.get('/products/admin/todos', { params }),
  
  // Criar produto (admin)
  createProduct: (dados) => api.post('/products', dados),
  
  // Atualizar produto (admin)
  updateProduct: (id, dados) => api.put(`/products/${id}`, dados),
  
  // Deletar produto (admin)
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

// Funções de API para cupons
export const couponsAPI = {
  // Listar tipos de cupons
  getCouponTypes: () => api.get('/coupons/tipos'),
  
  // Comprar cupom
  buyCoupon: (dados) => api.post('/coupons/comprar', dados),
  
  // Listar cupons do usuário
  getMyCoupons: () => api.get('/coupons/meus-cupons'),
  
  // Validar cupom
  validateCoupon: (codigo) => api.post('/coupons/validar', { codigo }),
  
  // Verificar dia especial
  checkSpecialDay: () => api.get('/coupons/dia-especial')
};

// Funções de API para pedidos
export const ordersAPI = {
  // Criar pedido
  createOrder: (dados) => api.post('/orders', dados),
  
  // Listar meus pedidos
  getMyOrders: (params = {}) => api.get('/orders/meus-pedidos', { params }),
  
  // Obter pedido específico
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // Listar todos os pedidos (admin)
  getAllOrders: (params = {}) => api.get('/orders/admin/todos', { params }),
  
  // Atualizar status do pedido (admin)
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status })
};

// Funções de API para administração
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Dias especiais
  getSpecialDays: (params = {}) => api.get('/admin/dias-especiais', { params }),
  createSpecialDay: (dados) => api.post('/admin/dias-especiais', dados),
  updateSpecialDay: (id, dados) => api.put(`/admin/dias-especiais/${id}`, dados),
  activateSpecialDay: (id) => api.post(`/admin/dias-especiais/${id}/ativar`),
  deleteSpecialDay: (id) => api.delete(`/admin/dias-especiais/${id}`),
  
  // Tipos de cupons
  getCouponTypes: () => api.get('/admin/tipos-cupons'),
  createCouponType: (dados) => api.post('/admin/tipos-cupons', dados),
  updateCouponType: (id, dados) => api.put(`/admin/tipos-cupons/${id}`, dados),
  deleteCouponType: (id) => api.delete(`/admin/tipos-cupons/${id}`),
  
  // Relatórios e estatísticas
  getOrdersStats: (params = {}) => api.get('/admin/estatisticas/pedidos', { params }),
  getCouponsStats: (params = {}) => api.get('/admin/estatisticas/cupons', { params }),
  getCouponsReport: (params = {}) => api.get('/admin/relatorio/cupons', { params })
};

// Função helper para formatar erros
export const formatError = (error) => {
  if (error.response?.data?.detalhes) {
    return error.response.data.detalhes.map(d => d.mensagem || d.msg).join(', ');
  }
  return error.response?.data?.erro || error.message || 'Erro desconhecido';
};

// Função helper para formatar valores monetários
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função helper para formatar datas
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

// Função helper para formatar data e hora
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export default api;
