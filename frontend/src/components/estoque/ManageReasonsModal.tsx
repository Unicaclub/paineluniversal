import React, { useState } from 'react';

interface ManageReasonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Reason {
  id: string;
  name: string;
  type: 'entrada' | 'saida' | 'transferencia';
  description: string;
  active: boolean;
}

export function ManageReasonsModal({ isOpen, onClose, onSuccess }: ManageReasonsModalProps) {
  const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'entrada' as 'entrada' | 'saida' | 'transferencia',
    description: '',
    active: true
  });

  console.log('⚙️ ManageReasonsModal renderizado com isOpen:', isOpen);

  if (!isOpen) return null;

  // Mock data para demonstração
  const mockReasons: Reason[] = [
    { 
      id: '1', 
      name: 'Compra de mercadoria', 
      type: 'entrada', 
      description: 'Entrada de produtos através de compra', 
      active: true 
    },
    { 
      id: '2', 
      name: 'Venda no balcão', 
      type: 'saida', 
      description: 'Saída de produtos por venda direta', 
      active: true 
    },
    { 
      id: '3', 
      name: 'Transferência entre setores', 
      type: 'transferencia', 
      description: 'Movimentação interna entre locais', 
      active: true 
    },
    { 
      id: '4', 
      name: 'Perda por vencimento', 
      type: 'saida', 
      description: 'Baixa por produto vencido', 
      active: false 
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('⚙️ Salvando motivo:', formData);
    alert(isEditing ? 'Motivo atualizado com sucesso! (Mock)' : 'Motivo criado com sucesso! (Mock)');
    setIsEditing(false);
    setSelectedReason(null);
    setFormData({ name: '', type: 'entrada', description: '', active: true });
    onSuccess?.();
  };

  const handleEdit = (reason: Reason) => {
    setSelectedReason(reason);
    setFormData({
      name: reason.name,
      type: reason.type,
      description: reason.description,
      active: reason.active
    });
    setIsEditing(true);
  };

  const handleDelete = (reason: Reason) => {
    if (confirm(`Deseja realmente excluir o motivo "${reason.name}"?`)) {
      console.log('🗑️ Excluindo motivo:', reason);
      alert('Motivo excluído com sucesso! (Mock)');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entrada': return 'text-green-600 bg-green-100';
      case 'saida': return 'text-red-600 bg-red-100';
      case 'transferencia': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entrada': return '📥';
      case 'saida': return '📤';
      case 'transferencia': return '🔄';
      default: return '📦';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">⚙️ Gerenciar Motivos</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de motivos */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📋 Motivos Cadastrados</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockReasons.map((reason) => (
                <div 
                  key={reason.id} 
                  className={`border rounded-lg p-4 ${!reason.active ? 'bg-gray-50 opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{reason.name}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(reason.type)}`}>
                          {getTypeIcon(reason.type)} {reason.type}
                        </span>
                        {!reason.active && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{reason.description}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(reason)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded border border-blue-300 hover:bg-blue-50"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(reason)}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded border border-red-300 hover:bg-red-50"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              {isEditing ? '✏️ Editar Motivo' : '➕ Novo Motivo'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Motivo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ex: Compra de mercadoria"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Movimentação</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="entrada">📥 Entrada</option>
                  <option value="saida">📤 Saída</option>
                  <option value="transferencia">🔄 Transferência</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Descrição detalhada do motivo..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Motivo ativo
                </label>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                <p className="text-sm text-yellow-800">
                  💡 Motivos inativos não aparecerão nos formulários de movimentação.
                </p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {isEditing ? 'Atualizar' : 'Criar'} Motivo
                </button>
                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedReason(null);
                      setFormData({ name: '', type: 'entrada', description: '', active: true });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft,
  RefreshCw 
} from "lucide-react";
import { inventoryService, MovementReason } from '@/services/inventory';

interface ManageReasonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManageReasonsModal({ isOpen, onClose, onSuccess }: ManageReasonsModalProps) {
  const [reasons, setReasons] = useState<MovementReason[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingReason, setEditingReason] = useState<MovementReason | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'entry' as 'entry' | 'exit' | 'transfer',
    description: '',
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load reasons
  useEffect(() => {
    if (isOpen) {
      loadReasons();
    }
  }, [isOpen]);

  const loadReasons = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getReasons();
      setReasons(data);
    } catch (error) {
      console.error('Erro ao carregar motivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'entry',
      description: '',
      is_active: true
    });
    setEditingReason(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (reason: MovementReason) => {
    setFormData({
      name: reason.name,
      type: reason.type as 'entry' | 'exit' | 'transfer',
      description: reason.description || '',
      is_active: reason.is_active
    });
    setEditingReason(reason);
    setShowForm(true);
  };

  const handleDelete = async (reasonId: number) => {
    if (!confirm('Tem certeza que deseja excluir este motivo?')) {
      return;
    }

    try {
      setLoading(true);
      await inventoryService.deleteReason(reasonId);
      await loadReasons();
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao excluir motivo:', error);
      alert('Erro ao excluir motivo. Pode estar sendo usado em movimentações.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const reasonData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || null,
        is_active: formData.is_active
      };

      if (editingReason) {
        await inventoryService.updateReason(editingReason.id, reasonData);
      } else {
        await inventoryService.createReason(reasonData);
      }

      await loadReasons();
      onSuccess?.();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar motivo:', error);
      setErrors({ submit: 'Erro ao salvar motivo. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'exit':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'entry':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Entrada</Badge>;
      case 'exit':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Saída</Badge>;
      case 'transfer':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Transferência</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const filteredReasons = reasons.filter(reason => 
    formData.type ? reason.type === formData.type : true
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciar Motivos de Movimentação
          </DialogTitle>
          <DialogDescription>
            Configure os motivos disponíveis para movimentações de estoque
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowForm(true)}
                size="sm"
                disabled={showForm}
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Motivo
              </Button>
              
              <Button
                variant="outline"
                onClick={loadReasons}
                disabled={loading}
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {showForm && (
              <Button
                variant="ghost"
                onClick={resetForm}
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Compra de fornecedor"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'entry' | 'exit' | 'transfer') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entrada</SelectItem>
                      <SelectItem value="exit">Saída</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500 mt-1">{errors.type}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional do motivo..."
                  rows={2}
                />
              </div>

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingReason ? 'Atualizar' : 'Salvar'}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} size="sm">
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ width: '120px' }}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && reasons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Carregando motivos...
                    </TableCell>
                  </TableRow>
                ) : reasons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum motivo cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  reasons.map((reason) => (
                    <TableRow key={reason.id}>
                      <TableCell>
                        <p className="font-medium">{reason.name}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(reason.type)}
                          {getTypeBadge(reason.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {reason.description || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={reason.is_active ? "outline" : "secondary"}
                          className={reason.is_active 
                            ? "text-green-600 border-green-600" 
                            : "text-gray-500"
                          }
                        >
                          {reason.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(reason)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(reason.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="p-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
