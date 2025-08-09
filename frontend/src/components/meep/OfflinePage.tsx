import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

const OfflinePage: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center p-6">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <WifiOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Você está offline
          </h1>
          <p className="text-gray-300">
            Verifique sua conexão com a internet e tente novamente.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar novamente
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Ir para início
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-sm text-blue-300">
            💡 <strong>Dica:</strong> Algumas funcionalidades podem estar disponíveis offline.
            Suas ações serão sincronizadas quando a conexão for restaurada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
