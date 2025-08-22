import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  icon?: LucideIcon;
  tooltip?: string;
  color?: string;
  size?: string;
}
const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, icon: Icon, tooltip, color, size }) => (
  <button onClick={onClick} title={tooltip} style={{ color }} className={size}>
    {Icon && <Icon size={16} />}
    {children}
  </button>
);
export default ActionButton;
