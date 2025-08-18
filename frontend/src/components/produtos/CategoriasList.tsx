import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { 
  PencilIcon, 
  LockClosedIcon, 
  TrashIcon,
  Plus,
  Download,
  Palette,
  Eye,
  EyeOff,
  Package
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Categoria, CategoriaFilter } from '../../types/produto';
import { DataTable } from '../shared/DataTable';
import StatusToggle from '../shared/StatusToggle';
import ActionButton from '../shared/ActionButton';
import CategoriaForm from './CategoriaForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

const CategoriasList: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CategoriaFilter>({
    nome: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | undefined>(undefined);

  useEffect(() => {
    loadCategorias();
  }, [filters]);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      // TODO: Implementar chamada para API
      // const response = await api.get('/categorias', { params: filters });
      // setCategorias(response.data);
      
      // Mock data para desenvolvimento
      setCategorias([
        {
          id: '1',
          nome: 'CERVEJA',
          mostrar_dashboard: true,
          mostrar_pos: true,
          maximo_composicao: 10,
          minimo_composicao: 1,
          cor: '#fbbf24',
          icone: '🍺',
          ordem: 1,
          produtos_count: 25,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          nome: 'DRINKS',
          mostrar_dashboard: true,
          mostrar_pos: true,
          maximo_composicao: 5,
          minimo_composicao: 1,
          cor: '#ec4899',
          icone: '🍹',
          ordem: 2,
          produtos_count: 18,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '3',
          nome: 'PETISCOS',
          mostrar_dashboard: true,
          mostrar_pos: true,
          maximo_composicao: 15,
          minimo_composicao: 2,
          cor: '#f59e0b',
          icone: '🍟',
          ordem: 3,
          produtos_count: 32,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '4',
          nome: 'ENTRADA',
          mostrar_dashboard: false,
          mostrar_pos: true,
          cor: '#3b82f6',
          icone: '🎫',
          ordem: 4,
          produtos_count: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '5',
          nome: 'CAMAROTE',
          mostrar_dashboard: true,
          mostrar_pos: true,
          cor: '#8b5cf6',
          icone: '👑',
          ordem: 5,
          produtos_count: 3,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDashboard = async (id: string, checked: boolean) => {
    try {
      // TODO: Implementar chamada para API
      // await api.patch(`/categorias/${id}`, { mostrar_dashboard: checked });
      setCategorias(prev => prev.map(c => c.id === id ? { ...c, mostrar_dashboard: checked } : c));
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error);
    }
  };

  const handleTogglePOS = async (id: string, checked: boolean) => {
    try {
      // TODO: Implementar chamada para API
      // await api.patch(`/categorias/${id}`, { mostrar_pos: checked });
      setCategorias(prev => prev.map(c => c.id === id ? { ...c, mostrar_pos: checked } : c));
    } catch (error) {
      console.error('Erro ao atualizar POS:', error);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
  };

  const handleLimitAccess = (categoria: Categoria) => {
    console.log('Limitando acesso:', categoria);
    // TODO: Implementar limitação de acesso
  };

  const handleDelete = async (categoria: Categoria) => {
    try {
      // TODO: Implementar chamada para API
      // await api.delete(`/categorias/${categoria.id}`);
      setCategorias(prev => prev.filter(c => c.id !== categoria.id));
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  const handleExport = () => {
    console.log('Exportando categorias');
    // TODO: Implementar exportação
  };

  const handleSaveCategoria = async (data: any) => {
    try {
      if (editingCategoria) {
        // TODO: Implementar chamada para API de atualização
        console.log('Atualizando categoria:', data);
      } else {
        // TODO: Implementar chamada para API de criação
        console.log('Criando categoria:', data);
      }
      
      // Recarregar lista
      await loadCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCategoria(undefined);
  };

  const columns: ColumnDef<Categoria>[] = [
    {
      accessorKey: 'nome',
      header: 'Categoria',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: row.original.cor || '#gray' }}
          >
            {row.original.icone || '📦'}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground">{row.original.nome}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.produtos_count || 0} produtos
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'mostrar_dashboard',
      header: 'Mostrar Dashboard',
      cell: ({ row }) => (
        <StatusToggle
          checked={row.original.mostrar_dashboard}
          onChange={(checked) => handleToggleDashboard(row.original.id, checked)}
          color="blue"
          size="sm"
        />
      ),
    },
    {
      accessorKey: 'mostrar_pos',
      header: 'Mostrar na POS',
      cell: ({ row }) => (
        <StatusToggle
          checked={row.original.mostrar_pos}
          onChange={(checked) => handleTogglePOS(row.original.id, checked)}
          color="green"
          size="sm"
        />
      ),
    },
    {
      accessorKey: 'maximo_composicao',
      header: 'Máximo em Composição',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'minimo_composicao',
      header: 'Mínimo em Composição',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'ordem',
      header: 'Ordem',
      cell: ({ getValue }) => (
        <Badge variant="secondary">#{getValue()}</Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <ActionButton
            icon={PencilIcon}
            tooltip="Editar"
            onClick={() => handleEdit(row.original)}
            color="blue"
            size="sm"
          />
          <ActionButton
            icon={LockClosedIcon}
            tooltip="Limitar acesso"
            onClick={() => handleLimitAccess(row.original)}
            color="orange"
            size="sm"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <ActionButton
                icon={TrashIcon}
                tooltip="Excluir"
                onClick={() => {}}
                color="red"
                size="sm"
              />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a categoria "{row.original.nome}"? 
                  Esta ação não pode ser desfeita e todos os produtos desta categoria ficarão sem categoria.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleDelete(row.original)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CATEGORIA DE PRODUTOS</h1>
          <p className="text-muted-foreground mt-1">
            Organize seus produtos em categorias para melhor gestão
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Palette className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Categorias</p>
              <p className="text-2xl font-bold">{categorias.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">No Dashboard</p>
              <p className="text-2xl font-bold">
                {categorias.filter(c => c.mostrar_dashboard).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">No POS</p>
              <p className="text-2xl font-bold">
                {categorias.filter(c => c.mostrar_pos).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <p className="text-2xl font-bold">
                {categorias.reduce((sum, c) => sum + (c.produtos_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <DataTable 
        columns={columns}
        data={categorias}
        loading={loading}
        pageSize={10}
      />

      {/* Modal de criação/edição */}
      <CategoriaForm
        categoria={editingCategoria}
        open={showCreateModal || !!editingCategoria}
        onClose={handleCloseModal}
        onSave={handleSaveCategoria}
      />
    </div>
  );
};

export default CategoriasList;