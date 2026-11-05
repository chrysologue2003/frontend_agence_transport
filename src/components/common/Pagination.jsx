import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';

export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 sm:px-6 rounded-b-xl">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-600">
            Affichage de{' '}
            <span className="font-semibold text-slate-900">
              {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
            </span>{' '}
            à{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{' '}
            sur{' '}
            <span className="font-semibold text-slate-900">{totalItems}</span>{' '}
            résultats
          </p>
        </div>
        <div>
          <nav className="inline-flex gap-1 rounded-md shadow-xs" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              icon={ChevronLeft}
            >
              Précédent
            </Button>
            <div className="flex items-center px-3 text-sm font-medium text-slate-700">
              Page {currentPage} sur {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              icon={ChevronRight}
            >
              Suivant
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};
