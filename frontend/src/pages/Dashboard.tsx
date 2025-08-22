import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  UserCheck,
  Package,
  BarChart3,
  Trophy,
  ArrowRight,
  Plus
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  // Mock data - em produção viria da API
  const stats = {
    eventos: { total: 12, mes: 3, percentual: 25 },
    vendas: { total: 1247, mes: 189, percentual: 15 },
    usuarios: { total: 89, mes: 12, percentual: 13 },
    receita: { total: 45670, mes: 8940, percentual: 18 }
  };

  const recentEvents = [
    { id: 1, nome: 'Festival de Música 2024', data: '2024-02-15', status: 'ativo', participantes: 250 },
    { id: 2, nome: 'Conferência Tech', data: '2024-02-20', status: 'pendente', participantes: 150 },
    { id: 3, nome: 'Workshop Design', data: '2024-02-25', status: 'ativo', participantes: 75 }
  ];

  const quickActions = [
    { icon: Calendar, label: 'Novo Evento', path: '/app/eventos/novo', color: 'bg-blue-500' },
    { icon: Package, label: 'Adicionar Produto', path: '/app/produtos/novo', color: 'bg-green-500' },
    { icon: Users, label: 'Gerenciar Usuários', path: '/app/usuarios', color: 'bg-purple-500' },
    { icon: BarChart3, label: 'Ver Relatórios', path: '/app/relatorios', color: 'bg-orange-500' }
  ];

  const StatCard = ({ title, value, subtitle, percentage, icon: Icon, trend }: {
    title: string;
    value: number | string;
    subtitle: string;
    percentage: number;
    icon: any;
    trend: 'up' | 'down';
  }) => (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <Badge variant={trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{percentage}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-heading font-bold">
          Bem-vindo, {user?.nome}! 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo do seu sistema de eventos
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total de Eventos"
          value={stats.eventos.total}
          subtitle={`+${stats.eventos.mes} este mês`}
          percentage={stats.eventos.percentual}
          icon={Calendar}
          trend="up"
        />
        <StatCard
          title="Vendas Realizadas"
          value={stats.vendas.total}
          subtitle={`+${stats.vendas.mes} este mês`}
          percentage={stats.vendas.percentual}
          icon={ShoppingCart}
          trend="up"
        />
        <StatCard
          title="Usuários Ativos"
          value={stats.usuarios.total}
          subtitle={`+${stats.usuarios.mes} este mês`}
          percentage={stats.usuarios.percentual}
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Receita Total"
          value={`R$ ${stats.receita.total.toLocaleString()}`}
          subtitle={`+R$ ${stats.receita.mes.toLocaleString()} este mês`}
          percentage={stats.receita.percentual}
          icon={DollarSign}
          trend="up"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Ações Rápidas</span>
            </CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 w-full border-2 hover:border-primary/50"
                    onClick={() => window.location.href = action.path}
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Eventos Recentes</CardTitle>
              <CardDescription>
                Seus eventos mais recentes
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((evento) => (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{evento.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(evento.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={evento.status === 'ativo' ? 'default' : 'secondary'}>
                      {evento.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">{evento.participantes}</p>
                      <p className="text-xs text-muted-foreground">participantes</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Performance</span>
            </CardTitle>
            <CardDescription>
              Métricas de desempenho do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Check-in</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-[85%]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Satisfação</span>
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-[92%]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversão de Vendas</span>
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-[78%]" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Último Check-in</span>
                  </div>
                  <span className="text-sm text-muted-foreground">2 min atrás</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
