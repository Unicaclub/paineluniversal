import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPortal: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    cpf: '000.000.000-00',
    senha: 'admin123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.cpf === '000.000.000-00' && formData.senha === 'admin123') {
        const demoToken = 'demo_token_' + Date.now();
        const demoUser = {
          id: '1',
          nome: 'Administrador Sistema',
          email: 'admin@eventos.com',
          cpf: '000.000.000-00',
          tipo: 'admin',
          empresa_id: '1'
        };
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('usuario', JSON.stringify(demoUser));
        
        showNotification('Login realizado com sucesso!', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard-supremo';
        }, 1500);
      } else {
        const result = await login(formData.cpf, formData.senha);
        
        if (result.success) {
          showNotification('Login realizado com sucesso!', 'success');
          setTimeout(() => {
            navigate('/dashboard-supremo');
          }, 1500);
        } else if (result.needsVerification) {
          showNotification(result.message, 'info');
          setIsLoading(false);
        } else {
          showNotification('CPF ou senha incorretos!', 'error');
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      showNotification('Erro ao fazer login. Tente novamente.', 'error');
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 relative">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-20 h-20 bg-white/10 rounded-full top-[10%] left-[10%] animate-pulse" 
             style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <div className="absolute w-30 h-30 bg-white/10 rounded-full top-[70%] left-[80%] animate-pulse" 
             style={{ animationDelay: '2s', animationDuration: '6s' }} />
        <div className="absolute w-15 h-15 bg-white/10 rounded-full top-[40%] left-[70%] animate-pulse" 
             style={{ animationDelay: '4s', animationDuration: '6s' }} />
        <div className="absolute w-25 h-25 bg-white/10 rounded-full top-[80%] left-[20%] animate-pulse" 
             style={{ animationDelay: '1s', animationDuration: '6s' }} />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-10 relative z-10">
        <div className="text-center text-white">
          <div className="text-6xl mb-5 animate-pulse">🚀</div>
          <h1 className="text-5xl font-extrabold mb-5 leading-tight">
            SISTEMA SUPREMO<br />DE EVENTOS
          </h1>
          <p className="text-xl mb-8 opacity-90 font-light">
            Plataforma Completa de Gestão de Eventos + Cashless Integrado
          </p>
          
          <div className="grid grid-cols-2 gap-5 max-w-2xl">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-5 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl mb-2">💳</div>
              <div className="text-white font-semibold">Sistema Cashless</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-5 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl mb-2">🔒</div>
              <div className="text-white font-semibold">CPF Seguro</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-5 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-white font-semibold">Analytics IA</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-5 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-white font-semibold">Tempo Real</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="w-[450px] bg-gray-800/95 backdrop-blur-xl flex flex-col justify-center items-center p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />
        
        <div className="w-full max-w-sm z-10 relative">
          <div className="text-center mb-10 text-white">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Bem-vindo(a)
            </h2>
            <p className="text-lg opacity-80 font-light">à sua nova experiência</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-300 font-medium">CPF *</Label>
              <Input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:bg-white/15 transition-all duration-300 h-12"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <Label className="text-gray-300 font-medium">Senha *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:bg-white/15 transition-all duration-300 h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => showNotification('Link de recuperação enviado para seu e-mail!', 'success')}
                className="text-blue-400 hover:text-purple-400 text-sm transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold h-12 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-800 px-4 text-white/60">ou</span>
            </div>
          </div>

          <div className="text-center text-white/80 text-sm">
            Não tem cadastro?{' '}
            <button
              onClick={() => showNotification('Funcionalidade de registro em desenvolvimento!', 'info')}
              className="text-blue-400 hover:text-purple-400 font-semibold transition-colors"
            >
              Cadastrar agora
            </button>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-white/60 text-xs">
          <div>🔒 SSL Seguro | 📱 PWA Mobile | ⚡ Cloud Native</div>
          <div className="mt-1">Sistema Supremo v2.0 - © 2025</div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 p-4 rounded-xl shadow-lg z-50 transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600' 
            : notification.type === 'info'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
            : 'bg-gradient-to-r from-red-500 to-red-600'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default LoginPortal;
