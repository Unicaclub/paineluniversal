import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, authService } from '../services/api';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (cpf: string, senha: string, codigoVerificacao?: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsuario = localStorage.getItem('usuario');

    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
    setLoading(false);
  }, []);

  const login = async (cpf: string, senha: string, codigoVerificacao?: string) => {
    try {
      console.log('🔐 Tentando fazer login...', { cpf: cpf.slice(0, 3) + '***' });
      
      const response = await authService.login({
        cpf,
        senha,
        codigo_verificacao: codigoVerificacao
      });

      console.log('📧 Resposta do login:', { 
        hasToken: !!response.access_token,
        hasUsuario: !!response.usuario,
        responseType: typeof response
      });

      if (response.access_token && response.usuario) {
        setToken(response.access_token);
        setUsuario(response.usuario);
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        console.log('✅ Login bem-sucedido!');
        return { success: true };
      }

      // Verificar se precisa de verificação
      if ((response as any).detail && (response as any).detail.includes('Código de verificação enviado')) {
        console.log('📱 Verificação necessária');
        return {
          success: false,
          needsVerification: true,
          message: (response as any).detail
        };
      }

      console.log('❓ Resposta inesperada:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      if (error.response?.status === 202) {
        console.log('📱 Status 202 - Verificação necessária');
        return {
          success: false,
          needsVerification: true,
          message: error.response.data?.detail || 'Código de verificação enviado'
        };
      }
      
      // Re-throw o erro para ser tratado no componente
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUsuario(null);
  };

  const value = {
    usuario,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token && !!usuario
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
