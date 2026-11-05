import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  loading = false,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-gradient-to-tr from-blue-50 to-blue-100/80 text-blue-600',
      border: 'border-blue-100',
      accent: 'bg-blue-500',
      shadow: 'shadow-blue-500/10',
    },
    emerald: {
      bg: 'bg-gradient-to-tr from-emerald-50 to-emerald-100/80 text-emerald-600',
      border: 'border-emerald-100',
      accent: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/10',
    },
    amber: {
      bg: 'bg-gradient-to-tr from-amber-50 to-amber-100/80 text-amber-600',
      border: 'border-amber-100',
      accent: 'bg-amber-500',
      shadow: 'shadow-amber-500/10',
    },
    indigo: {
      bg: 'bg-gradient-to-tr from-indigo-50 to-indigo-100/80 text-indigo-600',
      border: 'border-indigo-100',
      accent: 'bg-indigo-500',
      shadow: 'shadow-indigo-500/10',
    },
    rose: {
      bg: 'bg-gradient-to-tr from-rose-50 to-rose-100/80 text-rose-600',
      border: 'border-rose-100',
      accent: 'bg-rose-500',
      shadow: 'shadow-rose-500/10',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 hover:shadow-lg ${scheme.shadow} hover:-translate-y-0.5 relative overflow-hidden group`}>
      {/* Decorative top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.accent} opacity-80 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {title}
          </p>
          {loading ? (
            <div className="h-7 w-28 bg-slate-100 animate-pulse rounded-md mt-2" />
          ) : (
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight truncate">
              {value}
            </h4>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 truncate font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${scheme.bg} ${scheme.border} border shrink-0 shadow-xs transition-transform group-hover:scale-105 duration-200`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span className={trend.positive ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
            {trend.value}
          </span>
          <span className="text-slate-400 font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  );
};
