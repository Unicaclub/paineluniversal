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
  
  // 🚨 CONFIGURAÇÃO ESPECÍFICA PARA PRODUÇÃO - MÚLTIPLOS BACKENDS
  const backends = {
    production: [
      // Backend principal Railway
      'https://backend-painel-universal-production.up.railway.app',
      // Fallbacks para produção
      'https://paineluniversal-backend.up.railway.app',
      'https://backend-paineluniversal.up.railway.app',
      // Backend de backup (se houver)
      'https://api.paineluniversal.com',
      // Em último caso, tentar localhost se acessível
      'http://localhost:8000',
    ],
    development: [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      // Fallback para Railway em desenvolvimento
      'https://backend-painel-universal-production.up.railway.app',
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
    fallbackOptions: isProduction ? backends.production.length : backends.development.length,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 50) : 'N/A'
  });
  
  return {
    baseURL: primaryBackend,
    isProduction,
    fallbackURLs: isProduction ? backends.production.slice(1) : backends.development.slice(1)
  };
};

const config = getApiConfiguration();
let API_BASE_URL = config.baseURL;
let currentBackendIndex = 0;

// 🔄 SISTEMA DE AUTO-RECOVERY PARA PRODUÇÃO
const switchToNextBackend = (): boolean => {
  const availableBackends = [config.baseURL, ...config.fallbackURLs];
  
  if (currentBackendIndex < availableBackends.length - 1) {
    currentBackendIndex++;
    const newBackend = availableBackends[currentBackendIndex];
    
    console.warn(`🔄 Switching to backup backend ${currentBackendIndex}:`, newBackend);
    
    // Atualizar URL base dos clientes axios
    API_BASE_URL = newBackend;
    api.defaults.baseURL = newBackend;
    publicApi.defaults.baseURL = newBackend;
    
    return true;
  }
  
  console.error('🚨 All backends failed - no more fallback options');
  return false;
};

// 🔄 RESET para voltar ao backend principal (para retry automático)
const resetToMainBackend = () => {
  currentBackendIndex = 0;
  API_BASE_URL = config.baseURL;
  api.defaults.baseURL = config.baseURL;
  publicApi.defaults.baseURL = config.baseURL;
  console.log('🔄 Reset to main backend:', config.baseURL);
};

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

