import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import DashboardSupremo from '../supremo/DashboardSupremo';
import QRCodeManager from '../supremo/QRCodeManager';
import CashlessMobile from '../supremo/CashlessMobile';
import EventosSupremo from '../supremo/EventosSupremo';
import ClientesSupremo from '../supremo/ClientesSupremo';
import CartoesSupremo from '../supremo/CartoesSupremo';
import OperacoesSupremo from '../supremo/OperacoesSupremo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const TestPage: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            🚀 Sistema Supremo - Teste Visual
          </h1>
          
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="dashboard" className="text-white">
                📊 Dashboard
              </TabsTrigger>
              <TabsTrigger value="eventos" className="text-white">
                🎪 Eventos
              </TabsTrigger>
              <TabsTrigger value="clientes" className="text-white">
                👥 Clientes
              </TabsTrigger>
              <TabsTrigger value="operacoes" className="text-white">
                ⚡ Operações
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <DashboardSupremo />
            </TabsContent>
            
            <TabsContent value="eventos">
              <EventosSupremo />
            </TabsContent>
            
            <TabsContent value="clientes">
              <ClientesSupremo />
            </TabsContent>
            
            <TabsContent value="operacoes">
              <OperacoesSupremo />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default TestPage;
