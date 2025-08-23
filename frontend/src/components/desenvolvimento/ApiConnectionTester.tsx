import React, { useState, useEffect } from 'react';
import { testApiConnection } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';

interface ConnectionStatus {
  success: boolean;
  data?: any;
  error?: string;
  details?: {
    status?: number;
    statusText?: string;
    baseURL?: string;
  };
  timestamp?: Date;
}

const ApiConnectionTester: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoTest, setAutoTest] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const result = await testApiConnection();
      setConnectionStatus({
        ...result,
        timestamp: new Date()
      });
    } catch (error: any) {
      setConnectionStatus({
        success: false,
        error: error.message,
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Teste inicial
    runConnectionTest();

    // Auto-teste a cada 30 segundos se ativado
    let interval: NodeJS.Timeout;
    if (autoTest) {
      interval = setInterval(runConnectionTest, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoTest]);

  const StatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (connectionStatus?.success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const StatusBadge = () => {
    if (isLoading) return <Badge variant="outline">Testando...</Badge>;
    if (connectionStatus?.success) return <Badge variant="default" className="bg-green-500">Conectado</Badge>;
    return <Badge variant="destructive">Desconectado</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon />
          Teste de Conectividade Backend
        </CardTitle>
        <CardDescription>
          Monitor de status da conexão entre frontend e backend
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge />
          <div className="flex items-center gap-2">
            <Button
              onClick={runConnectionTest}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Testar Agora
            </Button>
            <Button
              onClick={() => setAutoTest(!autoTest)}
              size="sm"
              variant={autoTest ? "default" : "outline"}
            >
              Auto-teste {autoTest ? "Ativo" : "Inativo"}
            </Button>
          </div>
        </div>

        {connectionStatus && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Último teste: {connectionStatus.timestamp?.toLocaleTimeString()}
            </div>

            {connectionStatus.success ? (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">✅ Conexão Bem-sucedida</h4>
                {connectionStatus.data && (
                  <pre className="text-xs bg-green-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(connectionStatus.data, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Falha na Conexão
                </h4>
                <div className="text-sm text-red-700 space-y-1">
                  <div><strong>Erro:</strong> {connectionStatus.error}</div>
                  {connectionStatus.details && (
                    <>
                      {connectionStatus.details.status && (
                        <div><strong>Status HTTP:</strong> {connectionStatus.details.status}</div>
                      )}
                      {connectionStatus.details.statusText && (
                        <div><strong>Status Text:</strong> {connectionStatus.details.statusText}</div>
                      )}
                      {connectionStatus.details.baseURL && (
                        <div><strong>URL Base:</strong> {connectionStatus.details.baseURL}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <strong>Ambiente:</strong> {import.meta.env.PROD ? 'Produção' : 'Desenvolvimento'} | 
          <strong> URL Backend:</strong> {import.meta.env.VITE_API_BASE_URL || 'Auto-detectado'}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiConnectionTester;
