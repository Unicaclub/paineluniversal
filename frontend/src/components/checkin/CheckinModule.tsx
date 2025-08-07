import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { eventoService, transacaoService, type Evento, type Transacao } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface CheckinData {
  cpf: string;
  codigo_verificacao: string;
  evento_id: number;
}

interface CheckinResult {
  success: boolean;
  message: string;
  pessoa?: {
    nome: string;
    cpf: string;
    email: string;
    lista: string;
    valor_pago: number;
  };
}

const CheckinModule: React.FC = () => {
  const { usuario } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<number | null>(null);
  const [checkinData, setCheckinData] = useState<CheckinData>({
    cpf: '',
    codigo_verificacao: '',
    evento_id: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null);
  const [checkinsRecentes, setCheckinsRecentes] = useState<any[]>([]);

  useEffect(() => {
    carregarEventos();
  }, []);

  useEffect(() => {
    if (eventoSelecionado) {
      setCheckinData({ ...checkinData, evento_id: eventoSelecionado });
      carregarCheckinsRecentes();
    }
  }, [eventoSelecionado]);

  const carregarEventos = async () => {
    try {
      setLoading(true);
      const eventosData = await eventoService.listar(usuario?.empresa_id);
      setEventos(eventosData.filter(e => e.status === 'ativo'));
    } catch (error) {
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const carregarCheckinsRecentes = async () => {
    if (!eventoSelecionado) return;
    
    try {
      const response = await fetch(`/api/checkins/evento/${eventoSelecionado}/recentes`);
      if (response.ok) {
        const data = await response.json();
        setCheckinsRecentes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar check-ins recentes:', error);
    }
  };

  const formatarCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCPF(e.target.value);
    setCheckinData({ ...checkinData, cpf: formatted });
  };

  const validarCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[10])) return false;

    return true;
  };

  const handleSubmitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setCheckinResult(null);

    try {
      const cpfNumbers = checkinData.cpf.replace(/\D/g, '');
      
      if (!validarCPF(checkinData.cpf)) {
        setError('CPF inválido');
        setLoading(false);
        return;
      }

      if (checkinData.codigo_verificacao.length !== 3) {
        setError('Código de verificação deve ter 3 dígitos');
        setLoading(false);
        return;
      }

      if (!eventoSelecionado) {
        setError('Selecione um evento');
        setLoading(false);
        return;
      }

      const transacoes = await transacaoService.listar(eventoSelecionado, cpfNumbers, 'aprovada');
      
      if (transacoes.length === 0) {
        setError('Nenhuma compra aprovada encontrada para este CPF neste evento');
        setLoading(false);
        return;
      }

      const transacao = transacoes[0];
      const cpfDigits = cpfNumbers.slice(0, 3);
      
      if (checkinData.codigo_verificacao !== cpfDigits) {
        setError('Código de verificação incorreto. Use os 3 primeiros dígitos do CPF');
        setLoading(false);
        return;
      }

      const checkinResponse = await fetch('/api/checkins/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cpf_pessoa: cpfNumbers,
          evento_id: eventoSelecionado,
          transacao_id: transacao.id,
          codigo_verificacao: checkinData.codigo_verificacao
        })
      });

      if (checkinResponse.ok) {
        const result = await checkinResponse.json();
        setCheckinResult({
          success: true,
          message: 'Check-in realizado com sucesso!',
          pessoa: {
            nome: transacao.nome_comprador,
            cpf: formatarCPF(transacao.cpf_comprador),
            email: transacao.email_comprador,
            lista: 'Lista VIP',
            valor_pago: transacao.valor
          }
        });
        setSuccess('Check-in realizado com sucesso!');
        setCheckinData({
          cpf: '',
          codigo_verificacao: '',
          evento_id: eventoSelecionado
        });
        carregarCheckinsRecentes();
      } else {
        const errorData = await checkinResponse.json();
        setError(errorData.detail || 'Erro ao realizar check-in');
      }
    } catch (error: any) {
      setError('Erro ao processar check-in');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Check-in</h1>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Realizar Check-in</CardTitle>
            <CardDescription>
              Validação por CPF + 3 primeiros dígitos como código de verificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitCheckin} className="space-y-4">
              <div>
                <Label htmlFor="evento-checkin">Evento</Label>
                <select
                  id="evento-checkin"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={eventoSelecionado || ''}
                  onChange={(e) => setEventoSelecionado(Number(e.target.value))}
                  required
                >
                  <option value="">Selecione um evento</option>
                  {eventos.map(evento => (
                    <option key={evento.id} value={evento.id}>
                      {evento.nome} - {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                    </option>
                  ))}
                </select>
              </div>

              {eventoSelecionado && (
                <>
                  <div>
                    <Label htmlFor="cpf-checkin">CPF da Pessoa</Label>
                    <Input
                      id="cpf-checkin"
                      type="text"
                      placeholder="000.000.000-00"
                      value={checkinData.cpf}
                      onChange={handleCpfChange}
                      maxLength={14}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="codigo-checkin">Código de Verificação</Label>
                    <Input
                      id="codigo-checkin"
                      type="text"
                      placeholder="3 primeiros dígitos do CPF"
                      value={checkinData.codigo_verificacao}
                      onChange={(e) => setCheckinData({ 
                        ...checkinData, 
                        codigo_verificacao: e.target.value.replace(/\D/g, '').slice(0, 3)
                      })}
                      maxLength={3}
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Digite os 3 primeiros dígitos do CPF como código de verificação
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Processando...' : 'Realizar Check-in'}
                  </Button>
                </>
              )}
            </form>

            {checkinResult && checkinResult.success && checkinResult.pessoa && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-bold text-green-800 mb-2">Check-in Confirmado!</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Nome:</strong> {checkinResult.pessoa.nome}</p>
                  <p><strong>CPF:</strong> {checkinResult.pessoa.cpf}</p>
                  <p><strong>E-mail:</strong> {checkinResult.pessoa.email}</p>
                  <p><strong>Lista:</strong> {checkinResult.pessoa.lista}</p>
                  <p><strong>Valor Pago:</strong> {formatarMoeda(checkinResult.pessoa.valor_pago)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check-ins Recentes</CardTitle>
            <CardDescription>
              {eventoSelecionado ? 'Últimos check-ins do evento selecionado' : 'Selecione um evento para ver os check-ins'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventoSelecionado ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {checkinsRecentes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum check-in encontrado</p>
                ) : (
                  checkinsRecentes.slice(0, 10).map((checkin, index) => (
                    <div key={index} className="border-b pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{checkin.nome}</p>
                          <p className="text-sm text-gray-600">CPF: {formatarCPF(checkin.cpf)}</p>
                          <p className="text-sm text-gray-600">{checkin.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600 font-medium">CONFIRMADO</p>
                          <p className="text-xs text-gray-500">
                            {formatarData(checkin.data_checkin)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Selecione um evento para visualizar os check-ins
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instruções de Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-md">
              <h4 className="font-bold text-blue-800 mb-2">1. CPF</h4>
              <p className="text-blue-700">
                Digite o CPF completo da pessoa que deseja fazer check-in
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-md">
              <h4 className="font-bold text-blue-800 mb-2">2. Verificação</h4>
              <p className="text-blue-700">
                Use os 3 primeiros dígitos do CPF como código de verificação
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-md">
              <h4 className="font-bold text-blue-800 mb-2">3. Confirmação</h4>
              <p className="text-blue-700">
                Sistema valida a compra e confirma o check-in automaticamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckinModule;
