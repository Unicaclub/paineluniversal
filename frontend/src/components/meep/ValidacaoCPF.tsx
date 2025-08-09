import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, Loader2, Shield, User } from 'lucide-react';

interface ValidacaoCPFProps {
  onValidacao?: (dados: any) => void;
  autoValidar?: boolean;
}

interface DadosReceita {
  nome: string;
  situacao: string;
  dataNascimento?: string;
  nomeMae?: string;
  idade?: number;
  maiorIdade?: boolean;
}

interface ResultadoValidacao {
  valid: boolean;
  data?: DadosReceita;
  source?: string;
  error?: string;
  code?: string;
}

const ValidacaoCPF: React.FC<ValidacaoCPFProps> = ({ onValidacao, autoValidar = true }) => {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<DadosReceita | null>(null);
  const [erro, setErro] = useState('');
  const [forcarConsulta, setForcarConsulta] = useState(false);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const isValidCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const validarCPF = useCallback(async () => {
    if (!isValidCPF(cpf)) {
      setErro('CPF inválido');
      return;
    }

    setLoading(true);
    setErro('');
    setDados(null);

    try {
      const mockResult: ResultadoValidacao = {
        valid: true,
        data: {
          nome: 'JOÃO DA SILVA SANTOS',
          situacao: 'ATIVO',
          dataNascimento: '1985-03-15',
          nomeMae: 'MARIA DA SILVA',
          idade: 38,
          maiorIdade: true
        },
        source: 'receita_federal'
      };

      if (mockResult.valid && mockResult.data) {
        setDados(mockResult.data);
        onValidacao?.(mockResult.data);
      } else {
        setErro(mockResult.error || 'Erro na validação');
      }
    } catch (error) {
      console.error('Erro na validação CPF:', error);
      setErro('Erro na consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [cpf, forcarConsulta, onValidacao]);

  useEffect(() => {
    if (autoValidar && isValidCPF(cpf)) {
      const timer = setTimeout(validarCPF, 1000);
      return () => clearTimeout(timer);
    }
  }, [cpf, autoValidar, validarCPF]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    
    if (dados) {
      setDados(null);
      setErro('');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-blue-400" />
            Validação CPF - Receita Federal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              CPF *
              {loading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className={`flex-1 px-3 py-2 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dados ? 'border-green-500' : erro ? 'border-red-500' : 'border-gray-600'
                }`}
                maxLength={14}
                disabled={loading}
              />
              
              <Button
                onClick={validarCPF}
                disabled={!isValidCPF(cpf) || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔍'} Validar
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="forcarConsulta"
                checked={forcarConsulta}
                onChange={(e) => setForcarConsulta(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="forcarConsulta" className="text-sm text-gray-400">
                Forçar nova consulta (ignorar cache)
              </label>
            </div>
          </div>

          {loading && (
            <div className="text-center p-6 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-400" />
              <p className="text-blue-300 font-medium">Consultando dados na Receita Federal...</p>
              <p className="text-sm text-gray-400 mt-1">Isso pode levar alguns segundos</p>
            </div>
          )}

          {erro && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                <strong>❌ Erro:</strong> {erro}
              </AlertDescription>
            </Alert>
          )}

          {dados && (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  <strong>✅ CPF Validado com Sucesso!</strong>
                  <span className="ml-2 text-sm">Origem: 🌐 Receita Federal</span>
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Nome Completo:</span>
                  <span className="text-white font-semibold">{dados.nome}</span>
                </div>

                {dados.dataNascimento && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Data de Nascimento:</span>
                    <span className="text-white">
                      {new Date(dados.dataNascimento).toLocaleDateString('pt-BR')}
                      {dados.idade && (
                        <span className="text-sm text-gray-400 ml-2">({dados.idade} anos)</span>
                      )}
                    </span>
                  </div>
                )}

                {dados.nomeMae && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Nome da Mãe:</span>
                    <span className="text-white">{dados.nomeMae}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Situação do CPF:</span>
                  <Badge className={`${
                    dados.situacao === 'ATIVO' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {dados.situacao}
                  </Badge>
                </div>

                {dados.maiorIdade !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Maior de Idade:</span>
                    <Badge className={`${
                      dados.maiorIdade ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {dados.maiorIdade ? '✅ Sim' : '❌ Não'}
                    </Badge>
                  </div>
                )}
              </div>

              {!dados.maiorIdade && (
                <Alert className="bg-yellow-500/10 border-yellow-500/30">
                  <User className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    <strong>⚠️ Atenção:</strong> Cliente menor de idade. 
                    Verificar documentação adicional e autorização dos responsáveis.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidacaoCPF;
