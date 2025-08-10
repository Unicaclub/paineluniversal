import React from 'react';
import { Card, CardContent } from '../ui/card';
import { 
  Users, 
  MapPin, 
  Clock, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface EstatisticasOperacaoProps {
  estatisticas: {
    total_mesas: number;
    mesas_ocupadas: number;
    mesas_disponveis: number;
    mesas_reservadas: number;
    mesas_bloqueadas: number;
    comandas_abertas: number;
    comandas_bloqueadas: number;
    total_participantes: number;
    faturamento_total: number;
    ticket_medio: number;
  };
}

const EstatisticasOperacao: React.FC<EstatisticasOperacaoProps> = ({ estatisticas }) => {
  const ocupacaoPercentual = estatisticas.total_mesas > 0 
    ? (estatisticas.mesas_ocupadas / estatisticas.total_mesas) * 100 
    : 0;

  const estatisticasCards = [
    {
      titulo: 'Total de Mesas',
      valor: estatisticas.total_mesas,
      icone: MapPin,
      cor: 'text-blue-400',
      fundo: 'bg-blue-500/20',
      borda: 'border-blue-500/50'
    },
    {
      titulo: 'Mesas Disponíveis',
      valor: estatisticas.mesas_disponveis,
      icone: CheckCircle,
      cor: 'text-green-400',
      fundo: 'bg-green-500/20',
      borda: 'border-green-500/50'
    },
    {
      titulo: 'Mesas Ocupadas',
      valor: estatisticas.mesas_ocupadas,
      icone: Users,
      cor: 'text-red-400',
      fundo: 'bg-red-500/20',
      borda: 'border-red-500/50',
      extra: `${ocupacaoPercentual.toFixed(1)}%`
    },
    {
      titulo: 'Mesas Reservadas',
      valor: estatisticas.mesas_reservadas,
      icone: Clock,
      cor: 'text-yellow-400',
      fundo: 'bg-yellow-500/20',
      borda: 'border-yellow-500/50'
    },
    {
      titulo: 'Mesas Bloqueadas',
      valor: estatisticas.mesas_bloqueadas,
      icone: XCircle,
      cor: 'text-gray-400',
      fundo: 'bg-gray-500/20',
      borda: 'border-gray-500/50'
    },
    {
      titulo: 'Comandas Abertas',
      valor: estatisticas.comandas_abertas,
      icone: Clock,
      cor: 'text-blue-400',
      fundo: 'bg-blue-500/20',
      borda: 'border-blue-500/50'
    },
    {
      titulo: 'Comandas Bloqueadas',
      valor: estatisticas.comandas_bloqueadas,
      icone: AlertTriangle,
      cor: 'text-orange-400',
      fundo: 'bg-orange-500/20',
      borda: 'border-orange-500/50'
    },
    {
      titulo: 'Total Participantes',
      valor: estatisticas.total_participantes,
      icone: Users,
      cor: 'text-purple-400',
      fundo: 'bg-purple-500/20',
      borda: 'border-purple-500/50'
    },
    {
      titulo: 'Faturamento Total',
      valor: `R$ ${estatisticas.faturamento_total.toFixed(2)}`,
      icone: DollarSign,
      cor: 'text-green-400',
      fundo: 'bg-green-500/20',
      borda: 'border-green-500/50'
    },
    {
      titulo: 'Ticket Médio',
      valor: `R$ ${estatisticas.ticket_medio.toFixed(2)}`,
      icone: TrendingUp,
      cor: 'text-cyan-400',
      fundo: 'bg-cyan-500/20',
      borda: 'border-cyan-500/50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
      {estatisticasCards.map((stat, index) => {
        const IconeComponente = stat.icone;
        
        return (
          <Card 
            key={index} 
            className={`bg-white/10 backdrop-blur-sm border-white/20 hover:${stat.fundo} transition-colors duration-200`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.fundo} ${stat.borda} border`}>
                  <IconeComponente className={`w-4 h-4 ${stat.cor}`} />
                </div>
                {stat.extra && (
                  <div className={`text-xs ${stat.cor} font-medium`}>
                    {stat.extra}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">
                  {typeof stat.valor === 'number' && stat.titulo !== 'Faturamento Total' && stat.titulo !== 'Ticket Médio' 
                    ? stat.valor.toLocaleString() 
                    : stat.valor
                  }
                </div>
                <div className="text-white/70 text-sm leading-tight">
                  {stat.titulo}
                </div>
              </div>

              {stat.titulo === 'Mesas Ocupadas' && (
                <div className="mt-2">
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className="bg-red-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${ocupacaoPercentual}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EstatisticasOperacao;
