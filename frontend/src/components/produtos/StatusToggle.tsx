import React from 'react';
interface StatusToggleProps {
  checked?: boolean; // Tornar opcional para aceitar undefined
  onChange: (checked: boolean) => void;
  color?: string;
  size?: string;
}
const StatusToggle: React.FC<StatusToggleProps> = ({ checked = false, onChange, color: _color, size: _size }) => (
  <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
);
export default StatusToggle;
