import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Define routes that should not show the authenticated layout
  const publicRoutes = ['/', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Show loading state if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-intel-darkgray flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-intel-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // For public routes or when user is not authenticated, show minimal layout
  if (!user || isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-intel-darkgray">
        {children}
      </div>
    );
  }

  // For authenticated users on protected routes, show full layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-intel-darkgray flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showSidebarToggle={true}
        />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;