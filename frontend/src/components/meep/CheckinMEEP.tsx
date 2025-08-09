import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { QrCode, Shield, CheckCircle, Clock, Users } from 'lucide-react';

const CheckinMEEP: React.FC = () => {
  const [qrCode, setQrCode] = useState('');
  const [cpfDigits, setCpfDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const handleValidateAccess = async () => {
    setLoading(true);
    try {
      const mockResult = {
        success: true,
        data: {
          cliente_nome: 'João da Silva Santos',
          cliente_cpf: '12345678901',
          evento_id: 1,
          timestamp: new Date()
        },
        message: 'Acesso validado com sucesso'
      };
      
      setResultado(mockResult);
    } catch (error) {
      console.error('Erro na validação:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 min-h-screen">
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <QrCode className="h-5 w-5 text-blue-400" />
            Check-in MEEP - Validação Multi-Fator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  QR Code do Cliente
                </label>
                <textarea
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Cole aqui o conteúdo do QR Code escaneado"
                  className="w-full h-32 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  3 Primeiros Dígitos do CPF
                </label>
                <input
                  type="text"
                  value={cpfDigits}
                  onChange={(e) => setCpfDigits(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={handleValidateAccess}
                disabled={!qrCode || cpfDigits.length !== 3 || loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                {loading ? 'Validando...' : 'Validar Acesso'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <h3 className="font-semibold text-blue-300 mb-2">Como funciona:</h3>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>1. Cliente apresenta QR Code</li>
                  <li>2. Escaneie o código com leitor</li>
                  <li>3. Cliente informa 3 primeiros dígitos do CPF</li>
                  <li>4. Sistema valida automaticamente</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                  <div className="text-lg font-bold text-white">247</div>
                  <div className="text-xs text-gray-400">Check-ins hoje</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-green-400" />
                  <div className="text-lg font-bold text-white">1.2s</div>
                  <div className="text-xs text-gray-400">Tempo médio</div>
                </div>
              </div>
            </div>
          </div>

          {resultado && (
            <Alert className="bg-green-500/10 border-green-500/30">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                <div className="space-y-2">
                  <div><strong>✅ {resultado.message}</strong></div>
                  <div>Cliente: {resultado.data.cliente_nome}</div>
                  <div>CPF: {resultado.data.cliente_cpf}</div>
                  <div>Horário: {new Date(resultado.data.timestamp).toLocaleString('pt-BR')}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckinMEEP;
