import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Map, Search, Filter, Users, Clock, AlertTriangle, 
  MapPin, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff,
  Settings, Plus, Minus
} from 'lucide-react';
import FiltrosOperacao from './FiltrosOperacao';
import EstatisticasOperacao from './EstatisticasOperacao';

interface MapaOperacaoProps {
  eventoId: number;
}

interface Mesa {
  id: number;
  numero: string;
  nome?: string;
  tipo: string;
  capacidade_pessoas: number;
  posicao_x: number;
  posicao_y: number;
  largura: number;
  altura: number;
  formato: string;
  status: string;
  valor_minimo: number;
  taxa_servico: number;
  observacoes?: string;
  configuracoes: any;
  comanda_ativa?: {
    id: number;
    numero_comanda: string;
    valor_total: number;
    participantes_count: number;
  };
}

interface Area {
  id: number;
  nome: string;
  tipo: string;
  posicao_x: number;
  posicao_y: number;
  largura: number;
  altura: number;
  capacidade_maxima: number;
  cor: string;
  ativa: boolean;
  configuracoes: any;
  restricoes: string[];
  mesas: Mesa[];
}

interface Layout {
  id: number;
  evento_id: number;
  nome: string;
  largura: number;
  altura: number;
  escala: number;
  configuracao: any;
  imagem_fundo?: string;
  areas: Area[];
}

interface Estatisticas {
  total_mesas: number;
  mesas_ocupadas: number;
  mesas_disponveis: number;
  mesas_reservadas: number;
  mesas_bloqueadas: number;
  comandas_abertas: number;
  comandas_bloqueadas: number;
  total_participantes: number;
  faturamento_total: number;
  ticket_medio: number;
}

interface ResultadoBusca {
  tipo: string;
  id: number;
  titulo: string;
  subtitulo?: string;
  status: string;
  dados_extras?: any;
}

const statusColors = {
  disponivel: 'bg-green-500',
  ocupada: 'bg-red-500',
  reservada: 'bg-yellow-500',
  bloqueada: 'bg-gray-500',
  manutencao: 'bg-orange-500'
};

const statusLabels = {
  disponivel: 'Disponível',
  ocupada: 'Ocupada',
  reservada: 'Reservada',
  bloqueada: 'Bloqueada',
  manutencao: 'Manutenção'
};

