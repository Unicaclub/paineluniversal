import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface VendasWidgetProps {
  dados: any;
}

const VendasWidget: React.FC<VendasWidgetProps> = ({ dados }) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Análise de Vendas
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">IA</span>
        </CardTitle>
        <CardDescription>
          Performance de vendas com insights inteligentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-4 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfico de Análise de Vendas</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Receita Total:</span>
              <span className="font-medium">R$ {dados.receitaTotal?.toLocaleString() || '0'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ticket Médio:</span>
              <span className="font-medium">R$ {dados.ticketMedio?.toLocaleString() || '0'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total de Pedidos:</span>
              <span className="font-medium">{dados.totalPedidos || 0}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Crescimento:</span>
              <span className={`font-medium ${dados.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dados.crescimento >= 0 ? '+' : ''}{dados.crescimento || 0}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Atingimento Meta:</span>
              <span className={`font-medium ${dados.atingimentoMeta >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                {dados.atingimentoMeta || 0}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversão:</span>
              <span className="font-medium">{dados.taxaConversao || 0}%</span>
            </div>
          </div>
        </div>

        {dados.topProdutos && dados.topProdutos.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">🏆 Top Produtos</h4>
            <div className="space-y-2">
              {dados.topProdutos.slice(0, 3).map((produto: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{produto.nome}</span>
                  <span className="text-sm font-medium">R$ {produto.vendas?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendasWidget;
