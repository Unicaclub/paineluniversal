import React from 'react';
interface ProductFiltersProps {
  filters: any;
  onChange: (filters: any) => void;
}
const ProductFilters: React.FC<ProductFiltersProps> = ({ /* filters, onChange */ }) => (
  <div>Filtros</div>
);
export default ProductFilters;
