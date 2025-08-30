import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';
import type { Usuario } from '../types/database';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (cpf: string, senha: string, codigoVerificacao?: string) => Promise<any>;
  logout: () => void;
  revalidateUser: () => Promise<void>;
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
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUsuario = localStorage.getItem('usuario');

        console.log('🔍 AuthContext: Verificando localStorage...', {
          hasToken: !!storedToken,
          hasUsuario: !!storedUsuario,
          tokenLength: storedToken?.length,
          usuarioContent: storedUsuario?.substring(0, 50)
        });

        if (storedToken) {
          setToken(storedToken);
          
          // Verificar se temos dados válidos do usuário
          let usuarioValido = false;
          if (storedUsuario && storedUsuario !== 'undefined' && storedUsuario !== 'null') {
            try {
              const parsedUsuario = JSON.parse(storedUsuario);
              if (parsedUsuario && typeof parsedUsuario === 'object' && parsedUsuario.nome) {
                // COMPATIBILIDADE: Garantir que tanto 'tipo' quanto 'tipo_usuario' funcionem
                if (parsedUsuario.tipo_usuario && !parsedUsuario.tipo) {
                  parsedUsuario.tipo = parsedUsuario.tipo_usuario;
                }
                setUsuario(parsedUsuario);
                usuarioValido = true;
                console.log('✅ AuthContext: Dados do usuário restaurados com sucesso', {
                  id: parsedUsuario.id,
                  nome: parsedUsuario.nome,
                  tipo: parsedUsuario.tipo,
                  tipo_usuario: parsedUsuario.tipo_usuario
                });
              }
            } catch (error) {
              console.error('❌ AuthContext: Erro ao fazer parse do usuário armazenado:', error);
            }
          }

          // Se tem token mas não tem dados válidos do usuário, buscar do backend
          if (!usuarioValido) {
            console.log('🔄 AuthContext: Token encontrado, mas sem dados do usuário. Buscando do backend...');
            try {
              const userData = await authService.getProfile();
              if (userData) {
                // COMPATIBILIDADE APRIMORADA: Garantir que tanto 'tipo' quanto 'tipo_usuario' funcionem
                if (userData.tipo_usuario && !userData.tipo) {
                  userData.tipo = userData.tipo_usuario;
                }
                // VALIDAÇÃO: Garantir que o tipo seja válido
                const validTypes = ['admin', 'promoter', 'cliente', 'operador'];
                if (!validTypes.includes(userData.tipo || '') && !validTypes.includes(userData.tipo_usuario || '')) {
                  userData.tipo = 'promoter'; // Fallback seguro
                  console.warn('⚠️ AuthContext: Tipo de usuário inválido, usando fallback: promoter');
                }
                
                setUsuario(userData);
                localStorage.setItem('usuario', JSON.stringify(userData));
                console.log('✅ AuthContext: Dados do usuário atualizados do backend', {
                  id: userData.id,
                  nome: userData.nome,
                  tipo: userData.tipo,
                  tipo_usuario: userData.tipo_usuario
                });
              }
            } catch (error) {
              console.error('❌ AuthContext: Erro ao buscar dados do usuário:', error);
              // Token pode estar inválido, limpar
              localStorage.removeItem('token');
              localStorage.removeItem('usuario');
              setToken(null);
              setUsuario(null);
            }
          }
        } else {
          console.log('ℹ️ AuthContext: Nenhum token encontrado');
        }
      } catch (error) {
        console.error('❌ AuthContext: Erro na inicialização:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (cpf: string, senha: string, codigoVerificacao?: string) => {
    try {
      setLoading(true);
      console.log('🔐 AuthContext: Iniciando login...', { cpf: cpf.substring(0, 3) + '***' });

      const loginData: any = { cpf, senha };
      if (codigoVerificacao) {
        loginData.codigo_verificacao = codigoVerificacao;
      }

      const response = await authService.login(loginData);
      
      if (response.access_token && response.usuario) {
        // COMPATIBILIDADE: Normalizar dados do usuário
        const userData = { ...response.usuario };
        if (userData.tipo_usuario && !userData.tipo) {
          userData.tipo = userData.tipo_usuario;
        }
        
        // Validar tipo de usuário
        const validTypes = ['admin', 'promoter', 'cliente', 'operador'];
        if (!validTypes.includes(userData.tipo || '')) {
          userData.tipo = 'promoter'; // Fallback seguro
        }

        setToken(response.access_token);
        setUsuario(userData);
        
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('usuario', JSON.stringify(userData));
        
        console.log('✅ AuthContext: Login realizado com sucesso', {
          id: userData.id,
          nome: userData.nome,
          tipo: userData.tipo
        });
        
        return response;
      } else {
        throw new Error('Resposta de login inválida');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no login:', error);
      
      // Se erro é relacionado a código de verificação
      if (error.response?.status === 202) {
        return { needsVerification: true, ...error.response.data };
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Fazendo logout...');
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Chamar logout no serviço se disponível
    try {
      authService.logout();
    } catch (error) {
      console.error('❌ AuthContext: Erro ao fazer logout no serviço:', error);
    }
    
    console.log('✅ AuthContext: Logout concluído');
  };

  const revalidateUser = async () => {
    try {
      if (!token) {
        console.log('ℹ️ AuthContext: Não há token para revalidar');
        return;
      }

      console.log('🔄 AuthContext: Revalidando dados do usuário...');
      const userData = await authService.getProfile();
      
      if (userData) {
        // COMPATIBILIDADE: Normalizar dados do usuário
        if (userData.tipo_usuario && !userData.tipo) {
          userData.tipo = userData.tipo_usuario;
        }
        
        setUsuario(userData);
        localStorage.setItem('usuario', JSON.stringify(userData));
        
        console.log('✅ AuthContext: Dados do usuário revalidados', {
          id: userData.id,
          nome: userData.nome,
          tipo: userData.tipo
        });
      }
    } catch (error) {
      console.error('❌ AuthContext: Erro ao revalidar usuário:', error);
      // Se erro 401, token pode estar inválido
      if ((error as any)?.response?.status === 401) {
        logout();
      }
    }
  };

  const isAuthenticated = !!token && !!usuario;

  const value: AuthContextType = {
    usuario,
    token,
    login,
    logout,
    revalidateUser,
    loading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
