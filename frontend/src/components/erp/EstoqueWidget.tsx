import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface EstoqueWidgetProps {
  dados: any;
}

const EstoqueWidget: React.FC<EstoqueWidgetProps> = ({ dados }) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📦 Estoque Inteligente
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">ABC-XYZ</span>
        </CardTitle>
        <CardDescription>
          Classificação automática e previsão de demanda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 mb-4 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfico ABC-XYZ</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Valor Total Estoque:</span>
            <span className="font-medium">R$ {dados.valorTotal?.toLocaleString() || '0'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Giro de Estoque:</span>
            <span className="font-medium">{dados.giroEstoque || 0}x</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Itens em Ruptura:</span>
            <span className={`font-medium ${dados.itensRuptura > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {dados.itensRuptura || 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Previsão Demanda:</span>
            <span className="font-medium text-blue-600">
              {dados.previsaoDemanda || 0} unidades
            </span>
          </div>
        </div>

        {dados.alertasEstoque && dados.alertasEstoque.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">⚠️ Alertas de Estoque</h4>
            <div className="space-y-2">
              {dados.alertasEstoque.slice(0, 3).map((alerta: any, index: number) => (
                <div key={index} className="p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                  <p className="font-medium">{alerta.produto}</p>
                  <p className="text-gray-600">{alerta.mensagem}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstoqueWidget;
