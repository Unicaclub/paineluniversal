import axios, { AxiosInstance } from 'axios';

// Configuração da API baseada no ambiente
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://backend-painel-universal-production.up.railway.app'
  : 'http://localhost:8000';

// Cliente HTTP público (sem autenticação)
export const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 1 minuto
  withCredentials: false,
});

// Cliente HTTP autenticado
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 1 minuto
  withCredentials: false,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Log da configuração
console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  isProd: import.meta.env.PROD,
});

// Teste simples de conectividade em produção
if (import.meta.env.PROD) {
  console.log('🔍 Testando conectividade com backend...');
  publicApi.get('/healthz')
    .then(() => console.log('✅ Backend conectado'))
    .catch((error) => console.log('❌ Falha na conectividade:', error.message));
}

export { API_BASE_URL };

export { API_BASE_URL };
