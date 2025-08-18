import React, { useState } from 'react';

interface MovementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MovementHistoryModal({ isOpen, onClose }: MovementHistoryModalProps) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    product: '',
    type: '',
    location: ''
  });

  console.log('📋 MovementHistoryModal renderizado com isOpen:', isOpen);

  if (!isOpen) return null;

  // Mock data para demonstração
  const mockMovements = [
    {
      id: '1',
      date: '2024-01-15',
      reference: 'ENT001',
      product: 'Cerveja Heineken 350ml',
      type: 'entrada',
      quantity: 50,
      location: 'Depósito Principal',
      user: 'João Silva'
    },
    {
      id: '2',
      date: '2024-01-14',
      reference: 'SAI002',
      product: 'Vodka Absolut 1L',
      type: 'saida',
      quantity: -10,
      location: 'Bar Principal',
      user: 'Maria Santos'
    },
    {
      id: '3',
      date: '2024-01-13',
      reference: 'TRF003',
      product: 'Whisky Jack Daniels',
      type: 'transferencia',
      quantity: 5,
      location: 'Cozinha → Bar',
      user: 'Pedro Costa'
    }
  ];

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

  const handleExport = () => {
    console.log('📊 Exportando histórico com filtros:', filters);
    alert('Histórico exportado! (Mock)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📋 Histórico de Movimentações</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* Filtros */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-3">🔍 Filtros</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Data Início</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Data Fim</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Produto</label>
              <input
                type="text"
                value={filters.product}
                onChange={(e) => setFilters({...filters, product: e.target.value})}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Nome do produto"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Local</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">Todos</option>
                <option value="deposito">Depósito</option>
                <option value="bar">Bar</option>
                <option value="cozinha">Cozinha</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de movimentações */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Data</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Referência</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Produto</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Tipo</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Quantidade</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Local</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {mockMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {new Date(movement.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-mono">
                    {movement.reference}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {movement.product}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(movement.type)}`}>
                      {getTypeIcon(movement.type)} {movement.type}
                    </span>
                  </td>
                  <td className={`border border-gray-300 px-3 py-2 text-sm text-right font-medium ${
                    movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {movement.location}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {movement.user}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3 rounded mt-4">
          <p className="text-sm text-blue-800">
            📊 Exibindo {mockMovements.length} movimentações. Use os filtros para refinar a busca.
          </p>
        </div>
        
        <div className="flex gap-2 justify-end mt-4">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📊 Exportar
          </button>
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, RefreshCw, History, Calendar, Package, MapPin, TrendingUp, TrendingDown, ArrowRightLeft, Eye } from "lucide-react";
import { inventoryService, StockMovement, Product, Location } from '@/services/inventory';

interface MovementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product;
  initialLocation?: Location;
}

export function MovementHistoryModal({ 
  isOpen, 
  onClose, 
  initialProduct,
  initialLocation 
}: MovementHistoryModalProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    product_id: initialProduct?.id?.toString() || '',
    location_id: initialLocation?.id?.toString() || '',
    date_from: '',
    date_to: '',
    movement_type: '', // entry, exit, transfer
    reference: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    pages: 0
  });

  const [expandedMovement, setExpandedMovement] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      loadMovements();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [productsData, locationsData] = await Promise.all([
        inventoryService.searchProducts({ limit: 100 }),
        inventoryService.getLocations()
      ]);

      setProducts(productsData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      
      const queryParams: any = {
        page: pagination.page,
        page_size: pagination.pageSize
      };

      // Add filters
      if (filters.product_id) queryParams.product_id = parseInt(filters.product_id);
      if (filters.location_id) queryParams.location_id = parseInt(filters.location_id);
      if (filters.date_from) queryParams.date_from = filters.date_from;
      if (filters.date_to) queryParams.date_to = filters.date_to;
      if (filters.movement_type) queryParams.movement_type = filters.movement_type;
      if (filters.reference) queryParams.reference = filters.reference;

      const response = await inventoryService.getMovements(queryParams);
      
      setMovements(response.items || []);
      setPagination({
        page: response.page || 1,
        pageSize: response.page_size || 50,
        total: response.total || 0,
        pages: response.pages || 0
      });
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMovements();
    }
  }, [pagination.page, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      product_id: '',
      location_id: '',
      date_from: '',
      date_to: '',
      movement_type: '',
      reference: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'exit':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
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

  const toggleMovementDetails = (movementId: number) => {
    setExpandedMovement(expandedMovement === movementId ? null : movementId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Movimentações
          </DialogTitle>
          <DialogDescription>
            Visualize o histórico completo de movimentações de estoque
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-4 border-b">
          <div>
            <Select
              value={filters.product_id}
              onValueChange={(value) => handleFilterChange('product_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os produtos</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={filters.location_id}
              onValueChange={(value) => handleFilterChange('location_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Local" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os locais</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={filters.movement_type}
              onValueChange={(value) => handleFilterChange('movement_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="entry">Entrada</SelectItem>
                <SelectItem value="exit">Saída</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              placeholder="Data inicial"
            />
          </div>

          <div>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              placeholder="Data final"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearFilters}
              size="sm"
              className="flex-1"
            >
              <Filter className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            
            <Button
              variant="outline"
              onClick={loadMovements}
              disabled={loading}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Reference Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por referência..."
              value={filters.reference}
              onChange={(e) => handleFilterChange('reference', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '80px' }}></TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Carregando movimentações...
                  </TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {movements.map((movement) => (
                    <React.Fragment key={movement.id}>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleMovementDetails(movement.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{formatDate(movement.created_at)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(movement.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{movement.reference}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementTypeIcon(movement.type)}
                            {getMovementTypeBadge(movement.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{movement.lines?.[0]?.product?.name || 'N/A'}</p>
                            {movement.lines && movement.lines.length > 1 && (
                              <p className="text-sm text-muted-foreground">
                                +{movement.lines.length - 1} produtos
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <p>{movement.location.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {movement.lines?.reduce((total, line) => total + Math.abs(line.quantity), 0)?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{movement.reason?.name || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Processado
                          </Badge>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Details */}
                      {expandedMovement === movement.id && movement.lines && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-gray-50 p-0">
                            <div className="p-4">
                              <div className="mb-4">
                                <h4 className="font-medium mb-2">Detalhes da Movimentação</h4>
                                {movement.notes && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>Observações:</strong> {movement.notes}
                                  </p>
                                )}
                              </div>

                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead className="text-right">Quantidade</TableHead>
                                    <TableHead className="text-right">Custo Unit.</TableHead>
                                    <TableHead className="text-right">Custo Total</TableHead>
                                    <TableHead>Observações</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {movement.lines.map((line, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <div>
                                          <p className="font-medium">{line.product.name}</p>
                                          {line.product.code && (
                                            <p className="text-sm text-gray-500">
                                              Código: {line.product.code}
                                            </p>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <span className={line.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
                                          {line.quantity >= 0 ? '+' : ''}{line.quantity.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">
                                          {line.product.unit.symbol}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {line.cost_unit ? formatCurrency(line.cost_unit) : '-'}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {line.cost_total ? formatCurrency(line.cost_total) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        <p className="text-sm">{line.notes || '-'}</p>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t pt-4 px-4">
            <p className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.pages} ({pagination.total} registros)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
