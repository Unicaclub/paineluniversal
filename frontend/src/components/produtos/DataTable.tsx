import React from 'react';
import { ColumnDef } from '@tanstack/react-table';

interface DataTableProps {
  columns?: ColumnDef<any>[];
  data?: any[];
  loading?: boolean;
  onSelectionChange?: (selection: any[]) => void;
  pageSize?: number;
}

const DataTable: React.FC<DataTableProps> = ({ data = [], loading = false }) => (
  <div>
    {loading ? 'Carregando...' : `Tabela de dados (${data.length} itens)`}
  </div>
);
export default DataTable;
