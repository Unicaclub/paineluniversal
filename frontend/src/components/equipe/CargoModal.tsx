import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Loader2 } from 'lucide-react';
import { equipeService } from '../../services/api';
import { Cargo, CargoFormData, PermissoesGranulares } from '../../types/equipe';

interface CargoModalProps {
  cargo?: Cargo | null;
  onSave: () => void;
  onClose: () => void;
}

const CargoModal: React.FC<CargoModalProps> = ({
  cargo,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<CargoFormData>({
    nome: '',
    descricao: '',
    nivel_hierarquico: 4,
    permissoes: {
      dashboard: { visualizar: false, export: false },
      eventos: { criar: false, editar: false, excluir: false, visualizar: false },
      clientes: { criar: false, editar: false, excluir: false, visualizar: false, exportar: false },
      cartoes: { emitir: false, bloquear: false, recarregar: false, consultar: false },
      financeiro: { caixa: false, relatorios: false, configurar: false },
      equipe: { gerenciar_colaboradores: false, gerenciar_cargos: false, definir_permissoes: false }
    },
    empresa_id: 1
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('descricao');

  useEffect(() => {
    if (cargo) {
      setFormData({
        nome: cargo.nome,
        descricao: cargo.descricao || '',
        nivel_hierarquico: cargo.nivel_hierarquico,
        permissoes: cargo.permissoes || {
          dashboard: { visualizar: false, export: false },
          eventos: { criar: false, editar: false, excluir: false, visualizar: false },
          clientes: { criar: false, editar: false, excluir: false, visualizar: false, exportar: false },
          cartoes: { emitir: false, bloquear: false, recarregar: false, consultar: false },
          financeiro: { caixa: false, relatorios: false, configurar: false },
          equipe: { gerenciar_colaboradores: false, gerenciar_cargos: false, definir_permissoes: false }
        },
        empresa_id: cargo.empresa_id
      });
    }
  }, [cargo]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do cargo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CargoFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissaoChange = (categoria: keyof PermissoesGranulares, permissao: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [categoria]: {
          ...prev.permissoes[categoria],
          [permissao]: checked
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (cargo) {
        await equipeService.atualizarCargo(cargo.id, formData);
      } else {
        await equipeService.criarCargo(formData);
      }
      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar cargo:', error);
      if (error.response?.data?.detail) {
        if (error.response.data.detail.includes('nome')) {
          setErrors({ nome: 'Cargo com este nome já existe' });
        } else {
          setErrors({ general: error.response.data.detail });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const permissaoLabels = {
    dashboard: {
      title: '📊 Dashboard',
      permissions: {
        visualizar: 'Visualizar',
        export: 'Exportar'
      }
    },
    eventos: {
      title: '🎪 Eventos',
      permissions: {
        criar: 'Criar',
        editar: 'Editar',
        excluir: 'Excluir',
        visualizar: 'Visualizar'
      }
    },
    clientes: {
      title: '👥 Clientes',
      permissions: {
        criar: 'Criar',
        editar: 'Editar',
        excluir: 'Excluir',
        visualizar: 'Visualizar',
        exportar: 'Exportar'
      }
    },
    cartoes: {
      title: '💳 Cartões',
      permissions: {
        emitir: 'Emitir',
        bloquear: 'Bloquear',
        recarregar: 'Recarregar',
        consultar: 'Consultar'
      }
    },
    financeiro: {
      title: '💰 Financeiro',
      permissions: {
        caixa: 'Caixa',
        relatorios: 'Relatórios',
        configurar: 'Configurar'
      }
    },
    equipe: {
      title: '👥 Equipe',
      permissions: {
        gerenciar_colaboradores: 'Gerenciar Colaboradores',
        gerenciar_cargos: 'Gerenciar Cargos',
        definir_permissoes: 'Definir Permissões'
      }
    }
  };

  return (
    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl">
          {cargo ? 'Editar Cargo' : 'Novo Cargo'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className="bg-red-500/20 border border-red-500 rounded p-3 text-red-400 mb-4">
            {errors.general}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="descricao" className="data-[state=active]:bg-purple-600">
              Descrição
            </TabsTrigger>
            <TabsTrigger value="permissoes" className="data-[state=active]:bg-purple-600">
              Permissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="descricao" className="space-y-4 mt-6">
            <div>
              <Label className="text-gray-300">Descrição *</Label>
              <Input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Nome do cargo"
                className={`bg-gray-700 border-gray-600 text-white ${errors.nome ? 'border-red-500' : ''}`}
                required
              />
              {errors.nome && (
                <span className="text-red-400 text-sm mt-1 block">{errors.nome}</span>
              )}
            </div>

            <div>
              <Label className="text-gray-300">Descrição Detalhada</Label>
              <Input
                type="text"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descrição detalhada do cargo"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Nível Hierárquico</Label>
              <Select 
                value={formData.nivel_hierarquico.toString()} 
                onValueChange={(value) => handleInputChange('nivel_hierarquico', parseInt(value))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Administrador</SelectItem>
                  <SelectItem value="2">2 - Gerente</SelectItem>
                  <SelectItem value="3">3 - Supervisor</SelectItem>
                  <SelectItem value="4">4 - Operacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="permissoes" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(permissaoLabels).map(([categoria, config]) => (
                <div key={categoria} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <h4 className="text-purple-400 font-semibold mb-3">{config.title}</h4>
                  <div className="space-y-2">
                    {Object.entries(config.permissions).map(([permissao, label]) => (
                      <div key={permissao} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${categoria}-${permissao}`}
                          checked={formData.permissoes[categoria as keyof PermissoesGranulares]?.[permissao] || false}
                          onCheckedChange={(checked) => 
                            handlePermissaoChange(categoria as keyof PermissoesGranulares, permissao, checked as boolean)
                          }
                          className="border-gray-500 data-[state=checked]:bg-purple-600"
                        />
                        <Label 
                          htmlFor={`${categoria}-${permissao}`}
                          className="text-sm text-gray-300 cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300 hover:bg-gray-600"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default CargoModal;
