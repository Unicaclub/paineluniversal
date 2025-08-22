import { create } from 'zustand';
import type { ThemeMode, Notification } from '../types';

interface UIState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  loading: Record<string, boolean>;
  modals: Record<string, boolean>;
}

interface UIActions {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (key: string, loading: boolean) => void;
  openModal: (key: string) => void;
  closeModal: (key: string) => void;
  toggleModal: (key: string) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
  // Estado inicial
  theme: 'dark',
  sidebarOpen: false,
  sidebarCollapsed: false,
  notifications: [],
  loading: {},
  modals: {},

  // Ações
  setTheme: (theme: ThemeMode) => {
    set({ theme });
    
    // Aplicar tema ao documento
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Salvar preferência
    localStorage.setItem('theme', theme);
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },

  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto-remover após duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setLoading: (key: string, loading: boolean) => {
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: loading
      }
    }));
  },

  openModal: (key: string) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [key]: true
      }
    }));
  },

  closeModal: (key: string) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [key]: false
      }
    }));
  },

  toggleModal: (key: string) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [key]: !state.modals[key]
      }
    }));
  }
}));

// Hook para notificações com tipos pré-definidos
export const useNotifications = () => {
  const { addNotification, removeNotification, clearNotifications, notifications } = useUIStore();

  const success = (title: string, message: string) => {
    addNotification({
      type: 'success',
      title,
      message
    });
  };

  const error = (title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 0 // Não auto-remover erros
    });
  };

  const warning = (title: string, message: string) => {
    addNotification({
      type: 'warning',
      title,
      message
    });
  };

  const info = (title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message
    });
  };

  return {
    notifications,
    success,
    error,
    warning,
    info,
    remove: removeNotification,
    clear: clearNotifications
  };
};
