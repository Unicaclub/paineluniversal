import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
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
