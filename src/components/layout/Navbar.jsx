import React, { useState, useEffect } from 'react';
import { Menu, LogOut, User as UserIcon, Shield, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_LABELS, ROLES } from '../../utils/constants.js';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const formatted = now.toLocaleDateString('fr-FR', options);
      // Capitalize first letter
      setCurrentDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));
    };
    updateTime();
  }, []);

  const roleLibelle =
    typeof user?.role === 'object' ? user?.role?.libelle : user?.role;
  const roleDisplay = ROLE_LABELS[roleLibelle] || roleLibelle || 'Utilisateur';

  // Role pill color
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case ROLES.ADMINISTRATEUR:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case ROLES.RESPONSABLE:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ROLES.AGENT:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case ROLES.COMPTABLE_CAISSIER:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all">
      {/* Left section: mobile hamburger & live date/app badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Date Display */}
        {currentDate && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentDate}</span>
          </div>
        )}

        {/* Live Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Système opérationnel</span>
        </div>
      </div>

      {/* Right section: user profile & logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-blue-500/20 ring-2 ring-blue-100">
            {user?.nom_utilisateur ? user.nom_utilisateur.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {user?.nom_utilisateur || user?.login || 'Utilisateur'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(roleLibelle)}`}>
                {roleDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          title="Se déconnecter de l'application"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
