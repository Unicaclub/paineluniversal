import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { Usuario } from '../../types/main';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Usuario['tipo'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Se ainda está carregando, não renderizar nada ou mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se tem roles requeridas, verificar se o usuário tem permissão
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.tipo);
    
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Acesso Negado
            </h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
