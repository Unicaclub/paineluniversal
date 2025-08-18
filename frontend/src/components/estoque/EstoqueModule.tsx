import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, BarChart, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { inventoryService } from '../../services/inventory';
import { StockPositionModal } from './StockPositionModal';
import { StockEntryModal } from './StockEntryModal';
import { StockExitModal } from './StockExitModal';
import { TransferModal } from './TransferModal';
import { MovementHistoryModal } from './MovementHistoryModal';
import { ManageReasonsModal } from './ManageReasonsModal';

interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  todayMovements: number;
}

const EstoqueModule: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockProducts: 0,
    todayMovements: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedModal, setSelectedModal] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground">
            Gerencie seu inventário, movimentações e posições de estoque
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setSelectedModal('new-movement')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card className={stats.lowStockProducts > 0 ? "border-destructive bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Baixo Estoque</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.lowStockProducts > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lowStockProducts > 0 ? 'text-destructive' : ''}`}>
              {loading ? '...' : stats.lowStockProducts}
            </div>
            <p className={`text-xs ${stats.lowStockProducts > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {stats.lowStockProducts > 0 ? 'Requer atenção imediata' : 'Estoque adequado'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.todayMovements}
            </div>
            <p className="text-xs text-muted-foreground">
              Entradas e saídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedModal('stock-position')}>
          <CardHeader>
            <CardTitle className="text-lg">Posição de Estoque</CardTitle>
            <CardDescription>
              Visualize a posição atual de todos os produtos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver Posições
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedModal('stock-entry')}>
          <CardHeader>
            <CardTitle className="text-lg">Entrada de Mercadorias</CardTitle>
            <CardDescription>
              Registre entradas de produtos no estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Nova Entrada
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedModal('stock-exit')}>
          <CardHeader>
            <CardTitle className="text-lg">Saída de Mercadorias</CardTitle>
            <CardDescription>
              Registre saídas e consumo de produtos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Nova Saída
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedModal('transfer')}>
          <CardHeader>
            <CardTitle className="text-lg">Transferências</CardTitle>
            <CardDescription>
              Transfira produtos entre locais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Nova Transferência
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedModal('movement-history')}>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Movimentações</CardTitle>
            <CardDescription>
              Consulte todas as movimentações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver Histórico
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedModal('manage-reasons')}>
          <CardHeader>
            <CardTitle className="text-lg">Motivos de Movimentação</CardTitle>
            <CardDescription>
              Configure motivos para as movimentações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Gerenciar Motivos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas movimentações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Entrada - Bebidas Variadas</p>
                  <p className="text-sm text-muted-foreground">50 unidades • Depósito Principal</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">Entrada</Badge>
                <p className="text-xs text-muted-foreground mt-1">Há 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Saída - Copo Descartável 300ml</p>
                  <p className="text-sm text-muted-foreground">200 unidades • Bar Principal</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="destructive">Saída</Badge>
                <p className="text-xs text-muted-foreground mt-1">Há 4 horas</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Transferência - Gelo em Cubos</p>
                  <p className="text-sm text-muted-foreground">10 kg • Depósito → Bar VIP</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline">Transferência</Badge>
                <p className="text-xs text-muted-foreground mt-1">Há 6 horas</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="ghost" className="w-full" onClick={() => setSelectedModal('movement-history')}>
              Ver Todas as Movimentações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedModal === 'stock-position' && (
        <StockPositionModal 
          isOpen={true} 
          onClose={() => setSelectedModal(null)}
          onRefresh={loadDashboardStats}
        />
      )}
      
      {selectedModal === 'stock-entry' && (
        <StockEntryModal 
          isOpen={true} 
          onClose={() => setSelectedModal(null)}
          onSuccess={loadDashboardStats}
        />
      )}
      
      {selectedModal === 'stock-exit' && (
        <StockExitModal 
          isOpen={true} 
          onClose={() => setSelectedModal(null)}
          onSuccess={loadDashboardStats}
        />
      )}
      
      {selectedModal === 'transfer' && (
        <TransferModal 
          isOpen={true} 
          onClose={() => setSelectedModal(null)}
          onSuccess={loadDashboardStats}
        />
      )}
      
      {selectedModal === 'movement-history' && (
        <MovementHistoryModal 
          isOpen={true} 
          onClose={() => setSelectedModal(null)}
        />
      )}
      
      {selectedModal === 'manage-reasons' && (
        <ManageReasonsModal 
          isOpen={true} 
          onClose={() => setSelectedModal(null)}
        />
      )}
    </div>
  );
};

export default EstoqueModule;
