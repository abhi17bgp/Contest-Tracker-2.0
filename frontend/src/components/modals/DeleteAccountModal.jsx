import React, { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { API_URL, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/auth/delete-account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Account deleted successfully.");
      onClose();
      logout();
      navigate('/login');
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
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
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 sm:py-4 rounded-2xl transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
