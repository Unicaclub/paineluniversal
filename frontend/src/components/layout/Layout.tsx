import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay para mobile quando sidebar está aberta */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-6"
          >
            <div className="max-w-7xl mx-auto">
              {children || <Outlet />}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;