const MapaOperacao: React.FC<MapaOperacaoProps> = ({ eventoId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [filtros, setFiltros] = useState({
    mostrarApenasAtivas: true,
    tipoArea: '',
    statusMesa: '',
    grupoCartao: null
  });
  const [resultadosBusca, setResultadosBusca] = useState<ResultadoBusca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFiltros, setShowFiltros] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [areaSelecionada, setAreaSelecionada] = useState<Area | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [layoutResponse, estatisticasResponse] = await Promise.all([
        fetch(`/api/mapa-operacao/eventos/${eventoId}/layout?${new URLSearchParams({
          mostrarApenasAtivas: filtros.mostrarApenasAtivas.toString(),
          ...(filtros.tipoArea && { tipoArea: filtros.tipoArea }),
          ...(filtros.statusMesa && { statusMesa: filtros.statusMesa }),
          ...(filtros.grupoCartao && { grupoCartao: filtros.grupoCartao.toString() })
        })}`),
        fetch(`/api/mapa-operacao/eventos/${eventoId}/estatisticas`)
      ]);

      if (!layoutResponse.ok || !estatisticasResponse.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const layoutData = await layoutResponse.json();
      const estatisticasData = await estatisticasResponse.json();

      setLayout(layoutData);
      setEstatisticas(estatisticasData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [eventoId, filtros]);

  const handleBusca = async (busca_texto: string, busca_tipo?: string) => {
    if (!busca_texto.trim()) {
      setResultadosBusca([]);
      return;
    }

    try {
      const response = await fetch(`/api/mapa-operacao/eventos/${eventoId}/buscar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          busca_texto,
          busca_tipo
        })
      });

      if (!response.ok) {
        throw new Error('Erro na busca');
      }

      const data = await response.json();
      setResultadosBusca(data.data || []);

    } catch (err) {
      console.error('Erro na busca:', err);
      setResultadosBusca([]);
    }
  };

  const handleFiltroChange = (novosFiltros: any) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMesaClick = (mesa: Mesa) => {
    setMesaSelecionada(mesa);
    setAreaSelecionada(null);
  };

  const handleAreaClick = (area: Area) => {
    setAreaSelecionada(area);
    setMesaSelecionada(null);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    layout.areas.forEach(area => {
      if (!area.ativa && filtros.mostrarApenasAtivas) return;

      ctx.fillStyle = area.cor + '40';
      ctx.strokeStyle = area.cor;
      ctx.lineWidth = 2;
      ctx.fillRect(area.posicao_x, area.posicao_y, area.largura, area.altura);
      ctx.strokeRect(area.posicao_x, area.posicao_y, area.largura, area.altura);

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        area.nome,
        area.posicao_x + area.largura / 2,
        area.posicao_y + 20
      );

      area.mesas.forEach(mesa => {
        const mesaColor = statusColors[mesa.status as keyof typeof statusColors] || 'bg-gray-400';
        const color = mesaColor.replace('bg-', '').replace('-500', '');
        
        let fillColor = '#6b7280';
        switch (color) {
          case 'green': fillColor = '#10b981'; break;
          case 'red': fillColor = '#ef4444'; break;
          case 'yellow': fillColor = '#f59e0b'; break;
          case 'orange': fillColor = '#f97316'; break;
          case 'gray': fillColor = '#6b7280'; break;
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        if (mesa.formato === 'circular') {
          const centerX = mesa.posicao_x + mesa.largura / 2;
          const centerY = mesa.posicao_y + mesa.altura / 2;
          const radius = Math.min(mesa.largura, mesa.altura) / 2;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(mesa.posicao_x, mesa.posicao_y, mesa.largura, mesa.altura);
          ctx.strokeRect(mesa.posicao_x, mesa.posicao_y, mesa.largura, mesa.altura);
        }

        if (mesaSelecionada?.id === mesa.id) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 4;
          ctx.strokeRect(mesa.posicao_x - 2, mesa.posicao_y - 2, mesa.largura + 4, mesa.altura + 4);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          mesa.numero,
          mesa.posicao_x + mesa.largura / 2,
          mesa.posicao_y + mesa.altura / 2 + 4
        );

        if (mesa.comanda_ativa) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.fillText(
            `${mesa.comanda_ativa.participantes_count}p`,
            mesa.posicao_x + mesa.largura / 2,
            mesa.posicao_y + mesa.altura / 2 + 16
          );
        }
      });
    });

    ctx.restore();
  }, [layout, zoom, pan, mesaSelecionada, filtros]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    let mesaClicada: Mesa | null = null;
    let areaClicada: Area | null = null;

    for (const area of layout.areas) {
      if (x >= area.posicao_x && x <= area.posicao_x + area.largura &&
          y >= area.posicao_y && y <= area.posicao_y + area.altura) {
        areaClicada = area;

        for (const mesa of area.mesas) {
          if (x >= mesa.posicao_x && x <= mesa.posicao_x + mesa.largura &&
              y >= mesa.posicao_y && y <= mesa.posicao_y + mesa.altura) {
            mesaClicada = mesa;
            break;
          }
        }
        break;
      }
    }

    if (mesaClicada) {
      handleMesaClick(mesaClicada);
    } else if (areaClicada) {
      handleAreaClick(areaClicada);
    } else {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Carregando mapa da operação...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-6">
        <Alert className="bg-red-500/20 border-red-500/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Map className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mapa da Operação</h1>
              <p className="text-white/70">Controle visual em tempo real</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltros(!showFiltros)}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              {showFiltros ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showFiltros ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={carregarDados}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {estatisticas && (
          <EstatisticasOperacao estatisticas={estatisticas} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {showFiltros && (
            <div className="lg:col-span-1">
              <FiltrosOperacao
                onFiltroChange={handleFiltroChange}
                onBusca={handleBusca}
                resultadosBusca={resultadosBusca}
                loading={loading}
              />
            </div>
          )}
          
          <div className={`${showFiltros ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    {layout?.nome || 'Layout do Evento'}
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomOut}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-white text-sm px-2">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomIn}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetView}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <canvas
                  ref={canvasRef}
                  className="w-full h-96 border border-white/20 rounded-lg cursor-pointer bg-white/5"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onWheel={handleCanvasWheel}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${color}`}></div>
              <span className="text-white text-sm">{statusLabels[status as keyof typeof statusLabels]}</span>
            </div>
          ))}
        </div>

        {mesaSelecionada && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">
                Mesa {mesaSelecionada.numero}
                <Badge 
                  className={`ml-2 ${statusColors[mesaSelecionada.status as keyof typeof statusColors]} text-white`}
                >
                  {statusLabels[mesaSelecionada.status as keyof typeof statusLabels]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-white/70 text-sm">Capacidade</div>
                  <div className="text-white font-medium">{mesaSelecionada.capacidade_pessoas} pessoas</div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Tipo</div>
                  <div className="text-white font-medium">{mesaSelecionada.tipo}</div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Valor Mínimo</div>
                  <div className="text-white font-medium">R$ {mesaSelecionada.valor_minimo.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Taxa Serviço</div>
                  <div className="text-white font-medium">{mesaSelecionada.taxa_servico}%</div>
                </div>
              </div>

              {mesaSelecionada.comanda_ativa && (
                <div className="border-t border-white/20 pt-4">
                  <h4 className="text-white font-medium mb-2">Comanda Ativa</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-white/70 text-sm">Número</div>
                      <div className="text-white font-medium">{mesaSelecionada.comanda_ativa.numero_comanda}</div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">Participantes</div>
                      <div className="text-white font-medium">{mesaSelecionada.comanda_ativa.participantes_count}</div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">Valor Total</div>
                      <div className="text-white font-medium">R$ {mesaSelecionada.comanda_ativa.valor_total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}

              {mesaSelecionada.observacoes && (
                <div className="border-t border-white/20 pt-4">
                  <h4 className="text-white font-medium mb-2">Observações</h4>
                  <p className="text-white/70">{mesaSelecionada.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MapaOperacao;
