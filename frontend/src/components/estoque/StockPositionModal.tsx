import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, RefreshCw, Package, MapPin } from "lucide-react";
import { inventoryService, StockPosition } from '@/services/inventory';

interface StockPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function StockPositionModal({ isOpen, onClose, onRefresh }: StockPositionModalProps) {
  const [positions, setPositions] = useState<StockPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showZeroStock, setShowZeroStock] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    pages: 0
  });

  const loadPositions = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getStockPosition({
        q: searchTerm || undefined,
        with_zero_stock: showZeroStock,
        page: pagination.page,
        page_size: pagination.pageSize
      });
      
      setPositions(response.items || []);
      setPagination({
        page: response.page || 1,
        pageSize: response.page_size || 50,
        total: response.total || 0,
        pages: response.pages || 0
      });
    } catch (error) {
      console.error('Erro ao carregar posições:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPositions();
    }
  }, [isOpen, searchTerm, showZeroStock, pagination.page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadPositions();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStockStatusBadge = (available: number, onHand: number) => {
    if (available <= 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    } else if (available <= 5) {
      return <Badge variant="secondary" className="text-orange-600 border-orange-600">Baixo</Badge>;
    } else {
      return <Badge variant="outline" className="text-green-600 border-green-600">OK</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Posição de Estoque
          </DialogTitle>
          <DialogDescription>
            Visualize a posição atual de todos os produtos em estoque
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 py-4 border-b">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex gap-2">
            <Button
              variant={showZeroStock ? "default" : "outline"}
              onClick={() => setShowZeroStock(!showZeroStock)}
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showZeroStock ? 'Ocultar Zerados' : 'Mostrar Zerados'}
            </Button>
            
            <Button
              variant="outline"
              onClick={loadPositions}
              disabled={loading}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="text-right">Em Estoque</TableHead>
                <TableHead className="text-right">Reservado</TableHead>
                <TableHead className="text-right">Disponível</TableHead>
                <TableHead className="text-right">Custo Médio</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Carregando posições...
                  </TableCell>
                </TableRow>
              ) : positions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma posição encontrada
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((position) => (
                  <TableRow key={`${position.product.id}-${position.location.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{position.product.name}</p>
                        {position.product.code && (
                          <p className="text-sm text-muted-foreground">
                            Código: {position.product.code}
                          </p>
                        )}
                        {position.product.category && (
                          <p className="text-sm text-muted-foreground">
                            {position.product.category.name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{position.location.name}</p>
                          {position.location.code && (
                            <p className="text-sm text-muted-foreground">
                              {position.location.code}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {position.on_hand.toLocaleString()} {position.product.unit.symbol}
                    </TableCell>
                    <TableCell className="text-right">
                      {position.reserved.toLocaleString()} {position.product.unit.symbol}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {position.available.toLocaleString()} {position.product.unit.symbol}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(position.cost_avg)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(position.value_total)}
                    </TableCell>
                    <TableCell>
                      {getStockStatusBadge(position.available, position.on_hand)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
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
