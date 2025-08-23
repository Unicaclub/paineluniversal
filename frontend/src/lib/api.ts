import axios, { AxiosInstance } from 'axios';

// Configuração de ambiente com retry automático
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

// Função de retry para requisições
const retryRequest = async (url: string, options: any, maxRetries = 3, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios(url, options);
    } catch (error: any) {
      console.log(`🔄 Tentativa ${i + 1}/${maxRetries} falhou para ${url}`);
      
      if (i === maxRetries - 1) throw error;
      
      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Cliente HTTP público (sem autenticação) com retry
export const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutos para Railway containers frios
  withCredentials: false,
});

// Cliente HTTP autenticado com retry
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutos para Railway containers frios
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

// Log da configuração e teste de conectividade
if (!import.meta.env.PROD) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    isProd: import.meta.env.PROD,
    hostname: window.location.hostname,
  });
} else {
  // Teste de conectividade em produção
  console.log('🔍 Testando conectividade com backend em produção...');
  
  const testConnection = async () => {
    try {
      const response = await retryRequest(`${API_BASE_URL}/healthz`, { 
        method: 'GET',
        timeout: 120000 
      }, 5, 3000);
      console.log('✅ Backend conectado com sucesso:', response.data);
    } catch (error: any) {
      console.log('❌ Falha na conexão com backend:', error.message);
      console.log('🔄 Backend pode estar inicializando... Tentativas automáticas continuarão.');
    }
  };
  
  // Executar teste após 1 segundo
  setTimeout(testConnection, 1000);
}

export { API_BASE_URL };
