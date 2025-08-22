import React from 'react';

interface BulkActionsProps {
  selectedCount?: number;
  onBulkDelete?: () => void;
  onBulkEnable?: () => void;
  onBulkDisable?: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({ selectedCount = 0 }) => (
  <div>Ações em massa ({selectedCount} selecionados)</div>
);
export default BulkActions;
