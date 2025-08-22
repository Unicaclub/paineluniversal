import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
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
  Package
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, setSidebarCollapsed } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({
    'Produtos': location.pathname.startsWith('/app/produtos')
  });

  // Auto-expandir menu produtos quando navegar para a seção
  React.useEffect(() => {
    if (location.pathname.startsWith('/app/produtos')) {
      setExpandedMenus(prev => ({
        ...prev,
        'Produtos': true
      }));
    }
  }, [location.pathname]);

  const toggleSubmenu = (menuLabel: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuLabel]: !prev[menuLabel]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      icon: BarChart3, 
      label: 'Dashboard', 
      path: '/app/dashboard', 
      roles: ['admin', 'promoter', 'cliente'],
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
      roles: ['admin', 'promoter', 'cliente'],
      description: 'Sistema de vendas'
    },
    { 
      icon: UserCheck, 
      label: 'Check-in Inteligente', 
      path: '/app/checkin', 
      roles: ['admin', 'promoter', 'cliente'],
      description: 'Check-in de participantes'
    },
    { 
      icon: Smartphone, 
      label: 'Check-in Mobile', 
      path: '/app/mobile-checkin', 
      roles: ['admin', 'promoter', 'cliente'],
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

  const filteredMenuItems = user && user.tipo 
    ? menuItems.filter(item => item.roles.includes(user.tipo))
    : menuItems; // Show all items if user not loaded

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'US';
  };

  return (
    <aside 
      className={`
        ${sidebarCollapsed ? 'w-16' : 'w-64'} 
        bg-sidebar border-r border-sidebar-border shadow-xl
        transition-all duration-300 ease-in-out 
        flex flex-col shrink-0
        fixed inset-y-0 left-0 z-50 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3"
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
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
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
                  <button
                    onClick={() => {
                      if (item.hasSubmenu) {
                        toggleSubmenu(item.label);
                        if (!isExpanded) {
                          // Apenas expande o menu
                        } else {
                          // Se já está expandido, navega para a página principal
                          navigate(item.path);
                        }
                      } else {
                        navigate(item.path);
                      }
                      setSidebarOpen(false);
                    }}
                    className={`
                      group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden
                      ${isActive 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
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
                          className="flex-1 min-w-0 text-left"
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
                  </button>
                </motion.div>
                
                {/* Submenu */}
                <AnimatePresence>
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
                          <button
                            key={subItem.path}
                            onClick={() => {
                              navigate(subItem.path);
                              setSidebarOpen(false);
                            }}
                            className={`
                              w-full text-left py-2 px-3 text-sm rounded-md transition-colors
                              ${isSubActive
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                              }
                            `}
                          >
                            <div className="truncate">{subItem.label}</div>
                            <div className="text-xs opacity-60 truncate mt-0.5">
                              {subItem.description}
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    {getInitials(user?.nome || '')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.nome || 'Usuário'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {user?.tipo || 'cliente'}
                    </Badge>
                  </div>
                </div>
                
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm text-muted-foreground">
                  {user?.email || ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sistema Universal de Eventos
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
  );
};

export default Sidebar;
