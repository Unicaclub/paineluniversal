import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2 } from 'lucide-react';
import { equipeService } from '../../services/api';
import { Colaborador, Cargo, ColaboradorFormData } from '../../types/equipe';

interface ColaboradorModalProps {
  colaborador?: Colaborador | null;
  cargos: Cargo[];
  onSave: () => void;
  onClose: () => void;
}

const ColaboradorModal: React.FC<ColaboradorModalProps> = ({
  colaborador,
  cargos,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<ColaboradorFormData>({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    cargo_id: 0,
    data_admissao: new Date().toISOString().split('T')[0],
    status: 'ativo',
    empresa_id: 1
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome: colaborador.nome,
        email: colaborador.email,
        cpf: colaborador.cpf,
        telefone: colaborador.telefone || '',
        cargo_id: colaborador.cargo_id,
        data_admissao: colaborador.data_admissao,
        status: colaborador.status,
        empresa_id: colaborador.empresa_id
      });
    }
  }, [colaborador]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF deve estar no formato 000.000.000-00';
    }

    if (!formData.cargo_id) {
      newErrors.cargo_id = 'Cargo é obrigatório';
    }

    if (!formData.data_admissao) {
      newErrors.data_admissao = 'Data de admissão é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleInputChange = (field: keyof ColaboradorFormData, value: string | number) => {
    if (field === 'cpf' && typeof value === 'string') {
      value = formatCPF(value);
    }
    if (field === 'telefone' && typeof value === 'string') {
      value = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (colaborador) {
        await equipeService.atualizarColaborador(colaborador.id, formData);
      } else {
        await equipeService.criarColaborador(formData);
      }
      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar colaborador:', error);
      if (error.response?.data?.detail) {
        if (error.response.data.detail.includes('Email')) {
          setErrors({ email: 'Este email já está cadastrado' });
        } else if (error.response.data.detail.includes('CPF')) {
          setErrors({ cpf: 'Este CPF já está cadastrado' });
        } else {
          setErrors({ general: error.response.data.detail });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-xl">
          {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-500/20 border border-red-500 rounded p-3 text-red-400">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">E-mail *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="colaborador@email.com"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
            {errors.email && <span className="text-red-400 text-sm">{errors.email}</span>}
          </div>

          <div>
            <Label className="text-gray-300">Nome Completo *</Label>
            <Input
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Nome completo do colaborador"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
            {errors.nome && <span className="text-red-400 text-sm">{errors.nome}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">CPF *</Label>
            <Input
              type="text"
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
              className="bg-gray-700 border-gray-600 text-white"
              maxLength={14}
              required
            />
            {errors.cpf && <span className="text-red-400 text-sm">{errors.cpf}</span>}
          </div>

          <div>
            <Label className="text-gray-300">Telefone</Label>
            <Input
              type="text"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
              className="bg-gray-700 border-gray-600 text-white"
              maxLength={15}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Cargo *</Label>
            <Select 
              value={formData.cargo_id.toString()} 
              onValueChange={(value) => handleInputChange('cargo_id', parseInt(value))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {cargos.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id.toString()}>
                    {cargo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cargo_id && <span className="text-red-400 text-sm">{errors.cargo_id}</span>}
          </div>

          <div>
            <Label className="text-gray-300">Data de Admissão *</Label>
            <Input
              type="date"
              value={formData.data_admissao}
              onChange={(e) => handleInputChange('data_admissao', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
            {errors.data_admissao && <span className="text-red-400 text-sm">{errors.data_admissao}</span>}
          </div>
        </div>

        <div>
          <Label className="text-gray-300">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleInputChange('status', value as 'ativo' | 'inativo' | 'suspenso')}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="flex gap-3">
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

export default ColaboradorModal;
