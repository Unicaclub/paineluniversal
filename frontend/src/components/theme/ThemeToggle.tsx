import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { useUIStore } from '../../stores/uiStore';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      title={`Trocar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};
