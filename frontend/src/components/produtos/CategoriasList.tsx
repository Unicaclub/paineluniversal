import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { categoriaService, type Categoria, type CategoriaCreate } from "@/services/api";
import { ColumnDef } from "@tanstack/react-table";

interface CategoriasListProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CategoriasList: React.FC<CategoriasListProps> = ({ isOpen = true, onClose }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<CategoriaCreate>({
    nome: '',
    descricao: '',
    cor: '#3B82F6'
  });

  // Carregar categorias ao montar o componente
  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Em caso de erro, usar dados mock temporariamente
      setCategorias([
        { id: 1, nome: 'Bebidas', descricao: 'Bebidas alcoólicas e não alcoólicas', cor: '#10B981', ativo: true },
        { id: 2, nome: 'Comidas', descricao: 'Pratos principais e petiscos', cor: '#F59E0B', ativo: true },
        { id: 3, nome: 'Sobremesas', descricao: 'Doces e sobremesas', cor: '#EF4444', ativo: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategoria = async () => {
    setLoading(true);
    try {
      if (editingCategoria) {
        // Atualizar categoria existente
        const updatedCategoria = await categoriaService.update(editingCategoria.id!, formData);
        setCategorias(prev => prev.map(cat => 
          cat.id === editingCategoria.id ? updatedCategoria : cat
        ));
      } else {
        // Criar nova categoria
        const newCategoria = await categoriaService.create(formData);
        setCategorias(prev => [...prev, newCategoria]);
      }
      
      // Resetar formulário
      setFormData({ nome: '', descricao: '', cor: '#3B82F6' });
      setEditingCategoria(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      // Em caso de erro, simular a criação/atualização localmente
      if (editingCategoria) {
        const updatedCategoria = { ...editingCategoria, ...formData };
        setCategorias(prev => prev.map(cat => 
          cat.id === editingCategoria.id ? updatedCategoria : cat
        ));
      } else {
        const newCategoria: Categoria = {
          id: Math.max(...categorias.map(c => c.id || 0)) + 1,
          ...formData,
          ativo: true,
          criado_em: new Date().toISOString()
        };
        setCategorias(prev => [...prev, newCategoria]);
      }
      setFormData({ nome: '', descricao: '', cor: '#3B82F6' });
      setEditingCategoria(null);
      setIsFormOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategoria = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
      cor: categoria.cor || '#3B82F6'
    });
    setIsFormOpen(true);
  };

  const handleDeleteCategoria = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    setLoading(true);
    try {
      await categoriaService.delete(id);
      setCategorias(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      // Em caso de erro, remover localmente
      setCategorias(prev => prev.filter(cat => cat.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descricao && categoria.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: ColumnDef<Categoria>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: row.original.cor || '#3B82F6' }}
          />
          <span className="font-medium">{row.getValue('nome')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.getValue('descricao') || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('ativo') ? 'default' : 'secondary'}>
          {row.getValue('ativo') ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Ativo
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Inativo
            </>
          )}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditCategoria(row.original)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteCategoria(row.original.id!)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Se não é modal, renderizar como página normal
  if (!isOpen || !onClose) {
    return (
      <div className="h-full bg-background p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Categorias</h1>
              <p className="text-gray-600">Gerencie as categorias dos seus produtos</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {/* Barra de pesquisa */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela de categorias */}
          <div className="border rounded-lg">
            <DataTable
              columns={columns}
              data={filteredCategorias}
              loading={loading}
            />
          </div>

          {/* Modal do formulário */}
          {isFormOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Nome da categoria"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <Input
                      value={formData.descricao || ''}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição da categoria"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cor</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={formData.cor || '#3B82F6'}
                        onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                        className="w-10 h-10 border rounded cursor-pointer"
                      />
                      <Input
                        value={formData.cor || '#3B82F6'}
                        onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingCategoria(null);
                      setFormData({ nome: '', descricao: '', cor: '#3B82F6' });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveCategoria}
                    disabled={loading || !formData.nome.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderizar como modal (versão original)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gerenciar Categorias</h2>
            <Button variant="ghost" onClick={onClose}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Barra de ferramentas */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {/* Tabela de categorias */}
          <div className="border rounded-lg">
            <DataTable
              columns={columns}
              data={filteredCategorias}
              loading={loading}
            />
          </div>
        </div>

        {/* Modal do formulário */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome da categoria"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <Input
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição da categoria"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Cor</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={formData.cor || '#3B82F6'}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      className="w-10 h-10 border rounded cursor-pointer"
                    />
                    <Input
                      value={formData.cor || '#3B82F6'}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingCategoria(null);
                    setFormData({ nome: '', descricao: '', cor: '#3B82F6' });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveCategoria}
                  disabled={loading || !formData.nome.trim()}
                  className="flex-1"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriasList;
