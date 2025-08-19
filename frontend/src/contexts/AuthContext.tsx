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
      try {
        setToken(storedToken);
        setUsuario(JSON.parse(storedUsuario));
      } catch (error) {
        console.error('Erro ao fazer parse do usuário armazenado:', error);
        // Limpar dados corrompidos
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  const login = async (cpf: string, senha: string, codigoVerificacao?: string) => {
    try {
      console.log('🔐 AuthContext: Iniciando login...');
      
      const response = await authService.login({
        cpf,
        senha,
        codigo_verificacao: codigoVerificacao
      });

      console.log('📊 AuthContext: Resposta recebida:', {
        hasToken: !!response.access_token,
        hasUsuario: !!response.usuario,
        usuarioNome: response.usuario?.nome,
        responseKeys: Object.keys(response)
      });

      if (response.access_token) {
        try {
          setToken(response.access_token);
          
          // Verificar se tem usuário na resposta
          if (response.usuario) {
            setUsuario(response.usuario);
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            console.log('✅ AuthContext: Login completo com usuário');
          } else {
            console.warn('⚠️ AuthContext: Token válido, mas sem dados de usuário');
            // Ainda assim considerar login bem-sucedido
          }
          
          localStorage.setItem('token', response.access_token);
          console.log('✅ AuthContext: Login bem-sucedido e dados salvos');
          return { success: true };
        } catch (storageError) {
          console.error('❌ Erro ao salvar no localStorage:', storageError);
          return { success: false, error: 'Erro ao salvar dados de login' };
        }
      }

      // Verificar se precisa de verificação
      if ((response as any).detail && (response as any).detail.includes('Código de verificação enviado')) {
        console.log('📱 AuthContext: Verificação necessária');
        return {
          success: false,
          needsVerification: true,
          message: (response as any).detail
        };
      }

      console.error('❌ AuthContext: Resposta inválida:', response);
      return { success: false, error: 'Resposta inválida do servidor' };
      
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no login:', error);
      
      if (error.response?.status === 202) {
        console.log('📱 AuthContext: Status 202 - Verificação necessária');
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
