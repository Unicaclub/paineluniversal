import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Pencil, 
  Copy, 
  Lock, 
  Trash2,
  Plus,
  Download,
  Upload,
  Search
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Produto, ProdutoFilter } from '../../types/produto';
import { DataTable } from '../shared/DataTable';
import StatusToggle from '../shared/StatusToggle';
import ActionButton from '../shared/ActionButton';
import ProductFilters from './ProductFilters';
import { produtoService, categoriaService } from '../../services/api';
import BulkActions from './BulkActions';
import ProductForm from './ProductForm';

const ProductsList: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProdutoFilter>({
    nome: '',
    categoria: '',
    tipo: '',
    habilitado: 'all'
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
      console.log('📡 Carregando produtos da API...');
      
      // Importar serviço diretamente para evitar problemas
      const { produtoService } = await import('../../services/api');
      
      const response = await produtoService.getAll();
      console.log('📦 Produtos recebidos:', response);
      
      // Converter formato se necessário
      const produtosFormatados = response.map((produto: any) => ({
        id: produto.id.toString(),
        nome: produto.nome,
        codigo: `PROD${produto.id.toString().padStart(3, '0')}`,
        categoria_id: produto.categoria_id?.toString() || '',
        categoria: produto.categoria || { id: produto.categoria_id, nome: 'Sem categoria' },
        valor: produto.preco,
        destaque: false,
        habilitado: true,
        promocional: false,
        tipo: produto.tipo || 'FISICO',
        descricao: produto.descricao || '',
        evento_id: produto.evento_id
      }));
      
      setProdutos(produtosFormatados);
      console.log('✅ Produtos carregados com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      
      // Fallback para dados mock em caso de erro
      console.log('🔄 Usando dados mock como fallback...');
      setProdutos([
        {
          id: '1',
          nome: 'Produto Demo',
          codigo: 'DEMO001',
          categoria_id: '1',
          categoria: { id: '1', nome: 'DEMO', mostrar_dashboard: true, mostrar_pos: true, ordem: 1, created_at: new Date(), updated_at: new Date() },
          valor: 10.00,
          destaque: false,
          habilitado: true,
          promocional: false,
          tipo: 'FISICO',
          descricao: 'Produto demonstrativo',
          estoque: 100,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          nome: 'Caipirinha de Cachaça',
          codigo: 'DRINK001',
          categoria_id: '2',
          categoria: { id: '2', nome: 'DRINKS', mostrar_dashboard: true, mostrar_pos: true, ordem: 2, created_at: new Date(), updated_at: new Date() },
          valor: 12.00,
          destaque: false,
          habilitado: true,
          promocional: true,
          tipo: 'FISICO',
          descricao: 'Drink tradicional brasileiro',
          estoque: 0,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDestaque = async (id: string, checked: boolean) => {
    try {
      // TODO: Implementar chamada para API
      // await api.patch(`/produtos/${id}`, { destaque: checked });
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, destaque: checked } : p));
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
    }
  };

  const handleToggleHabilitado = async (id: string, checked: boolean) => {
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

  const handleSaveProduct = async (data: any, imageFile?: File) => {
    try {
      console.log('🔄 Função handleSaveProduct iniciada');
      console.log('📥 Dados recebidos:', data);
      console.log('🖼️ Arquivo de imagem:', imageFile);
      
      // Validar dados obrigatórios (campo correto é 'valor')
      console.log('🔍 Validando campos obrigatórios...');
      console.log('nome:', data.nome, 'valor:', data.valor);
      
      if (!data.nome || !data.valor) {
        console.error('❌ Validação falhou - campos obrigatórios ausentes');
        alert('Nome e preço são obrigatórios!');
        return;
      }
      
      console.log('✅ Validação passou');
      
      // Adicionar campos obrigatórios com validação
      const produtoData = {
        nome: data.nome,
        descricao: data.descricao || '',
        preco: parseFloat(data.valor) || 0, // Usar 'valor' do frontend
        tipo: data.tipo || 'FISICO', // Padrão físico
        evento_id: data.evento_id || 1, // TODO: Pegar do contexto do usuário
        categoria_id: data.categoria_id || null
      };
      
      console.log('📤 Dados finais para envio:', produtoData);
      
      // Importar o serviço diretamente para evitar problemas de cache
      const { produtoService } = await import('../../services/api');
      
      if (editingProduct) {
        console.log('✏️ Atualizando produto existente...');
        await produtoService.update(editingProduct.id, produtoData);
        console.log('✅ Produto atualizado com sucesso!');
      } else {
        console.log('🆕 Criando novo produto...');
        const novoProduto = await produtoService.create(produtoData);
        console.log('✅ Produto criado com sucesso:', novoProduto);
      }
      
      // Fechar modal
      handleCloseModal();
      
      // Recarregar lista
      console.log('🔄 Recarregando lista de produtos...');
      await loadProdutos();
      
      console.log('🎉 Processo concluído com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar produto:', error);
      
      // Log mais detalhado do erro
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      }
      
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
          {row.original.imagem && (
            <img 
              src={row.original.imagem} 
              alt={row.original.nome}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div className="min-w-0">
            <div className="font-medium text-foreground truncate">{row.original.nome}</div>
            {row.original.codigo && (
              <div className="text-sm text-muted-foreground">{row.original.codigo}</div>
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
        <Badge variant="outline">{row.original.categoria?.nome || 'Sem categoria'}</Badge>
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
          onChange={(checked) => handleToggleDestaque(row.original.id, checked)}
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
          onChange={(checked) => handleToggleHabilitado(row.original.id, checked)}
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PRODUTOS</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os produtos do estabelecimento
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