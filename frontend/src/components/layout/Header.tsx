import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Bell, Menu, Search } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';

const Header: React.FC = () => {
  const { setSidebarOpen, addNotification } = useUIStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    addNotification({
      title: "Busca",
      message: `Buscando por: ${searchTerm}`,
      type: "info"
    });
    // TODO: Implementar funcionalidade de busca global
  };

  const handleNotifications = () => {
    addNotification({
      title: "Notificações",
      message: "Você tem 3 notificações não lidas",
      type: "info"
    });
    // TODO: Implementar painel de notificações
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <form onSubmit={handleSearch} className="hidden sm:flex items-center space-x-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-muted/50 border-0 focus:bg-background"
              />
            </div>
          </form>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative" 
            onClick={handleNotifications}
            title="Ver notificações"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
              3
            </span>
          </Button>
          
          <ThemeToggle />
          
          <div className="hidden sm:block text-sm text-muted-foreground">
            Sistema Universal de Eventos
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
