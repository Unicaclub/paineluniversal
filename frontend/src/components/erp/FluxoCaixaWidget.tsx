import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface FluxoCaixaWidgetProps {
  dados: any;
}

const FluxoCaixaWidget: React.FC<FluxoCaixaWidgetProps> = ({ dados }) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💳 Fluxo de Caixa Preditivo
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">IA</span>
        </CardTitle>
        <CardDescription>
          Projeção inteligente baseada em machine learning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-4 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfico de Fluxo de Caixa</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Saldo Atual</p>
            <p className="text-lg font-bold text-blue-600">
              R$ {dados.saldoAtual?.toLocaleString() || '0'}
            </p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Maior Saldo</p>
            <p className="text-lg font-bold text-green-600">
              R$ {dados.maiorSaldo?.toLocaleString() || '0'}
            </p>
          </div>
          
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Menor Saldo</p>
            <p className="text-lg font-bold text-red-600">
              R$ {dados.menorSaldo?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {dados.alertas && dados.alertas.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm">⚠️ Alertas de Fluxo de Caixa</h4>
            {dados.alertas.map((alerta: any, index: number) => (
              <div key={index} className="p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                <p className="font-medium">{alerta.titulo}</p>
                <p className="text-gray-600">{alerta.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FluxoCaixaWidget;
