import React, { useState } from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  lang: Language;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, lang }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  if (!isOpen) return null;
  
  const t = translations[lang];

  const handleConfirm = () => {
    const appPassword = (import.meta as any).env?.VITE_APP_PASSWORD;
    if (password === appPassword) {
        onConfirm();
        setPassword('');
        setError(false);
        onClose();
    } else {
        setError(true);
    }
  };

  const handleClose = () => {
      setPassword('');
      setError(false);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title || t.delete_title}</h3>
          <p className="text-slate-500 text-sm mb-6">{message || t.delete_message}</p>
          
          <div className="mb-6 text-left">
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Lock size={12} />
                {t.enter_password}
            </label>
            <input 
                type="password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                }}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 ${error ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                placeholder="********"
            />
            {error && <p className="text-xs text-red-500 mt-1">{t.add_password_error}</p>}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              {t.cancel_btn}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md shadow-red-200 transition-colors"
            >
              {t.delete_btn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};