import React, { useContext, useState } from 'react';
import { Trophy, LogOut, Trash2, AlertTriangle, X, User, ChevronDown, AlignLeft, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Header = () => {
  const { user, setUser, logout, API_URL } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', 
    bio: user?.bio || '' 
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/auth/delete-account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Account deleted successfully.");
      setIsModalOpen(false);
      logout();
      navigate('/login');
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setUser(res.data.user);
        setIsEditModalOpen(false);
        setIsSettingsOpen(false);
        setIsMobileMenuOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
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
                          setProfileData({ name: user.name, bio: user.bio || '' });
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
                setProfileData({ name: user.name, bio: user.bio || '' });
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
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Personalize your public profile</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Email — read-only, shown for account identification */}
                <div>
                  <label className="block text-gray-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1 flex justify-between">
                    Email <span className="text-gray-400 dark:text-slate-500 font-normal normal-case italic">Cannot be changed</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-400 dark:text-slate-500 font-medium cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Display Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1 flex justify-between">
                    Bio <span className="text-gray-400 dark:text-slate-500 font-normal normal-case italic">(Optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-4 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                      <AlignLeft className="w-5 h-5" />
                    </div>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows="4"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 outline-none transition-all resize-none font-medium text-gray-900 dark:text-white"
                      placeholder="Tell the community a bit about yourself..."
                    />
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="w-full bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 sm:py-4 rounded-2xl transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 dark:shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-5 sm:mb-6">
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Delete Account?
              </h3>
              
              <p className="text-gray-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-6 sm:mb-8">
                This action is permanent and will remove all your data. Are you sure you want to proceed?
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={confirmDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 sm:py-4 rounded-2xl transition-all shadow-xl shadow-red-600/20 dark:shadow-red-900/20 active:scale-95"
                >
                  Yes, delete my account
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 sm:py-4 rounded-2xl transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;