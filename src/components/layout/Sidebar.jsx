import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  UserSquare2,
  CalendarCheck2,
  CreditCard,
  Receipt,
  PiggyBank,
  TrendingUp,
  Settings2,
  Tag,
  ShieldCheck,
  Truck,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

export const Sidebar = ({ onClose }) => {
  const { hasRole } = useAuth();

  const navSections = [
    {
      title: 'PRINCIPAL',
      items: [
        {
          label: 'Tableau de bord',
          path: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'Activités & courses',
          path: '/activites',
          icon: CalendarCheck2,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.AGENT],
        },
      ],
    },
    {
      title: 'RESSOURCES',
      roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.AGENT],
      items: [
        {
          label: 'Clients',
          path: '/clients',
          icon: Users,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.AGENT],
        },
        {
          label: 'Véhicules',
          path: '/vehicules',
          icon: Car,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE],
        },
        {
          label: 'Chauffeurs',
          path: '/chauffeurs',
          icon: UserSquare2,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE],
        },
      ],
    },
    {
      title: 'FINANCES & CAISSE',
      items: [
        {
          label: 'Paiements clients',
          path: '/paiements',
          icon: CreditCard,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.COMPTABLE_CAISSIER, ROLES.AGENT],
        },
        {
          label: 'Dépenses',
          path: '/depenses',
          icon: Receipt,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.COMPTABLE_CAISSIER],
        },
        {
          label: 'Recettes',
          path: '/recettes',
          icon: TrendingUp,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.COMPTABLE_CAISSIER],
        },
        {
          label: 'Caisse & solde',
          path: '/caisse',
          icon: PiggyBank,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.COMPTABLE_CAISSIER],
        },
      ],
    },
    {
      title: 'ANALYSES & RAPPORTS',
      roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.COMPTABLE_CAISSIER],
      items: [
        {
          label: 'Rapports & Exports',
          path: '/rapports',
          icon: FileText,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.COMPTABLE_CAISSIER],
        },
      ],
    },
    {
      title: 'PARAMÈTRES',
      roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.COMPTABLE_CAISSIER],
      items: [
        {
          label: 'Types de prestations',
          path: '/types-prestations',
          icon: Tag,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE],
        },
        {
          label: 'Catégories dépenses',
          path: '/categories-depenses',
          icon: Settings2,
          roles: [ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.COMPTABLE_CAISSIER],
        },
        {
          label: 'Utilisateurs',
          path: '/users',
          icon: ShieldCheck,
          roles: [ROLES.ADMINISTRATEUR],
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0c1222] text-slate-300 flex flex-col h-full shrink-0 select-none border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-white tracking-tight leading-none">Mendrika</h2>
            <span className="text-[10px] font-bold text-cyan-400">PRO</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider mt-1 uppercase">
            TRANSPORT &amp; LOGISTIQUE
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {navSections.map((section, sIdx) => {
          if (section.roles && !hasRole(section.roles)) return null;

          const visibleItems = section.items.filter(
            (item) => !item.roles || hasRole(item.roles),
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title || sIdx} className="space-y-1">
              {section.title && (
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#2f54eb] text-white font-semibold shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60 bg-[#090d18] text-xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ANALYSES &amp; RAPPORTS</p>
          <p className="text-[11px] font-medium text-slate-300 mt-0.5">V2.0 Pro</p>
        </div>
        <span className="text-xs font-bold text-cyan-400 tracking-wider">
          ITDCMADA
        </span>
      </div>
    </aside>
  );
};
