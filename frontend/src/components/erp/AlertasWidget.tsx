import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AlertasWidgetProps {
  alertas: Array<{
    tipo: string;
    titulo: string;
    descricao: string;
    acao?: string;
    criadoEm: string;
  }>;
}

const AlertasWidget: React.FC<AlertasWidgetProps> = ({ alertas = [] }) => {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return 'bg-red-100 text-red-800';
      case 'alerta':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'sucesso':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return '🚨';
      case 'alerta':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'sucesso':
        return '✅';
      default:
        return '📢';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔔 Alertas Inteligentes
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">IA</span>
        </CardTitle>
        <CardDescription>
          Notificações e insights gerados automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {alertas.length > 0 ? (
            alertas.map((alerta, index) => (
              <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getTipoIcon(alerta.tipo)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{alerta.titulo}</p>
                      <span className={`px-2 py-1 rounded text-xs ${getTipoColor(alerta.tipo)}`}>
                        {alerta.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{alerta.descricao}</p>
                    
                    {alerta.acao && (
                      <p className="text-xs font-medium text-blue-600">
                        💡 {alerta.acao}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alerta.criadoEm).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-gray-500">Nenhum alerta no momento</p>
              <p className="text-xs text-gray-400">Tudo funcionando perfeitamente!</p>
            </div>
          )}
        </div>

        {alertas.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-red-50 rounded">
                <p className="text-red-600 font-medium">
                  {alertas.filter(a => a.tipo === 'critico').length}
                </p>
                <p className="text-gray-600">Críticos</p>
              </div>
              
              <div className="p-2 bg-yellow-50 rounded">
                <p className="text-yellow-600 font-medium">
                  {alertas.filter(a => a.tipo === 'alerta').length}
                </p>
                <p className="text-gray-600">Alertas</p>
              </div>
              
              <div className="p-2 bg-blue-50 rounded">
                <p className="text-blue-600 font-medium">
                  {alertas.filter(a => a.tipo === 'info').length}
                </p>
                <p className="text-gray-600">Informativos</p>
              </div>
            </div>
            
            <button className="w-full mt-3 px-4 py-2 border rounded-md hover:bg-gray-50 text-sm">
              📋 Ver Todos os Alertas
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertasWidget;
