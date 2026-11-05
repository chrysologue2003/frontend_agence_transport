import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  title = 'Aucune donnée disponible',
  description = 'Il n\'y a actuellement aucun élément à afficher.',
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-200 ${className}`}
    >
      <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
