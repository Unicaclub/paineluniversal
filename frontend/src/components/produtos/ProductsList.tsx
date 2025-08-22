import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Pencil, 
  Copy, 
  Lock, 
  Trash2,
  Plus,
  Download,
  Upload
  // Search removido
} from 'lucide-react';
import StatusToggle from './StatusToggle';
import ActionButton from './ActionButton';
import ProductFilters from './ProductFilters';
import BulkActions from './BulkActions';
import DataTable from './DataTable';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
// import { Input } from '../ui/input';
import { toast } from '../../hooks/use-toast';
import { Produto } from '../../types/main';

interface ProdutoFilter {
  categoria?: string;
  status?: 'ativo' | 'inativo' | 'all';
  destaque?: boolean;
  nome?: string;
}
// import { DataTable } from '../shared/DataTable';
// import StatusToggle from '../shared/StatusToggle';
// import ActionButton from '../shared/ActionButton';
// import ProductFilters from './ProductFilters';
// import BulkActions from './BulkActions';
import ProductForm from './ProductForm';
import { produtoService, ProdutoCreate } from '../../services/api';
import { useEvento } from '../../contexts/EventoContext';
import EventoAutoConfig from '../desenvolvimento/EventoAutoConfig';

const ProductsList: React.FC = () => {
  const { eventoId } = useEvento();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProdutoFilter>({
    nome: '',
    categoria: '',
  // tipo removido, não existe em ProdutoFilter
  // habilitado removido, não existe em ProdutoFilter
  });
  const [selectedItems, setSelectedItems] = useState<Produto[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | undefined>(undefined);

  useEffect(() => {
    loadProdutos();
  }, [filters]);

  const loadProdutos = async () => {
    setLoading(true);
    try {
      if (!eventoId) {
        toast({
          title: "Aviso",
          description: "Nenhum evento selecionado. Selecione um evento primeiro.",
           // variant removido, não existe em ToastProps
        });
        setProdutos([]);
        return;
      }

      const produtos = await produtoService.getAll(eventoId);
  setProdutos(produtos as any); // ajuste temporário para tipos
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos. Verifique sua conexão.",
         // variant removido, não existe em ToastProps
      });
      
      // Mock data como fallback se a API falhar
      setProdutos([
        {
          id: 1,
          nome: 'Cerveja Heineken 600ml',
          preco: 8.50,
          categoria: 'CERVEJA',
          ativo: true,
          destaque: true,
          habilitado: true,
          descricao: 'Cerveja premium importada',
          estoque: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: 'Caipirinha de Cachaça',
          preco: 12.00,
          categoria: 'DRINKS',
          ativo: true,
          destaque: false,
          habilitado: true,
          descricao: 'Drink tradicional brasileiro',
          estoque: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDestaque = async (id: number, checked: boolean) => {
    try {
      // TODO: Implementar chamada para API
      // await api.patch(`/produtos/${id}`, { destaque: checked });
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, destaque: checked } : p));
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
    }
  };

  const handleToggleHabilitado = async (id: number, checked: boolean) => {
    try {
      // TODO: Implementar chamada para API
      // await api.patch(`/produtos/${id}`, { habilitado: checked });
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, habilitado: checked } : p));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduct(produto);
  };

  const handleDuplicate = (produto: Produto) => {
    console.log('Duplicando produto:', produto);
    // TODO: Implementar duplicação
  };

  const handleLimitAccess = (produto: Produto) => {
    console.log('Limitando acesso:', produto);
    // TODO: Implementar limitação de acesso
  };

  const handleDelete = (produto: Produto) => {
    console.log('Excluindo produto:', produto);
    // TODO: Implementar exclusão com confirmação
  };

  const handleImport = () => {
    console.log('Importando produtos');
    // TODO: Implementar modal de importação
  };

  const handleExport = () => {
    console.log('Exportando produtos');
    // TODO: Implementar modal de exportação
  };

  const handleBulkDelete = () => {
    console.log('Excluindo em lote:', selectedItems);
    // TODO: Implementar exclusão em lote
  };

  const handleBulkEnable = () => {
    console.log('Habilitando em lote:', selectedItems);
    // TODO: Implementar habilitação em lote
  };

  const handleBulkDisable = () => {
    console.log('Desabilitando em lote:', selectedItems);
    // TODO: Implementar desabilitação em lote
  };

  const handleSaveProduct = async (data: any) => {
    try {
      if (!eventoId) {
        toast({
          title: "Erro",
          description: "ID do evento não encontrado. Selecione um evento primeiro.",
           // variant removido, não existe em ToastProps
        });
        return;
      }

      // Converter os dados do formulário para o formato esperado pela API
      const produtoData: ProdutoCreate = {
        nome: data.nome,
        descricao: data.descricao || '',
        tipo: data.tipo,
        preco: data.valor, // Frontend usa 'valor', API usa 'preco'
  // evento_id removido, não existe em ProdutoCreate
  categoria: data.categoria_id ? data.categoria_id.toString() : undefined,
        codigo_interno: data.codigo || undefined, // Frontend usa 'codigo', API usa 'codigo_interno'
        estoque_atual: 0, // Valor padrão
        // destaque removido, não existe em ProdutoCreate
        // promocional removido, não existe em ProdutoCreate
        // Campos adicionais
        // marca removido, não existe em ProdutoCreate
        // fornecedor removido, não existe em ProdutoCreate
        // preco_custo removido, não existe em ProdutoCreate
        // margem_lucro removido, não existe em ProdutoCreate
        // unidade_medida removido, não existe em ProdutoCreate
        // volume removido, não existe em ProdutoCreate
        // teor_alcoolico removido, não existe em ProdutoCreate
        // temperatura_ideal removido, não existe em ProdutoCreate
        // validade_dias removido, não existe em ProdutoCreate
        // ncm removido, não existe em ProdutoCreate
        // cfop removido, não existe em ProdutoCreate
        // cest removido, não existe em ProdutoCreate
        // icms removido, não existe em ProdutoCreate
        // ipi removido, não existe em ProdutoCreate
        // observacoes removido, não existe em ProdutoCreate
      };

      if (editingProduct) {
        // Atualizar produto existente
        await produtoService.update(editingProduct.id!, produtoData);
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!",
        });
      } else {
        // Criar novo produto
        await produtoService.create(produtoData);
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso!",
        });
      }
      
      // Recarregar lista
      await loadProdutos();
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      
      let errorMessage = 'Erro desconhecido ao salvar produto.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
         // variant removido, não existe em ToastProps
      });
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProduct(undefined);
  };

  const columns: ColumnDef<Produto>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'nome',
      header: 'Produto',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {row.original.imagem_url && (
            <img 
              src={row.original.imagem_url} 
              alt={row.original.nome}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div className="min-w-0">
            <div className="font-medium text-foreground truncate">{row.original.nome}</div>
            {row.original.codigo_barras && (
              <div className="text-sm text-muted-foreground">{row.original.codigo_barras}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'id',
      header: 'Produto ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'categoria.nome',
      header: 'Categoria',
      cell: ({ row }) => (
                                <Badge variant="outline">{row.original.categoria || 'Sem categoria'}</Badge>
      ),
    },
    {
      accessorKey: 'ncm',
      header: 'NCM',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'cfop',
      header: 'CFOP',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'cest',
      header: 'CEST',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'valor',
      header: 'Valor',
      cell: ({ getValue }) => (
        <span className="font-semibold">
          R$ {Number(getValue()).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'destaque',
      header: 'Destaque',
      cell: ({ row }) => (
        <StatusToggle
          checked={row.original.destaque}
          onChange={(checked) => handleToggleDestaque(row.original.id!, checked)}
          color="yellow"
          size="sm"
        />
      ),
    },
    {
      accessorKey: 'habilitado',
      header: 'Habilitado?',
      cell: ({ row }) => (
        <StatusToggle
          checked={row.original.habilitado}
          onChange={(checked) => handleToggleHabilitado(row.original.id!, checked)}
          color="green"
          size="sm"
        />
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <ActionButton
            icon={Pencil}
            tooltip="Editar"
            onClick={() => handleEdit(row.original)}
            color="blue"
            size="sm"
          />
          <ActionButton
            icon={Copy}
            tooltip="Duplicar"
            onClick={() => handleDuplicate(row.original)}
            color="green"
            size="sm"
          />
          <ActionButton
            icon={Lock}
            tooltip="Limitar acesso"
            onClick={() => handleLimitAccess(row.original)}
            color="orange"
            size="sm"
          />
          <ActionButton
            icon={Trash2}
            tooltip="Excluir"
            onClick={() => handleDelete(row.original)}
            color="red"
            size="sm"
          />
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <EventoAutoConfig />
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PRODUTOS</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os produtos do estabelecimento
            {eventoId && <span className="ml-2 text-blue-600">• Evento ID: {eventoId}</span>}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleImport} className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <ProductFilters filters={filters} onChange={setFilters} />

      {/* Ações em lote */}
      {selectedItems.length > 0 && (
        <BulkActions 
          selectedCount={selectedItems.length}
          onBulkDelete={handleBulkDelete}
          onBulkEnable={handleBulkEnable}
          onBulkDisable={handleBulkDisable}
        />
      )}

      {/* Tabela */}
      <DataTable 
        columns={columns}
        data={produtos}
        loading={loading}
        onSelectionChange={setSelectedItems}
        pageSize={10}
      />

      {/* Modal de criação/edição */}
      <ProductForm
        produto={editingProduct}
        open={showCreateModal || !!editingProduct}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ProductsList;