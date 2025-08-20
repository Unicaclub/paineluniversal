import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && usuario) {
    const userType = usuario.tipo || 'admin'; // Fallback para admin se tipo não estiver definido
    if (!requiredRoles.includes(userType)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta página.
              <br />
              Tipo de usuário: {userType}
              <br />
              Tipos permitidos: {requiredRoles.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  }

  // Se há roles requeridas mas usuário não foi carregado ainda, aguardar um pouco mais
  if (requiredRoles.length > 0 && !usuario && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do usuário...</p>
          <p className="text-xs text-gray-400 mt-2">Aguardando resposta do servidor</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
