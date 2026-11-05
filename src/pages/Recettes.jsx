import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Calendar, User, CreditCard } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Table } from '../components/common/Table.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { recetteService } from '../services/recetteService.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export const Recettes = () => {
  const [recettes, setRecettes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecettes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await recetteService.getRecettes({ page, limit });
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setRecettes(items);
      setTotal(response.total || items.length);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des recettes');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRecettes();
  }, [fetchRecettes]);

  const columns = [
    {
      header: 'Prestation',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">
              {r.type_prestation || 'Prestation de transport'}
            </p>
            <span className="text-xs text-slate-500 font-mono">
              Réf: {r.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Montant encaissé',
      render: (r) => (
        <span className="font-bold text-emerald-600 text-sm">
          + {formatCurrency(r.montant)}
        </span>
      ),
    },
    {
      header: 'Date de recette',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(r.date_recette)}</span>
        </div>
      ),
    },
    {
      header: 'Paiement associé',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono">
            {r.paiement_id ? `Paiement #${r.paiement_id.slice(0, 8)}` : 'Automatique'}
          </span>
        </div>
      ),
    },
    {
      header: 'Agent / Utilisateur',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{r.user?.nom_utilisateur || 'Système'}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal des Recettes"
        subtitle="Historique en lecture seule de toutes les recettes générées automatiquement par les encaissements."
      />

      {error && <Alert type="danger" message={error} />}

      {loading ? (
        <Loader message="Chargement des recettes..." />
      ) : (
        <div className="space-y-2">
          <Table
            columns={columns}
            data={recettes}
            emptyMessage="Aucune recette enregistrée dans le système."
          />
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={limit}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};
