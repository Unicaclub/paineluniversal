import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useToast } from '../../hooks/use-toast';
import { 
  Calendar, 
  Users, 
  Building2, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  ShoppingCart,
  UserCheck,
  Smartphone,
  DollarSign,
  Trophy,
  ChevronDown,
  Bell,
  Search,
  Package
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotifications = () => {
    toast({
      title: "Notificações",
      description: "Você tem 3 notificações não lidas",
      duration: 3000,
    });
    // TODO: Implementar painel de notificações
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    toast({
      title: "Busca",
      description: `Buscando por: ${searchTerm}`,
      duration: 2000,
    });
    // TODO: Implementar funcionalidade de busca global
  };

  const toggleSubmenu = (menuLabel: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuLabel]: !prev[menuLabel]
    }));
  };

  const menuItems = [
    { 
      icon: BarChart3, 
      label: 'Dashboard', 
      path: '/app/dashboard', 
      roles: ['admin', 'promoter', 'operador'],
      description: 'Visão geral do sistema'
    },
    { 
      icon: Calendar, 
      label: 'Eventos', 
      path: '/app/eventos', 
      roles: ['admin', 'promoter'],
      description: 'Gerenciar eventos'
    },
    { 
      icon: ShoppingCart, 
      label: 'Vendas', 
      path: '/app/vendas', 
      roles: ['admin', 'promoter', 'operador'],
      description: 'Sistema de vendas'
    },
    { 
      icon: UserCheck, 
      label: 'Check-in Inteligente', 
      path: '/app/checkin', 
      roles: ['admin', 'promoter', 'operador'],
      description: 'Check-in de participantes'
    },
    { 
      icon: Smartphone, 
      label: 'Check-in Mobile', 
      path: '/app/mobile-checkin', 
      roles: ['admin', 'promoter', 'operador'],
      description: 'Check-in via dispositivos móveis'
    },
    { 
      icon: ShoppingCart, 
      label: 'PDV', 
      path: '/app/pdv', 
      roles: ['admin', 'promoter'],
      description: 'Ponto de venda'
    },
    { 
      icon: Users, 
      label: 'Listas & Convidados', 
      path: '/app/listas', 
      roles: ['admin', 'promoter'],
      description: 'Gerenciar listas de convidados'
    },
    { 
      icon: Package, 
      label: 'Produtos', 
      path: '/app/produtos', 
      roles: ['admin', 'promoter'],
      description: 'Gestão completa de produtos',
      hasSubmenu: true,
      submenu: [
        { label: 'Produtos', path: '/app/produtos', description: 'Gestão completa de produtos' },
        { label: 'Categorias', path: '/app/produtos/categorias', description: 'Gestão de categorias de produtos' },
        { label: 'Agendamento', path: '/app/produtos/agendamento', description: 'Agendamento automático de produtos' },
        { label: 'Import/Export', path: '/app/produtos/importexport', description: 'Importar e exportar dados em massa' },
        { label: 'Lista', path: '/app/produtos/lista', description: 'Listas de produtos personalizadas' },
        { label: 'Limitar Acesso', path: '/app/produtos/acesso', description: 'Controle de acesso por função' },
        { label: 'Produtos Ignorados', path: '/app/produtos/ignorados', description: 'Produtos desabilitados' }
      ]
    },
    { 
      icon: Package, 
      label: 'Estoque', 
      path: '/app/estoque', 
      roles: ['admin', 'promoter'],
      description: 'Controle de estoque e inventário'
    },
    { 
      icon: DollarSign, 
      label: 'Caixa & Financeiro', 
      path: '/app/financeiro', 
      roles: ['admin', 'promoter'],
      description: 'Controle financeiro'
    },
    { 
      icon: Trophy, 
      label: 'Ranking & Gamificação', 
      path: '/app/ranking', 
      roles: ['admin', 'promoter'],
      description: 'Sistema de pontuação'
    },
    { 
      icon: Users, 
      label: 'Usuários', 
      path: '/app/usuarios', 
      roles: ['admin'],
      description: 'Gerenciar usuários do sistema'
    },
    { 
      icon: Building2, 
      label: 'Empresas', 
      path: '/app/empresas', 
      roles: ['admin'],
      description: 'Gerenciar empresas'
    },
    { 
      icon: FileText, 
      label: 'Relatórios', 
      path: '/app/relatorios', 
      roles: ['admin', 'promoter'],
      description: 'Relatórios e análises'
    },
    { 
      icon: Settings, 
      label: 'Configurações', 
      path: '/app/configuracoes', 
      roles: ['admin'],
      description: 'Configurações do sistema'
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(usuario?.tipo || '')
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`
          ${sidebarCollapsed ? 'w-20' : 'w-70'} 
          bg-sidebar border-r border-sidebar-border shadow-lg
          fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out 
          flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-heading font-bold text-sidebar-foreground">
                  Sistema Universal
                </h1>
                <p className="text-xs text-sidebar-foreground/60">
                  de Eventos
                </p>
              </div>
            </motion.div>
          )}
          
          <div className="flex items-center space-x-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {filteredMenuItems.map((item) => {
              const isActive = item.hasSubmenu 
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path;
              const isExpanded = expandedMenus[item.label];
              
              return (
                <div key={item.path}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.hasSubmenu ? '#' : item.path}
                      className={`
                        group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden
                        ${isActive 
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-premium-md' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }
                      `}
                      onClick={(e) => {
                        if (item.hasSubmenu) {
                          e.preventDefault();
                          toggleSubmenu(item.label);
                        } else {
                          setSidebarOpen(false);
                        }
                      }}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                          layoutId="activeTab"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      )}
                      
                      <div className="relative z-10 flex items-center flex-1">
                        <item.icon className={`
                          ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 transition-colors
                          ${isActive ? 'text-sidebar-primary-foreground' : 'group-hover:text-primary'}
                        `} />
                        
                        {!sidebarCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 min-w-0"
                          >
                            <div className="truncate">{item.label}</div>
                            {!isActive && (
                              <div className="text-xs opacity-60 truncate mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                      
                      {item.hasSubmenu && !sidebarCollapsed && (
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="relative z-10"
                        >
                          <ChevronDown className={`h-4 w-4 transition-colors ${
                            isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/60'
                          }`} />
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                  
                  {/* Submenu */}
                  {item.hasSubmenu && isExpanded && !sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 mt-1 space-y-1 bg-sidebar-accent/30 rounded-lg p-2"
                    >
                      {item.submenu?.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`
                              block py-2 px-3 text-sm rounded-md transition-colors
                              ${isSubActive
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                              }
                            `}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <div className="truncate">{subItem.label}</div>
                            <div className="text-xs opacity-60 truncate mt-0.5">
                              {subItem.description}
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-sidebar-border"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center w-full p-3 text-sm bg-sidebar-accent rounded-lg hover:bg-sidebar-accent/80 transition-colors group">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(usuario?.nome || '')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {usuario?.nome}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {usuario?.tipo}
                      </Badge>
                    </div>
                  </div>
                  
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm text-muted-foreground">
                    {usuario?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {usuario?.empresa?.nome || `Empresa: ${usuario?.empresa_id}`}
                  </p>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
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
                {usuario?.empresa?.nome || `Empresa: ${usuario?.empresa_id}`}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {children || <Outlet />}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;