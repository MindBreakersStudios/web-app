import React, { useState } from 'react';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { user, signOut, loading, isAdmin } = useAuth();

  // Debug logging
  React.useEffect(() => {
    console.log('[HEADER] Auth state:', { user: user?.email, loading, isAdmin });
  }, [user, loading, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src="/Logo-35.png" alt="MindBreakers Logo" className="h-10 md:h-12" />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Home
          </Link>
          <div className="relative group">
            <button className="flex items-center text-gray-300 hover:text-white transition">
              Servers <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <Link
                to="/humanitz"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                Humanitz
              </Link>
              <Link
                to="/scum"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                SCUM
              </Link>
            </div>
          </div>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-gray-300 hover:text-white transition"
          >
            Features
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-gray-300 hover:text-white transition"
          >
            About
          </a>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          {loading ? (
            <div className="flex items-center space-x-2 bg-gray-800 text-gray-400 px-4 py-2 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-400"></div>
              <span>Loading...</span>
            </div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition"
              >
                <User className="h-4 w-4" />
                <span>{user.email}</span>
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-bold">
                    ADMIN
                  </span>
                )}
                <ChevronDown className="h-4 w-4" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/profile"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Profile & Settings
                  </Link>
                  <Link
                    to="/knowledge-base"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 font-medium"
                  >
                    Knowledge Base
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <LogOut className="inline h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition" 
              onClick={() => setIsLoginModalOpen(true)}
            >
              Login
            </button>
          )}
        </div>
        
        {/* Mobile menu button and language switcher */}
        <div className="md:hidden flex items-center space-x-2">
          <LanguageSwitcher />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            <Link 
              to="/" 
              className="block py-2 text-blue-400 hover:text-blue-300" 
              onClick={() => {
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Home
            </Link>
            <Link
              to="/humanitz"
              className="block py-2 text-gray-300 hover:text-white"
              onClick={() => {
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Humanitz Server
            </Link>
            <Link
              to="/scum"
              className="block py-2 text-gray-300 hover:text-white"
              onClick={() => {
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              SCUM Server
            </Link>
            <a
              href="#features"
              className="block py-2 text-gray-300 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Features
            </a>
            <a
              href="#about"
              className="block py-2 text-gray-300 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              About
            </a>
            
            {loading ? (
              <div className="pt-2 border-t border-gray-700 text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-400"></div>
                  <span>Loading auth...</span>
                </div>
              </div>
            ) : user ? (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-gray-300 text-sm mb-2">Signed in as: {user.email}</div>
                  <button 
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition w-full"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="inline h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition w-full mt-2" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                >
                  Login
                </button>
              )
            }
          </div>
        </div>
      )}
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};