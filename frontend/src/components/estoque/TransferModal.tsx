import React, { useState } from 'react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransferModal({ isOpen, onClose, onSuccess }: TransferModalProps) {
  const [formData, setFormData] = useState({
    reference: '',
    product: '',
    quantity: '',
    fromLocation: '',
    toLocation: '',
    notes: ''
  });

  console.log('🔄 TransferModal renderizado com isOpen:', isOpen);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 Formulário de transferência submetido:', formData);
    alert('Transferência realizada com sucesso! (Mock)');
    onSuccess?.();
    onClose();
  };

  const locations = [
    { value: 'deposito', label: 'Depósito Principal' },
    { value: 'bar', label: 'Bar Principal' },
    { value: 'cozinha', label: 'Cozinha' },
    { value: 'bar-secundario', label: 'Bar Secundário' },
    { value: 'almoxarifado', label: 'Almoxarifado' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🔄 Nova Transferência</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Referência</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({...formData, reference: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: TRF 001234"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Produto</label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({...formData, product: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Nome do produto"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Quantidade</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="0"
              min="0"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">De</label>
              <select
                value={formData.fromLocation}
                onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Origem</option>
                {locations.map(location => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Para</label>
              <select
                value={formData.toLocation}
                onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Destino</option>
                {locations.map(location => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Motivo da transferência..."
              rows={3}
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-sm text-blue-800">
              📦 A transferência será registrada em ambos os locais automaticamente.
            </p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Transferir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TransferLine {
  id?: string;
  product?: Product;
  quantity: number;
  available_stock: number;
  notes: string;
}

export function TransferModal({ isOpen, onClose, onSuccess }: TransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [reasons, setReasons] = useState<MovementReason[]>([]);
  
  const [formData, setFormData] = useState({
    reference: '',
    date: new Date().toISOString().split('T')[0],
    location_from_id: '',
    location_to_id: '',
    reason_id: '',
    notes: ''
  });

  const [lines, setLines] = useState<TransferLine[]>([{
    quantity: 0,
    available_stock: 0,
    notes: ''
  }]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [locationsData, reasonsData] = await Promise.all([
        inventoryService.getLocations(),
        inventoryService.getReasons({ type: 'transfer' })
      ]);

      setLocations(locationsData);
      setReasons(reasonsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const searchProducts = async (query: string) => {
    if (query.length < 2) {
      setProducts([]);
      return;
    }

    try {
      const data = await inventoryService.searchProducts({ q: query, limit: 10 });
      setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
    }
  };

  const checkStockAvailability = async (productId: number, locationId: number) => {
    if (!locationId) return 0;

    try {
      const response = await inventoryService.getStockPosition({
        product_id: productId,
        location_id: locationId
      });
      
      const position = response.items?.find(p => 
        p.product.id === productId && p.location.id === locationId
      );
      
      return position?.available || 0;
    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
      return 0;
    }
  };

  const handleProductSelect = async (lineIndex: number, product: Product) => {
    const newLines = [...lines];
    newLines[lineIndex] = {
      ...newLines[lineIndex],
      product: product,
      quantity: 0
    };

    // Check stock availability if origin location is selected
    if (formData.location_from_id) {
      const available = await checkStockAvailability(product.id, parseInt(formData.location_from_id));
      newLines[lineIndex].available_stock = available;
    }

    setLines(newLines);
    setProducts([]);
  };

  const updateLine = (lineIndex: number, field: keyof TransferLine, value: any) => {
    const newLines = [...lines];
    newLines[lineIndex] = {
      ...newLines[lineIndex],
      [field]: value
    };
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, {
      quantity: 0,
      available_stock: 0,
      notes: ''
    }]);
  };

  const removeLine = (lineIndex: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, index) => index !== lineIndex));
    }
  };

  // Update stock availability when origin location changes
  useEffect(() => {
    if (formData.location_from_id) {
      lines.forEach(async (line, index) => {
        if (line.product) {
          const available = await checkStockAvailability(line.product.id, parseInt(formData.location_from_id));
          updateLine(index, 'available_stock', available);
        }
      });
    }
  }, [formData.location_from_id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.reference.trim()) {
      newErrors.reference = 'Referência é obrigatória';
    }

    if (!formData.location_from_id) {
      newErrors.location_from_id = 'Local de origem é obrigatório';
    }

    if (!formData.location_to_id) {
      newErrors.location_to_id = 'Local de destino é obrigatório';
    }

    if (formData.location_from_id === formData.location_to_id) {
      newErrors.location_to_id = 'Local de destino deve ser diferente do local de origem';
    }

    if (!formData.reason_id) {
      newErrors.reason_id = 'Motivo é obrigatório';
    }

    // Validate lines
    const validLines = lines.filter(line => 
      line.product && line.quantity > 0
    );

    if (validLines.length === 0) {
      newErrors.lines = 'Adicione pelo menos um produto válido';
    }

    // Check stock availability
    validLines.forEach((line, index) => {
      if (line.quantity > line.available_stock) {
        newErrors[`line_${index}`] = `Estoque insuficiente. Disponível: ${line.available_stock}`;
      }
    });

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

      const validLines = lines.filter(line => 
        line.product && line.quantity > 0
      );

      const transferData = {
        reference: formData.reference,
        date: formData.date,
        location_from_id: parseInt(formData.location_from_id),
        location_to_id: parseInt(formData.location_to_id),
        reason_id: parseInt(formData.reason_id),
        notes: formData.notes,
        lines: validLines.map(line => ({
          product_id: line.product!.id,
          quantity: line.quantity,
          notes: line.notes
        }))
      };

      await inventoryService.createTransfer(transferData);
      
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        reference: '',
        date: new Date().toISOString().split('T')[0],
        location_from_id: '',
        location_to_id: '',
        reason_id: '',
        notes: ''
      });
      setLines([{
        quantity: 0,
        available_stock: 0,
        notes: ''
      }]);
      
    } catch (error) {
      console.error('Erro ao criar transferência:', error);
      setErrors({ submit: 'Erro ao salvar transferência. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);
  const hasStockIssues = lines.some(line => 
    line.product && line.quantity > 0 && line.quantity > line.available_stock
  );

  const fromLocation = locations.find(l => l.id.toString() === formData.location_from_id);
  const toLocation = locations.find(l => l.id.toString() === formData.location_to_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Nova Transferência de Estoque
          </DialogTitle>
          <DialogDescription>
            Transfira produtos entre locais de estoque
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Header Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border-b">
            <div>
              <Label htmlFor="reference">
                <FileText className="h-4 w-4 inline mr-1" />
                Referência *
              </Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Ex: TRF 001234"
                className={errors.reference ? 'border-red-500' : ''}
              />
              {errors.reference && (
                <p className="text-sm text-red-500 mt-1">{errors.reference}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location_from">Local de Origem *</Label>
              <Select
                value={formData.location_from_id}
                onValueChange={(value) => setFormData({ ...formData, location_from_id: value })}
              >
                <SelectTrigger className={errors.location_from_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione origem" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem 
                      key={location.id} 
                      value={location.id.toString()}
                      disabled={location.id.toString() === formData.location_to_id}
                    >
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location_from_id && (
                <p className="text-sm text-red-500 mt-1">{errors.location_from_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location_to">Local de Destino *</Label>
              <Select
                value={formData.location_to_id}
                onValueChange={(value) => setFormData({ ...formData, location_to_id: value })}
              >
                <SelectTrigger className={errors.location_to_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione destino" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem 
                      key={location.id} 
                      value={location.id.toString()}
                      disabled={location.id.toString() === formData.location_from_id}
                    >
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location_to_id && (
                <p className="text-sm text-red-500 mt-1">{errors.location_to_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="reason">Motivo *</Label>
              <Select
                value={formData.reason_id}
                onValueChange={(value) => setFormData({ ...formData, reason_id: value })}
              >
                <SelectTrigger className={errors.reason_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id.toString()}>
                      {reason.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reason_id && (
                <p className="text-sm text-red-500 mt-1">{errors.reason_id}</p>
              )}
            </div>
          </div>

          {/* Transfer Direction Visual */}
          {fromLocation && toLocation && (
            <div className="flex items-center justify-center p-4 bg-blue-50 border-b">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-medium text-blue-900">{fromLocation.name}</div>
                  <div className="text-sm text-blue-600">Origem</div>
                </div>
                <ArrowRight className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium text-blue-900">{toLocation.name}</div>
                  <div className="text-sm text-blue-600">Destino</div>
                </div>
              </div>
            </div>
          )}

          {/* Stock Issues Alert */}
          {hasStockIssues && (
            <Alert className="mx-4 mt-4 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Atenção: Alguns produtos têm quantidade superior ao estoque disponível no local de origem.
              </AlertDescription>
            </Alert>
          )}

          {/* Products Table */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Produtos a Transferir</h3>
              <Button type="button" onClick={addLine} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            {errors.lines && (
              <p className="text-sm text-red-500 mb-4">{errors.lines}</p>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '300px' }}>Produto</TableHead>
                  <TableHead style={{ width: '120px' }}>Disponível</TableHead>
                  <TableHead style={{ width: '120px' }}>Quantidade</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead style={{ width: '60px' }}></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="relative">
                        <Input
                          placeholder="Digite para buscar produto..."
                          onChange={(e) => searchProducts(e.target.value)}
                          value={line.product?.name || ''}
                          disabled={!formData.location_from_id}
                        />
                        {products.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {products.map((product) => (
                              <div
                                key={product.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleProductSelect(index, product)}
                              >
                                <p className="font-medium">{product.name}</p>
                                {product.code && (
                                  <p className="text-sm text-gray-500">{product.code}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {line.product && (
                          <div className="mt-1">
                            <Badge variant="outline">{line.product.unit.symbol}</Badge>
                          </div>
                        )}
                      </div>
                      {!formData.location_from_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          Selecione o local de origem primeiro
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className={`font-medium ${line.available_stock <= 0 ? 'text-red-600' : line.available_stock <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {line.available_stock.toLocaleString()}
                        </span>
                        {line.product && (
                          <div className="text-xs text-gray-500">
                            {line.product.unit.symbol}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.quantity || ''}
                        onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                        disabled={!line.product}
                        className={
                          line.quantity > line.available_stock ? 'border-red-500' : ''
                        }
                      />
                      {errors[`line_${index}`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`line_${index}`]}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Observações..."
                        value={line.notes}
                        onChange={(e) => updateLine(index, 'notes', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(index)}
                        disabled={lines.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Notes */}
          <div className="p-4 border-t">
            <Label htmlFor="notes">Observações Gerais</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações sobre a transferência..."
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              Total de itens: <span className="font-medium">{totalItems.toLocaleString()}</span>
            </div>
            {hasStockIssues && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Verificar Estoque
              </Badge>
            )}
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md mx-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <DialogFooter className="p-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || hasStockIssues}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Confirmar Transferência
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