// 🚨 INTERCEPTOR DE RESPOSTA COM AUTO-RECOVERY EM PRODUÇÃO
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
    
    // Se chegou aqui, o backend atual está funcionando
    // Reset para backend principal após 5 minutos de sucesso
    if (currentBackendIndex > 0 && config.isProduction) {
      setTimeout(() => {
        if (currentBackendIndex > 0) {
          console.log('🔄 Tentando retornar ao backend principal após período de sucesso');
          resetToMainBackend();
        }
      }, 5 * 60 * 1000); // 5 minutos
    }
    
    return response;
  },
  async (error) => {
    // Log detalhado do erro
    console.error('🔥 API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      message: error.message,
      isNetworkError: !error.response,
      isCorsError: error.message?.includes('CORS') || error.message?.includes('Access-Control'),
      currentBackendIndex,
      isProduction: config.isProduction
    });

    // 🚨 AUTO-RECOVERY EM PRODUÇÃO
    if (config.isProduction && (
      !error.response || // Erro de rede
      error.response.status >= 500 || // Erro de servidor
      error.response.status === 502 || // Bad Gateway
      error.response.status === 503 || // Service Unavailable
      error.response.status === 504    // Gateway Timeout
    )) {
      console.warn('🚨 Backend failure detected, attempting auto-recovery...');
      
      if (switchToNextBackend()) {
        // Tentar a mesma requisição com o novo backend
        try {
          console.log('🔄 Retrying request with backup backend...');
          const retryConfig = { ...error.config };
          retryConfig.baseURL = API_BASE_URL;
          
          // Evitar loop infinito
          if (!retryConfig.__isRetry) {
            retryConfig.__isRetry = true;
            const retryResponse = await api.request(retryConfig);
            console.log('✅ Request succeeded with backup backend');
            return retryResponse;
          }
        } catch (retryError) {
          console.error('❌ Retry with backup backend also failed:', retryError);
        }
      }
    }

    // Tratamento específico para erro 401
    if (error.response?.status === 401) {
      console.warn('🔒 Token expirado ou inválido, redirecionando para login');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      // Só redirecionar se não estivermos já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Aplicar mesmo interceptor de auto-recovery para publicApi
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
  async (error) => {
    console.error('🔥 Public API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      message: error.message,
      isNetworkError: !error.response,
      isCorsError: error.message?.includes('CORS') || error.message?.includes('Access-Control'),
      currentBackendIndex,
      isProduction: config.isProduction
    });
    
    // 🚨 AUTO-RECOVERY EM PRODUÇÃO para Public API também
    if (config.isProduction && (
      !error.response || 
      error.response.status >= 500 || 
      error.response.status === 502 || 
      error.response.status === 503 || 
      error.response.status === 504
    )) {
      console.warn('🚨 [Public API] Backend failure detected, attempting auto-recovery...');
      
      if (switchToNextBackend()) {
        try {
          console.log('🔄 [Public API] Retrying request with backup backend...');
          const retryConfig = { ...error.config };
          retryConfig.baseURL = API_BASE_URL;
          
          if (!retryConfig.__isRetry) {
            retryConfig.__isRetry = true;
            const retryResponse = await publicApi.request(retryConfig);
            console.log('✅ [Public API] Request succeeded with backup backend');
            return retryResponse;
          }
        } catch (retryError) {
          console.error('❌ [Public API] Retry with backup backend also failed:', retryError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// 🧪 SISTEMA DE HEALTH CHECK AVANÇADO PARA PRODUÇÃO
let lastHealthCheck = 0;
let healthCheckInterval: NodeJS.Timeout | null = null;

const performHealthCheck = async (): Promise<void> => {
  if (!config.isProduction) return; // Só em produção
  
  const now = Date.now();
  if (now - lastHealthCheck < 30000) return; // Evitar checks muito frequentes
  lastHealthCheck = now;
  
  console.log('🔍 [Health Check] Testing all available backends...');
  const allBackends = [config.baseURL, ...config.fallbackURLs];
  
  for (let i = 0; i < allBackends.length; i++) {
    try {
      const testResponse = await fetch(`${allBackends[i]}/healthz`, {
        method: 'GET',
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      });
      
      if (testResponse.ok) {
        console.log(`✅ [Health Check] Backend ${i} is healthy:`, allBackends[i]);
        
        // Se encontramos um backend saudável que não é o atual, mudar para ele
        if (i !== currentBackendIndex) {
          console.log(`🔄 [Health Check] Switching to healthier backend ${i}`);
          currentBackendIndex = i;
          API_BASE_URL = allBackends[i];
          api.defaults.baseURL = allBackends[i];
          publicApi.defaults.baseURL = allBackends[i];
        }
        break; // Encontrou um saudável, parar de procurar
      }
    } catch (error) {
      console.warn(`❌ [Health Check] Backend ${i} failed:`, allBackends[i], error);
    }
  }
};

const startHealthCheck = () => {
  if (!config.isProduction || healthCheckInterval) return;
  
  // Health check inicial
  setTimeout(performHealthCheck, 2000);
  
  // Health checks periódicos a cada 2 minutos
  healthCheckInterval = setInterval(performHealthCheck, 2 * 60 * 1000);
  
  console.log('🏥 [Health Check] Sistema iniciado para produção');
};

const stopHealthCheck = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    console.log('🏥 [Health Check] Sistema parado');
  }
};

// Executar inicialização do sistema de auto-recovery
if (typeof window !== 'undefined') {
  // Iniciar health check system em produção
  startHealthCheck();
  
  // Cleanup ao sair da página
  window.addEventListener('beforeunload', stopHealthCheck);
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
    currentBackend?: number;
    totalBackends?: number;
    fallbacksAvailable?: boolean;
  };
}> => {
  try {
    // Testar backend atual primeiro
    const response = await publicApi.get('/api/cors-test', { timeout: 10000 });
    return { 
      success: true, 
      data: response.data,
      details: {
        baseURL: API_BASE_URL,
        currentBackend: currentBackendIndex,
        totalBackends: [config.baseURL, ...config.fallbackURLs].length,
        fallbacksAvailable: config.fallbackURLs.length > 0
      }
    };
  } catch (error: any) {
    // Em caso de erro, tentar health check para encontrar backend funcionando
    if (config.isProduction) {
      console.log('🔍 Testing connection failed, performing health check...');
      await performHealthCheck();
    }
    
    return { 
      success: false, 
      error: error.message,
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        baseURL: API_BASE_URL,
        currentBackend: currentBackendIndex,
        totalBackends: [config.baseURL, ...config.fallbackURLs].length,
        fallbacksAvailable: config.fallbackURLs.length > 0
      }
    };
  }
};

// 🔧 UTILITÁRIO PARA FORÇAR MUDANÇA DE BACKEND (para debug)
export const forceBackendSwitch = (): boolean => {
  return switchToNextBackend();
};

// 🔧 UTILITÁRIO PARA OBTER STATUS ATUAL DO SISTEMA
export const getBackendStatus = () => {
  const allBackends = [config.baseURL, ...config.fallbackURLs];
  return {
    currentBackend: API_BASE_URL,
    currentIndex: currentBackendIndex,
    totalBackends: allBackends.length,
    allBackends,
    isProduction: config.isProduction,
    healthCheckActive: !!healthCheckInterval
  };
};

export { API_BASE_URL };
