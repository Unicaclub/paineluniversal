import axios, { AxiosInstance } from 'axios';

// Configuração de ambiente
const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  const isProd = import.meta.env.PROD || 
                hostname.includes('railway.app') || 
                hostname.includes('netlify.app') ||
                hostname.includes('vercel.app');
  
  if (isProd) {
    return 'https://backend-painel-universal-production.up.railway.app';
  } else {
    return 'http://localhost:8000';
  }
};

const API_BASE_URL = getApiBaseUrl();

// Cliente HTTP público (sem autenticação)
export const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

// Cliente HTTP autenticado
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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

// Log da configuração (apenas em desenvolvimento)
if (!import.meta.env.PROD) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    isProd: import.meta.env.PROD,
    hostname: window.location.hostname,
  });
}

export { API_BASE_URL };
