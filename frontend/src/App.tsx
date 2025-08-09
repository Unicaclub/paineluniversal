import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/dashboard/Dashboard';
import DashboardSupremo from './components/supremo/DashboardSupremo';
import QRCodeManager from './components/supremo/QRCodeManager';
import TestPage from './components/test/TestPage';
import SalesModule from './components/sales/SalesModule';
import CheckinModule from './components/checkin/CheckinModule';
import EventosModule from './components/eventos/EventosModule';
import MobileCheckinModule from './components/mobile/MobileCheckinModule';
import PDVModule from './components/pdv/PDVModule';
import DashboardPDV from './components/pdv/DashboardPDV';
import DashboardAvancado from './components/dashboard/DashboardAvancado';
import ListasModule from './components/listas/ListasModule';
import CaixaEvento from './components/financeiro/CaixaEvento';
import RankingModule from './components/ranking/RankingModule';
import { UsuariosModule } from './components/usuarios';
import PublicRegisterPage from './components/auth/PublicRegisterPage';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="universal-eventos-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<PublicRegisterPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard-supremo" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter']}>
                          <DashboardSupremo />
                        </ProtectedRoute>
                      } />
                      <Route path="/test-supremo" element={<DashboardSupremo />} />
                      <Route path="/test-qrcode" element={<QRCodeManager />} />
                      <Route path="/test-visual" element={<TestPage />} />
                      <Route path="/eventos" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter']}>
                          <EventosModule />
                        </ProtectedRoute>
                      } />
                      <Route path="/vendas" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter', 'operador']}>
                          <SalesModule />
                        </ProtectedRoute>
                      } />
                      <Route path="/checkin" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter', 'operador']}>
                          <CheckinModule />
                        </ProtectedRoute>
                      } />
                      <Route path="/checkin-inteligente" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter', 'operador']}>
                          <CheckinModule />
                        </ProtectedRoute>
                      } />
                      <Route path="/mobile-checkin" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter', 'operador']}>
                          <MobileCheckinModule />
                        </ProtectedRoute>
                      } />
                      <Route path="/pdv" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter']}>
                          <PDVModule />
                        </ProtectedRoute>
                      } />
                      <Route path="/pdv/dashboard" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter']}>
                          <DashboardPDV eventoId={1} />
                        </ProtectedRoute>
                      } />
                      <Route path="/usuarios" element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <UsuariosModule />
                        </ProtectedRoute>
                      } />
                      <Route path="/empresas" element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <div className="p-8 text-center animate-fade-in">
                            <h1 className="text-2xl font-heading font-bold text-foreground">Módulo de Empresas</h1>
                            <p className="text-muted-foreground mt-2">Em desenvolvimento</p>
                          </div>
                        </ProtectedRoute>
                      } />
                      <Route path="/listas" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter']}>
                          <ListasModule />
                        </ProtectedRoute>
                      } />
                      <Route path="/financeiro" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter']}>
                          <CaixaEvento />
                        </ProtectedRoute>
                      } />
                      <Route path="/ranking" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter']}>
                          <RankingModule />
                        </ProtectedRoute>
                      } />
                      <Route path="/relatorios" element={
                        <ProtectedRoute requiredRoles={['admin', 'promoter']}>
                          <DashboardAvancado />
                        </ProtectedRoute>
                      } />
                      <Route path="/configuracoes" element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <div className="p-8 text-center animate-fade-in">
                            <h1 className="text-2xl font-heading font-bold text-foreground">Configurações</h1>
                            <p className="text-muted-foreground mt-2">Em desenvolvimento</p>
                          </div>
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
