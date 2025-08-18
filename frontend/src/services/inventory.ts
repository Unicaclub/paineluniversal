import { api } from './api';

// Types
export interface StockPosition {
  id: number;
  product: {
    id: number;
    name: string;
    code?: string;
    barcode?: string;
    category?: {
      id: number;
      name: string;
    };
    unit: {
      id: number;
      name: string;
      symbol: string;
    };
  };
  location: {
    id: number;
    name: string;
    code?: string;
  };
  on_hand: number;
  reserved: number;
  available: number;
  cost_avg: number;
  value_total: number;
  last_movement_at?: string;
}

export interface StockMovement {
  id: number;
  type: string;
  reference: string;
  date: string;
  location: {
    id: number;
    name: string;
  };
  reason?: {
    id: number;
    name: string;
    type: string;
  };
  notes?: string;
  status: string;
  created_at: string;
  lines?: StockMovementLine[];
}

export interface StockMovementLine {
  id: number;
  product: {
    id: number;
    name: string;
    code?: string;
    unit: {
      id: number;
      symbol: string;
    };
  };
  quantity: number;
  cost_unit?: number;
  cost_total?: number;
  notes?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  factor_to_base: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  code?: string;
  description?: string;
  barcode?: string;
  category?: Category;
  unit: Unit;
  is_active: boolean;
}

export interface Location {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
}

export interface MovementReason {
  id: number;
  name: string;
  description?: string;
  type: string;
  is_active: boolean;
}

export interface CreateStockMovement {
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  reason_id?: number;
  document_ref?: string;
  document_date?: string;
  location_from_id?: number;
  location_to_id?: number;
  notes?: string;
  lines: {
    product_id: number;
    unit_id: number;
    qty: number;
    unit_price?: number;
    notes?: string;
  }[];
}

// API Service
export const inventoryService = {
  // Stock Position
  async getStockPosition(filters?: {
    product_id?: number;
    category_id?: number;
    location_id?: number;
    q?: string;
    with_zero_stock?: boolean;
    only_negative?: boolean;
    page?: number;
    page_size?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/inventory/position?${params}`);
    return response.data;
  },

  // Stock Movements
  async getStockMovements(filters?: {
    product_id?: number;
    location_id?: number;
    movement_type?: string;
    date_from?: string;
    date_to?: string;
    document_ref?: string;
    page?: number;
    page_size?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/inventory/movements?${params}`);
    return response.data;
  },

  async createStockMovement(data: CreateStockMovement) {
    const response = await api.post('/inventory/movements', data);
    return response.data;
  },

  async getStockMovement(id: number) {
    const response = await api.get(`/inventory/movements/${id}`);
    return response.data;
  },

  // Autocomplete endpoints
  async getCategories(q?: string): Promise<Category[]> {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    const response = await api.get(`/inventory/autocomplete/categories${params}`);
    return response.data;
  },

  async getUnits(q?: string): Promise<Unit[]> {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    const response = await api.get(`/inventory/autocomplete/units${params}`);
    return response.data;
  },

  async getProducts(q?: string): Promise<Product[]> {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    const response = await api.get(`/inventory/autocomplete/products${params}`);
    return response.data;
  },

  async getLocations(q?: string): Promise<Location[]> {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    const response = await api.get(`/inventory/autocomplete/locations${params}`);
    return response.data;
  },

  async getMovementReasons(direction?: 'in' | 'out' | 'both'): Promise<MovementReason[]> {
    const params = direction ? `?direction=${direction}` : '';
    const response = await api.get(`/inventory/autocomplete/reasons${params}`);
    return response.data;
  },

  // Management endpoints
  async getAllProducts(filters?: {
    category_id?: number;
    q?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/inventory/products?${params}`);
    return response.data;
  },

  async createProduct(data: {
    name: string;
    code?: string;
    description?: string;
    category_id?: number;
    unit_id: number;
    barcode?: string;
  }) {
    const response = await api.post('/inventory/products', data);
    return response.data;
  },

  async createCategory(data: {
    name: string;
    description?: string;
  }) {
    const response = await api.post('/inventory/categories', data);
    return response.data;
  },

  async createLocation(data: {
    name: string;
    code?: string;
    description?: string;
  }) {
    const response = await api.post('/inventory/locations', data);
    return response.data;
  },

  async createMovementReason(data: {
    name: string;
    description?: string;
    direction: 'IN' | 'OUT' | 'BOTH';
  }) {
    const response = await api.post('/inventory/reasons', data);
    return response.data;
  },

  // Dashboard stats
  async getDashboardStats() {
    try {
      const [positionData, movementsData] = await Promise.all([
        this.getStockPosition({ page_size: 1000 }),
        this.getStockMovements({ 
          date_from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          page_size: 1000 
        })
      ]);

      const totalProducts = positionData.total || 0;
      const totalValue = positionData.items?.reduce((sum: number, item: StockPosition) => 
        sum + (item.value_total || 0), 0) || 0;
      
      const lowStockProducts = positionData.items?.filter((item: StockPosition) => 
        item.available <= 5).length || 0;
      
      const todayMovements = movementsData.total || 0;

      return {
        totalProducts,
        totalValue,
        lowStockProducts,
        todayMovements
      };
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      return {
        totalProducts: 0,
        totalValue: 0,
        lowStockProducts: 0,
        todayMovements: 0
      };
    }
  }
};
