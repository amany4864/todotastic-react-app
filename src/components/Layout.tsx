
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, BarChart3, Home, Menu, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mr-2 sm:mr-3" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Planner
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50"
                  >
                    <Home className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium">Your Tasks</span>
                  </Link>
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-700/50"
                  >
                    <User className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium">
                      {user.username || user.email.split('@')[0]}
                    </span>
                  </button>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700/50">
              <div className="flex flex-col space-y-2">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors px-3 py-3 rounded-lg hover:bg-gray-700/50"
                    >
                      <Home className="w-5 h-5 text-blue-400" />
                      <span className="font-medium">Your Tasks</span>
                    </Link>
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors px-3 py-3 rounded-lg hover:bg-gray-700/50 w-full text-left"
                    >
                      <User className="w-5 h-5 text-blue-400" />
                      <span className="font-medium">
                        {user.username || user.email.split('@')[0]}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors px-3 py-3 rounded-lg hover:bg-gray-700/50 w-full text-left"
                    >
                      <LogOut className="w-5 h-5 text-blue-400" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
