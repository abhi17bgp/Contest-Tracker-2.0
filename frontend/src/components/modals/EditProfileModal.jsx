import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X, User, AlignLeft } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser, API_URL } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', 
    bio: user?.bio || '' 
  });
  const [isSaving, setIsSaving] = useState(false);

  // Sync profile data if user changes/modal opens
  useEffect(() => {
    if (isOpen) {
      setProfileData({ name: user?.name || '', bio: user?.bio || '' });
    }
  }, [isOpen, user]);

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
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Personalize your public profile</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {/* Email */}
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

            {/* Display Name */}
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

            {/* Bio */}
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
                onClick={onClose}
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
  );
};

export default EditProfileModal;
