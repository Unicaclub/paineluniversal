import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ThemeToggle } from '../theme/ThemeToggle';
import { 
  Loader2, 
  Calendar, 
  UserPlus, 
  LogIn, 
  CheckCircle, 
  Shield,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Clock
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { publicService } from '../../services/api';

const LoginForm: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [codigoVerificacao, setCodigoVerificacao] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'ok' | 'error'>('testing');

  const { login } = useAuth();
  const { effectiveTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔧 TESTE DE CONECTIVIDADE AO CARREGAR
  useEffect(() => {
    const testBackendConnection = async () => {
      console.log('🧪 Testando conectividade com backend...');
      const result = await publicService.testConnection();
      
      if (result.success) {
        setConnectionStatus('ok');
        console.log('✅ Backend conectado com sucesso');
      } else {
        setConnectionStatus('error');
        console.error('❌ Falha na conexão com backend:', result);
        setError(`Erro de conectividade: ${result.error}`);
      }
    };

    testBackendConnection();
  }, []);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    if (formatted.length <= 14) {
      setCpf(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cpfNumbers = cpf.replace(/\D/g, '');
      
      if (cpfNumbers.length !== 11) {
        setError('CPF deve ter 11 dígitos');
        setLoading(false);
        return;
      }

      console.log('🚀 Iniciando processo de login...');
      const result = await login(cpfNumbers, senha, codigoVerificacao);
      console.log('📋 Resultado do login:', result);

      if (result.success) {
        console.log('✅ Login bem-sucedido, redirecionando...');
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
          duration: 2000,
        });
        // Redirecionar imediatamente em vez de usar setTimeout
        navigate('/app/dashboard', { replace: true });
      } else if (result.needsVerification) {
        console.log('📱 Verificação necessária');
        setNeedsVerification(true);
        setVerificationMessage(result.message);
        
        // Verificar se é envio por email baseado na mensagem
        const isEmailSent = result.message.includes('email');
        
        toast({
          title: isEmailSent ? "📧 Código enviado por email" : "Código de verificação enviado",
          description: isEmailSent 
            ? "Verifique sua caixa de entrada e spam"
            : "Digite o código de 6 dígitos enviado.",
          duration: 5000,
        });
      } else {
        console.warn('⚠️ Resultado inesperado:', result);
      }
    } catch (error: any) {
      console.error('❌ Erro capturado no submit:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Erro ao fazer login';
      setError(errorMessage);
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <motion.div 
        className="max-w-md w-full space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.div 
            className="mx-auto h-16 w-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-6 shadow-premium-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Sistema Universal de Eventos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {needsVerification 
              ? (verificationMessage?.includes('email') 
                  ? '📧 Verifique seu email e digite o código de verificação'
                  : 'Digite o código de verificação para continuar')
              : 'Faça login para acessar o sistema de gestão'
            }
          </p>
          
          {/* 🔧 INDICADOR DE STATUS DA CONEXÃO */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            {connectionStatus === 'testing' && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                <span className="text-yellow-600">Testando conectividade...</span>
              </>
            )}
            {connectionStatus === 'ok' && (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Backend conectado</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <Shield className="h-3 w-3 text-red-500" />
                <span className="text-red-600">Erro de conectividade</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div variants={cardVariants}>
          <Card className="premium-card bg-card/50 backdrop-blur-xl border-border/50 shadow-premium-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-heading font-semibold text-center flex items-center justify-center gap-2">
                {needsVerification ? (
                  <>
                    <Shield className="h-5 w-5 text-primary" />
                    Verificação de Segurança
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 text-primary" />
                    Entrar no Sistema
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-center">
                {needsVerification
                  ? 'Por segurança, precisamos confirmar sua identidade'
                  : 'Digite suas credenciais para acessar o painel administrativo'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!needsVerification ? (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-sm font-medium text-foreground">
                        CPF
                      </Label>
                      <Input
                        id="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={handleCpfChange}
                        required
                        maxLength={14}
                        className="h-11 text-base bg-background/50 border-border focus:border-primary focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="senha" className="text-sm font-medium text-foreground">
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="senha"
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          required
                          className="h-11 text-base bg-background/50 border-border focus:border-primary focus:ring-primary/20 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {verificationMessage && (
                      <Alert className="border-primary/20 bg-primary/5">
                        <div className="flex items-start gap-2">
                          {verificationMessage.includes('email') ? (
                            <Mail className="h-4 w-4 text-primary mt-0.5" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                          )}
                          <div className="flex-1">
                            <AlertDescription className="text-foreground font-medium">
                              {verificationMessage}
                            </AlertDescription>
                            {verificationMessage.includes('email') && (
                              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                O código expira em 10 minutos. Verifique também a pasta de spam.
                              </div>
                            )}
                          </div>
                        </div>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="codigo" className="text-sm font-medium text-foreground">
                        Código de Verificação
                      </Label>
                      <Input
                        id="codigo"
                        type="text"
                        placeholder="Digite o código de 6 dígitos"
                        value={codigoVerificacao}
                        onChange={(e) => setCodigoVerificacao(e.target.value)}
                        required
                        maxLength={6}
                        className="h-11 text-base text-center tracking-widest font-mono bg-background/50 border-border focus:border-primary focus:ring-primary/20"
                        autoComplete="one-time-code"
                      />
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-premium-md transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <motion.div 
                          className="flex items-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {needsVerification ? 'Verificando...' : 'Entrando...'}
                        </motion.div>
                      ) : (
                        <div className="flex items-center justify-center">
                          {needsVerification ? (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Verificar Código
                            </>
                          ) : (
                            <>
                              Entrar no Sistema
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  {!needsVerification && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link to="/register">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 bg-background/50 border-border hover:bg-muted/50 transition-colors"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Não tem uma conta? Criar conta
                        </Button>
                      </Link>
                    </motion.div>
                  )}

                  {needsVerification && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setNeedsVerification(false);
                          setCodigoVerificacao('');
                          setError('');
                          setVerificationMessage('');
                        }}
                        className="w-full h-11 hover:bg-muted/50"
                      >
                        Voltar ao Login
                      </Button>
                    </motion.div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-foreground mb-3">
              Recursos do Sistema Universal
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Calendar, title: 'Gestão de Eventos', color: 'text-blue-500' },
              { icon: Zap, title: 'Performance Alta', color: 'text-green-500' },
              { icon: Shield, title: 'Segurança Total', color: 'text-purple-500' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="text-center p-3 rounded-lg bg-card/30 backdrop-blur-sm border border-border/50"
              >
                <feature.icon className={`h-6 w-6 mx-auto mb-2 ${feature.color}`} />
                <p className="text-xs text-muted-foreground font-medium">{feature.title}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div 
          className="mt-6 p-4 rounded-lg bg-muted/20 border border-border/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              🚀 Credenciais para Demonstração
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Admin:</span>
                <code className="bg-background/60 px-2 py-1 rounded text-foreground">
                  000.000.000-00 / 0000
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Promoter:</span>
                <code className="bg-background/60 px-2 py-1 rounded text-foreground">
                  111.111.111-11 / promoter123
                </code>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;