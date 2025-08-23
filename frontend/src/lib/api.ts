import axios, { AxiosInstance } from 'axios';

// 🌐 CONFIGURAÇÃO ROBUSTA DE API COM DETECÇÃO DE AMBIENTE E FALLBACK
const getApiConfiguration = () => {
  // Detecção robusta de ambiente de produção
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProdVite = import.meta.env.PROD;
  const isProdDomain = hostname.includes('railway.app') || 
                      hostname.includes('netlify.app') || 
                      hostname.includes('vercel.app') ||
                      hostname.includes('paineluniversal.com');
  
  // Permitir override via variáveis de ambiente
  const forceProduction = import.meta.env.VITE_FORCE_PRODUCTION === 'true';
  const forceDevelopment = import.meta.env.VITE_FORCE_DEVELOPMENT === 'true';
  const customBackendUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  
  let isProduction: boolean;
  if (forceProduction) {
    isProduction = true;
  } else if (forceDevelopment) {
    isProduction = false;
  } else {
    isProduction = isProdVite || isProdDomain;
  }
  
  // URLs de backend em ordem de prioridade
  const backends = {
    production: [
      'https://backend-painel-universal-production.up.railway.app',
      'https://paineluniversal-backend.up.railway.app', // Fallback alternativo
    ],
    development: [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
    ]
  };
  
  // Se há URL personalizada, usar ela
  let primaryBackend: string;
  if (customBackendUrl) {
    primaryBackend = customBackendUrl;
  } else {
    primaryBackend = isProduction ? backends.production[0] : backends.development[0];
  }
  
  console.log('🔧 API Configuration Detection:', {
    hostname,
    isProdVite,
    isProdDomain,
    forceProduction,
    forceDevelopment,
    customBackendUrl,
    isProduction,
    primaryBackend,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 50) : 'N/A'
  });
  
  return {
    baseURL: primaryBackend,
    isProduction,
    fallbackURLs: isProduction ? backends.production.slice(1) : backends.development.slice(1)
  };
};

const config = getApiConfiguration();
const API_BASE_URL = config.baseURL;

// 📡 CLIENTE HTTP PÚBLICO (sem autenticação automática)
export const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos - mais rápido para detectar problemas
  withCredentials: false,
});

// 🔐 CLIENTE HTTP AUTENTICADO
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
  withCredentials: false,
});

// 🔍 INTERCEPTOR COM LOGS DETALHADOS
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log detalhado apenas em desenvolvimento ou se debug ativado
  const isDebugMode = import.meta.env.VITE_DEBUG_API === 'true' || localStorage.getItem('debug_api') === 'true';
  if (isDebugMode) {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization
    });
  }
  
  return config;
});

// 🚨 INTERCEPTOR DE RESPOSTA COM TRATAMENTO INTELIGENTE DE ERROS
api.interceptors.response.use(
  (response) => {
    // Validar resposta JSON quando esperado
    if (response.config.responseType === 'json' || !response.config.responseType) {
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/json') && typeof response.data === 'string') {
        console.warn('⚠️ Resposta não é JSON válido, corrigindo automaticamente');
        try {
          response.data = JSON.parse(response.data);
        } catch {
          response.data = { message: response.data };
        }
      }
    }
    return response;
  },
  (error) => {
    // Log detalhado do erro
    console.error('🔥 API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      message: error.message,
      isNetworkError: !error.response,
      isCorsError: error.message?.includes('CORS') || error.message?.includes('Access-Control')
    });

    // Tratamento específico para erro 401
    if (error.response?.status === 401) {
      console.warn('🔒 Token expirado ou inválido, redirecionando para login');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Aplicar mesmo interceptor para publicApi
publicApi.interceptors.response.use(
  (response) => {
    // Mesma validação JSON
    if (response.config.responseType === 'json' || !response.config.responseType) {
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/json') && typeof response.data === 'string') {
        console.warn('⚠️ [Public API] Resposta não é JSON válido, corrigindo automaticamente');
        try {
          response.data = JSON.parse(response.data);
        } catch {
          response.data = { message: response.data };
        }
      }
    }
    return response;
  },
  (error) => {
    console.error('🔥 Public API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      message: error.message,
      isNetworkError: !error.response,
      isCorsError: error.message?.includes('CORS') || error.message?.includes('Access-Control')
    });
    
    return Promise.reject(error);
  }
);

// 🧪 TESTE DE CONECTIVIDADE INTELIGENTE
const testConnectivity = async () => {
  if (!config.isProduction) {
    console.log('🔧 Modo desenvolvimento - pulando teste de conectividade automático');
    return;
  }
  
  console.log('🧪 Testando conectividade com backend...');
  try {
    const response = await publicApi.get('/healthz', { timeout: 10000 });
    console.log('✅ Backend conectado:', {
      status: response.status,
      url: API_BASE_URL
    });
  } catch (error: any) {
    console.error('❌ Falha na conectividade com backend principal:', {
      url: API_BASE_URL,
      error: error.message,
      status: error.response?.status
    });
    
    // TODO: Implementar tentativa com URLs de fallback se necessário
    console.warn('⚠️ Continuando com configuração atual. Algumas funcionalidades podem não funcionar.');
  }
};

// Executar teste de conectividade após inicialização
if (typeof window !== 'undefined') {
  setTimeout(testConnectivity, 1000); // Aguardar 1s para app inicializar
}

// 📊 LOG DA CONFIGURAÇÃO FINAL
console.log('🔧 Final API Configuration:', {
  baseURL: API_BASE_URL,
  isProduction: config.isProduction,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
  fallbackURLs: config.fallbackURLs
});

// 🔧 UTILITÁRIO PARA TESTAR CONECTIVIDADE MANUAL
export const testApiConnection = async (): Promise<{ 
  success: boolean; 
  data?: any; 
  error?: string;
  details?: {
    status?: number;
    statusText?: string;
    baseURL?: string;
  };
}> => {
  try {
    const response = await publicApi.get('/api/cors-test', { timeout: 10000 });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message,
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        baseURL: error.config?.baseURL
      }
    };
  }
};

export { API_BASE_URL };
