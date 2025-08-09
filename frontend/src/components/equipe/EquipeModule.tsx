import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users, UserPlus, Settings, Search, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { equipeService } from '../../services/api';
import { Colaborador, Cargo, EstatisticasEquipe, FiltrosColaboradores } from '../../types/equipe';
import ColaboradorModal from './ColaboradorModal';
import CargoModal from './CargoModal';

const EquipeModule: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasEquipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosColaboradores>({});
  const [expandedColaborador, setExpandedColaborador] = useState<number | null>(null);
  const [colaboradorModalOpen, setColaboradorModalOpen] = useState(false);
  const [cargoModalOpen, setCargoModalOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [colaboradoresData, cargosData, estatisticasData] = await Promise.all([
        equipeService.listarColaboradores(filtros),
        equipeService.listarCargos(),
        equipeService.obterEstatisticas()
      ]);
      
      setColaboradores(colaboradoresData);
      setCargos(cargosData);
      setEstatisticas(estatisticasData);
    } catch (error) {
      console.error('Erro ao carregar dados da equipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColaboradorSaved = () => {
    setColaboradorModalOpen(false);
    setEditingColaborador(null);
    carregarDados();
  };

  const handleCargoSaved = () => {
    setCargoModalOpen(false);
    setEditingCargo(null);
    carregarDados();
  };

  const handleEditColaborador = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setColaboradorModalOpen(true);
  };

  const handleEditCargo = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setCargoModalOpen(true);
  };

  const handleDeleteColaborador = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      try {
        await equipeService.excluirColaborador(id);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir colaborador:', error);
      }
    }
  };

  const handleDeleteCargo = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
      try {
        await equipeService.excluirCargo(id);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir cargo:', error);
      }
    }
  };

  const toggleColaboradorExpansion = (id: number) => {
    setExpandedColaborador(expandedColaborador === id ? null : id);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ativo': return 'default';
      case 'inativo': return 'secondary';
      case 'suspenso': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'text-green-500';
      case 'inativo': return 'text-gray-500';
      case 'suspenso': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getAvatarInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const contarColaboradoresPorCargo = (cargoId: number) => {
    return colaboradores.filter(c => c.cargo_id === cargoId).length;
  };

  const contarPermissoesCargo = (permissoes: any) => {
    if (!permissoes || typeof permissoes !== 'object') return 0;
    
    let count = 0;
    Object.values(permissoes).forEach((categoria: any) => {
      if (categoria && typeof categoria === 'object') {
        count += Object.values(categoria).filter(Boolean).length;
      }
    });
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Home &gt; Equipe &gt; Colaboradores</div>
          <h1 className="text-3xl font-bold mb-2">Colaboradores</h1>
          <p className="text-gray-400">Cadastre todos os colaboradores do seu estabelecimento e delimite suas permissões.</p>
        </div>

        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{estatisticas.total_colaboradores}</div>
                <div className="text-sm text-gray-400">Total Colaboradores</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{estatisticas.total_cargos}</div>
                <div className="text-sm text-gray-400">Cargos Ativos</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{estatisticas.colaboradores_ativos}</div>
                <div className="text-sm text-gray-400">Colaboradores Ativos</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{estatisticas.taxa_atividade}%</div>
                <div className="text-sm text-gray-400">Taxa de Atividade</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Lista de Colaboradores</CardTitle>
            <Dialog open={colaboradorModalOpen} onOpenChange={setColaboradorModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Colaborador
                </Button>
              </DialogTrigger>
              <ColaboradorModal
                colaborador={editingColaborador}
                cargos={cargos}
                onSave={handleColaboradorSaved}
                onClose={() => {
                  setColaboradorModalOpen(false);
                  setEditingColaborador(null);
                }}
              />
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <Label className="text-gray-300 mb-2 block">Nome do colaborador</Label>
                <Input
                  placeholder="Filtrar pelo nome do operador"
                  value={filtros.nome || ''}
                  onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Cargo</Label>
                <Select value={filtros.cargo_id?.toString() || ''} onValueChange={(value) => setFiltros({ ...filtros, cargo_id: value ? parseInt(value) : undefined })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Filtrar pelo cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os cargos</SelectItem>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo.id} value={cargo.id.toString()}>
                        {cargo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">E-mail</Label>
                <Input
                  placeholder="Filtrar pelo e-mail do operador"
                  value={filtros.email || ''}
                  onChange={(e) => setFiltros({ ...filtros, email: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button className="bg-purple-600 hover:bg-purple-700 w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {colaboradores.map((colaborador) => (
                <Card key={colaborador.id} className="bg-gray-700 border-gray-600 cursor-pointer hover:border-purple-500 transition-colors">
                  <CardContent className="p-0">
                    <div 
                      className="flex items-center justify-between p-4"
                      onClick={() => toggleColaboradorExpansion(colaborador.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {getAvatarInitials(colaborador.nome)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{colaborador.nome}</div>
                          <div className="text-sm text-gray-400">{colaborador.cargo?.nome}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={getStatusBadgeVariant(colaborador.status)} className={getStatusColor(colaborador.status)}>
                          {colaborador.status.charAt(0).toUpperCase() + colaborador.status.slice(1)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditColaborador(colaborador);
                            }}
                            className="border-gray-600 text-gray-300 hover:bg-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteColaborador(colaborador.id);
                            }}
                            className="border-red-600 text-red-400 hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {expandedColaborador === colaborador.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {expandedColaborador === colaborador.id && (
                      <div className="border-t border-gray-600 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <strong className="text-white">Email:</strong>
                            <div className="text-gray-400">{colaborador.email}</div>
                          </div>
                          <div>
                            <strong className="text-white">Telefone:</strong>
                            <div className="text-gray-400">{colaborador.telefone || 'Não informado'}</div>
                          </div>
                          <div>
                            <strong className="text-white">CPF:</strong>
                            <div className="text-gray-400">{colaborador.cpf}</div>
                          </div>
                          <div>
                            <strong className="text-white">Data Admissão:</strong>
                            <div className="text-gray-400">{new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Gestão de Cargos</CardTitle>
            <Dialog open={cargoModalOpen} onOpenChange={setCargoModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Adicionar Cargo
                </Button>
              </DialogTrigger>
              <CargoModal
                cargo={editingCargo}
                onSave={handleCargoSaved}
                onClose={() => {
                  setCargoModalOpen(false);
                  setEditingCargo(null);
                }}
              />
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Cargo</TableHead>
                  <TableHead className="text-gray-300">Permissões</TableHead>
                  <TableHead className="text-gray-300">Colaboradores</TableHead>
                  <TableHead className="text-gray-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargos.map((cargo) => {
                  const colaboradoresCount = contarColaboradoresPorCargo(cargo.id);
                  const permissoesCount = contarPermissoesCargo(cargo.permissoes);
                  
                  return (
                    <TableRow key={cargo.id} className="border-gray-600 hover:bg-gray-700">
                      <TableCell className="font-semibold text-white">{cargo.nome}</TableCell>
                      <TableCell>
                        <span className={`${permissoesCount > 50 ? 'text-green-400' : permissoesCount > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {permissoesCount} permissões
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-300">{colaboradoresCount} colaborador{colaboradoresCount !== 1 ? 'es' : ''}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCargo(cargo)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCargo(cargo.id)}
                            className="border-red-600 text-red-400 hover:bg-red-600"
                            disabled={colaboradoresCount > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EquipeModule;
