import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Package,
  Tag,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Produto } from '@/types/main';

const Produtos: React.FC = () => {
  const { addNotification } = useUIStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const { data: produtos = [], isLoading, error } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => api.get('/produtos').then((res: any) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => api.get('/categorias').then((res: any) => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  const filteredProdutos = produtos.filter((produto: Produto) => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || produto.categoria_id?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduto = (id?: number) => {
    if (!id) return;
    addNotification({
      title: "Produto excluído",
      message: "O produto foi excluído com sucesso",
      type: "success"
    });
    // TODO: Implementar exclusão via API
  };

  const handleEditProduto = (id?: number) => {
    if (!id) return;
    // TODO: Navegar para página de edição
    addNotification({
      title: "Editar produto",
      message: "Redirecionando para edição...",
      type: "info"
    });
  };

  const getStatusColor = (ativo: boolean) => {
    return ativo ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (ativo: boolean) => {
    return ativo ? 'Ativo' : 'Inativo';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar produtos</h3>
          <p className="text-muted-foreground">Tente novamente em alguns instantes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-heading font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os produtos do seu sistema
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Novo Produto</span>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{produtos.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtos Ativos</p>
                <p className="text-2xl font-bold">
                  {produtos.filter((p: Produto) => p.ativo).length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold">{categorias.length}</p>
              </div>
              <Tag className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Médio</p>
                <p className="text-2xl font-bold">
                  R$ {produtos.length > 0 
                    ? (produtos.reduce((acc: number, p: Produto) => acc + (p.preco || 0), 0) / produtos.length).toFixed(2)
                    : '0,00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todas as categorias</option>
                  {categorias.map((categoria: any) => (
                    <option key={categoria.id} value={categoria.id.toString()}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>
              {filteredProdutos.length} produto(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProdutos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-lg font-semibold">Nenhum produto encontrado</p>
                          <p className="text-muted-foreground">
                            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando seu primeiro produto'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProdutos.map((produto: Produto) => (
                        <TableRow key={produto.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{produto.nome}</div>
                              {produto.descricao && (
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {produto.descricao}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {produto.categoria ? (
                              <Badge variant="outline">
                                {produto.categoria}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {produto.preco ? (
                              <span className="font-medium">
                                R$ {produto.preco.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={produto.ativo ? 'default' : 'secondary'}
                              className={`${getStatusColor(produto.ativo ?? false)} text-white`}
                            >
                              {getStatusText(produto.ativo ?? false)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {produto.qr_code ? (
                              <Badge variant="outline" className="text-green-600">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Não gerado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditProduto(produto.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteProduto(produto.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Produtos;
