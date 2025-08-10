import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface IntegracaoWidgetProps {
  dados: any;
}

const IntegracaoWidget: React.FC<IntegracaoWidgetProps> = ({ dados }) => {
  const integracoes = [
    { nome: 'OMIE', status: dados.omie?.status || 'desconectado', ultimaSync: dados.omie?.ultimaSync },
    { nome: 'Sankhya', status: dados.sankhya?.status || 'desconectado', ultimaSync: dados.sankhya?.ultimaSync },
    { nome: 'Bling', status: dados.bling?.status || 'desconectado', ultimaSync: dados.bling?.ultimaSync },
    { nome: 'Mercado Livre', status: dados.mercadolivre?.status || 'desconectado', ultimaSync: dados.mercadolivre?.ultimaSync },
    { nome: 'Amazon', status: dados.amazon?.status || 'desconectado', ultimaSync: dados.amazon?.ultimaSync },
    { nome: 'Shopify', status: dados.shopify?.status || 'desconectado', ultimaSync: dados.shopify?.ultimaSync }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'bg-green-100 text-green-800';
      case 'sincronizando':
        return 'bg-blue-100 text-blue-800';
      case 'erro':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conectado':
        return '✅';
      case 'sincronizando':
        return '🔄';
      case 'erro':
        return '❌';
      default:
        return '⚪';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 Integrações Nativas
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Universal</span>
        </CardTitle>
        <CardDescription>
          Status das integrações com ERPs e marketplaces
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {integracoes.map((integracao, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getStatusIcon(integracao.status)}</span>
                <div>
                  <p className="font-medium text-sm">{integracao.nome}</p>
                  {integracao.ultimaSync && (
                    <p className="text-xs text-gray-500">
                      Última sync: {new Date(integracao.ultimaSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(integracao.status)}`}>
                {integracao.status}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-2 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Conectadas</p>
              <p className="text-lg font-bold text-green-600">
                {integracoes.filter(i => i.status === 'conectado').length}
              </p>
            </div>
            
            <div className="p-2 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-lg font-bold text-blue-600">
                {integracoes.length}
              </p>
            </div>
          </div>
          
          <button className="w-full mt-3 px-4 py-2 border rounded-md hover:bg-gray-50 text-sm">
            ⚙️ Gerenciar Integrações
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegracaoWidget;
