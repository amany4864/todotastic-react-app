
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      {user && (
        <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-400 mr-3" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TodoApp
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
