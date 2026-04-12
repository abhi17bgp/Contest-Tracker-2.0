import React, { useContext, useState } from 'react';
import { Trophy, LogOut, Trash2, AlertTriangle, X, User, ChevronDown, AlignLeft, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import EditProfileModal from './modals/EditProfileModal';
import DeleteAccountModal from './modals/DeleteAccountModal';

const Header = () => {
  const { user, setUser, logout, API_URL } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md relative">
      {/* Main Header Row — always single row */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Trophy className="w-9 h-9 sm:w-11 sm:h-11 mr-2 text-yellow-300 flex-shrink-0" />
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Contest Tracker</h1>
        </div>
        
        {user && (
          <>
            {/* Desktop: Theme Toggle & User Dropdown */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center bg-white/10 hover:bg-white/25 border border-white/30 rounded-lg w-10 h-10 transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-indigo-100" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="flex items-center bg-white/10 hover:bg-white/25 border border-white/30 rounded-lg pl-4 pr-3 py-2 transition-all duration-200 text-sm font-medium"
                >
                  <span className="flex items-center mr-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Hi, {user.name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSettingsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 mb-1">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Account Settings</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsEditModalOpen(true);
                          setIsSettingsOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3 text-blue-500 dark:text-blue-400" />
                        Edit Profile
                      </button>

                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setIsSettingsOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                      >
                        <Trash2 className="w-4 h-4 mr-3" />
                        Delete Account
                      </button>

                      <div className="border-t border-gray-100 dark:border-slate-700 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile: Hamburger Button */}
            <div className="sm:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="flex items-center bg-white/10 hover:bg-white/25 border border-white/30 rounded-lg p-2 transition-all"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-indigo-100" />}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center bg-white/10 hover:bg-white/25 border border-white/30 rounded-lg p-2 transition-all"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Slide-Down Menu */}
      {isMobileMenuOpen && user && (
        <div className="sm:hidden border-t border-white/20 bg-indigo-800/60 backdrop-blur-sm">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-semibold truncate">{user.name || user.email}</span>
            </div>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                setIsEditModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              <User className="w-4 h-4 mr-3 text-blue-200" />
              Edit Profile
            </button>
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-red-300 hover:bg-white/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Delete Account
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3 text-blue-200" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

      {/* Delete Account Modal */}
      <DeleteAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Header;