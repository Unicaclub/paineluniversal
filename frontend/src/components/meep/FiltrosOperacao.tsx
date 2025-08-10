import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Users, Clock, CreditCard, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface FiltrosOperacaoProps {
  onFiltroChange: (filtros: any) => void;
  onBusca: (texto: string, tipo?: string) => void;
  resultadosBusca: any[];
  loading: boolean;
}

const FiltrosOperacao: React.FC<FiltrosOperacaoProps> = ({
  onFiltroChange,
  onBusca,
  resultadosBusca,
  loading
}) => {
  const [buscaTexto, setBuscaTexto] = useState('');
  const [buscaTipo, setBuscaTipo] = useState('');
  const [filtros, setFiltros] = useState({
    mostrarApenasAtivas: true,
    tipoArea: '',
    statusMesa: '',
    grupoCartao: null
  });

  const handleBuscaChange = (texto: string) => {
    setBuscaTexto(texto);
    onBusca(texto, buscaTipo || undefined);
  };

  const handleTipoBuscaChange = (tipo: string) => {
    setBuscaTipo(tipo);
    if (buscaTexto) {
      onBusca(buscaTexto, tipo || undefined);
    }
  };

  const handleFiltroChange = (novoFiltro: any) => {
    const novosFiltros = { ...filtros, ...novoFiltro };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const limparBusca = () => {
    setBuscaTexto('');
    setBuscaTipo('');
    onBusca('');
  };

  const getIconeResultado = (tipo: string) => {
    switch (tipo) {
      case 'cliente': return <Users className="w-4 h-4" />;
      case 'mesa': return <MapPin className="w-4 h-4" />;
      case 'comanda': return <Clock className="w-4 h-4" />;
      case 'cartao': return <CreditCard className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'ativo':
      case 'disponivel':
        return 'bg-green-500';
      case 'ocupada':
      case 'aberta':
        return 'bg-blue-500';
      case 'bloqueada':
      case 'bloqueado':
        return 'bg-red-500';
      case 'reservada':
        return 'bg-yellow-500';
      case 'inativo':
      case 'fechada':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtros e Busca
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">Tipo de Busca</label>
            <select
              value={buscaTipo}
              onChange={(e) => handleTipoBuscaChange(e.target.value)}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="cpf">CPF/Cliente</option>
              <option value="mesa">Mesa</option>
              <option value="comanda">Comanda</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                value={buscaTexto}
                onChange={(e) => handleBuscaChange(e.target.value)}
                placeholder="Digite CPF, número da mesa, comanda..."
                className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {buscaTexto && (
                <button
                  onClick={limparBusca}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {resultadosBusca.length > 0 && (
            <div>
              <label className="text-white text-sm mb-2 block">
                Resultados ({resultadosBusca.length})
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resultadosBusca.map((resultado, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <div className="text-white/70 mt-1">
                          {getIconeResultado(resultado.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {resultado.titulo}
                          </div>
                          {resultado.subtitulo && (
                            <div className="text-white/70 text-sm truncate">
                              {resultado.subtitulo}
                            </div>
                          )}
                          {resultado.dados_extras && (
                            <div className="text-white/50 text-xs mt-1">
                              {resultado.tipo === 'cliente' && resultado.dados_extras.comandas_ativas > 0 && (
                                <span>{resultado.dados_extras.comandas_ativas} comanda(s) ativa(s)</span>
                              )}
                              {resultado.tipo === 'mesa' && resultado.dados_extras.comanda_ativa && (
                                <span>Comanda: {resultado.dados_extras.comanda_ativa}</span>
                              )}
                              {resultado.tipo === 'comanda' && (
                                <span>R$ {resultado.dados_extras.valor_total?.toFixed(2) || '0,00'}</span>
                              )}
                              {resultado.tipo === 'cartao' && (
                                <span>Saldo: R$ {resultado.dados_extras.saldo_credito?.toFixed(2) || '0,00'}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={`${getCorStatus(resultado.status)} text-white text-xs ml-2 flex-shrink-0`}>
                        {resultado.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/20 pt-4 space-y-4">
          <h4 className="text-white font-medium">Filtros de Visualização</h4>
          
          <div>
            <label className="text-white text-sm mb-2 block">Status da Mesa</label>
            <select
              value={filtros.statusMesa}
              onChange={(e) => handleFiltroChange({ statusMesa: e.target.value })}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="disponivel">Disponível</option>
              <option value="ocupada">Ocupada</option>
              <option value="reservada">Reservada</option>
              <option value="bloqueada">Bloqueada</option>
              <option value="manutencao">Manutenção</option>
            </select>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Tipo de Área</label>
            <select
              value={filtros.tipoArea}
              onChange={(e) => handleFiltroChange({ tipoArea: e.target.value })}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as áreas</option>
              <option value="bar">Bar</option>
              <option value="pista">Pista</option>
              <option value="vip">VIP</option>
              <option value="lounge">Lounge</option>
              <option value="banheiro">Banheiro</option>
              <option value="entrada">Entrada</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="mostrarApenasAtivas"
              checked={filtros.mostrarApenasAtivas}
              onChange={(e) => handleFiltroChange({ mostrarApenasAtivas: e.target.checked })}
              className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <label htmlFor="mostrarApenasAtivas" className="text-white text-sm">
              Mostrar apenas áreas ativas
            </label>
          </div>
        </div>

        <div className="border-t border-white/20 pt-4">
          <h4 className="text-white font-medium mb-3">Filtros Rápidos</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFiltroChange({ statusMesa: 'disponivel' })}
              className="bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30"
            >
              Disponíveis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFiltroChange({ statusMesa: 'ocupada' })}
              className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
            >
              Ocupadas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFiltroChange({ statusMesa: 'reservada' })}
              className="bg-yellow-500/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30"
            >
              Reservadas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFiltroChange({ statusMesa: 'bloqueada' })}
              className="bg-gray-500/20 border-gray-500/50 text-gray-300 hover:bg-gray-500/30"
            >
              Bloqueadas
            </Button>
          </div>
        </div>

        <div className="border-t border-white/20 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFiltros({
                mostrarApenasAtivas: true,
                tipoArea: '',
                statusMesa: '',
                grupoCartao: null
              });
              onFiltroChange({
                mostrarApenasAtivas: true,
                tipoArea: '',
                statusMesa: '',
                grupoCartao: null
              });
              limparBusca();
            }}
            className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltrosOperacao;
