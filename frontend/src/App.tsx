import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useUIStore } from './stores/uiStore';
import { useAuthStore } from './stores/authStore';
import { Toaster } from './components/ui/toaster';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';
import NotificationContainer from './components/common/NotificationContainer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';

// CSS
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const { theme } = useUIStore();
  const { isLoading, user } = useAuthStore();

  // Apply theme to document
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check for existing session on app start
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // TODO: Validate token and restore user session
      useAuthStore.getState().validateToken();
    }
  }, [user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="produtos" element={<Produtos />} />
              
              {/* Placeholder routes - TODO: Create components */}
              <Route path="eventos" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Eventos</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="vendas" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Vendas</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="checkin" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Check-in Inteligente</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="mobile-checkin" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Check-in Mobile</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="pdv" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">PDV</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="listas" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Listas & Convidados</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="estoque" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Estoque</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="financeiro" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Caixa & Financeiro</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="ranking" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Ranking & Gamificação</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="usuarios" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Usuários</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="empresas" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Empresas</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="relatorios" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Relatórios</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="configuracoes" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Configurações</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              
              {/* Produtos sub-routes */}
              <Route path="produtos/categorias" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Categorias de Produtos</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="produtos/agendamento" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Agendamento de Produtos</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="produtos/importexport" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Import/Export de Produtos</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="produtos/lista" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Lista de Produtos</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="produtos/acesso" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Limitar Acesso a Produtos</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
              <Route path="produtos/ignorados" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Produtos Ignorados</h1>
                  <p className="text-muted-foreground">Página em desenvolvimento</p>
                </div>
              } />
            </Route>
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
            
            {/* 404 fallback */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-muted-foreground mb-4">Página não encontrada</p>
                  <button
                    onClick={() => window.location.href = '/app/dashboard'}
                    className="text-primary hover:underline"
                  >
                    Voltar ao Dashboard
                  </button>
                </div>
              </div>
            } />
          </Routes>
          
          {/* Global Components */}
          <NotificationContainer />
          <Toaster />
        </div>
      </Router>
      
      {/* Development Tools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
