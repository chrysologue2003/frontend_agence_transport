import React from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar.jsx';

export const MobileMenu = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-900 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onClose={onClose} />
      </div>
    </div>
  );
};
