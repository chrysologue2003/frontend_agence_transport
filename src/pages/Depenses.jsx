import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Receipt, Calendar, Car, Tag } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { DepenseModal } from '../components/depenses/DepenseModal.jsx';
import { depenseService } from '../services/depenseService.js';
import { categorieDepenseService } from '../services/categorieDepenseService.js';
import { vehiculeService } from '../services/vehiculeService.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES, MODE_PAIEMENT_LABELS } from '../utils/constants.js';

export const Depenses = () => {
  const { hasRole } = useAuth();
  const [depenses, setDepenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [categories, setCategories] = useState([]);
  const [vehicules, setVehicules] = useState([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [depenseToDelete, setDepenseToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchDepenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await depenseService.getDepenses({ page, limit });
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setDepenses(items);
      setTotal(response.total || items.length);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des dépenses');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchDropdowns = async () => {
    try {
      const [catRes, vehRes] = await Promise.all([
        categorieDepenseService.getCategories().catch(() => ({ data: [] })),
        vehiculeService.getVehicules({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : Array.isArray(catRes) ? catRes : []);
      setVehicules(Array.isArray(vehRes.data) ? vehRes.data : Array.isArray(vehRes) ? vehRes : []);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchDepenses();
    fetchDropdowns();
  }, [fetchDepenses]);

  const handleSaveDepense = async (formData) => {
    setModalLoading(true);
    try {
      await depenseService.createDepense(formData);
      setSuccessMsg('Dépense enregistrée avec succès (Mouvement de Caisse débité)');
      fetchDepenses();
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteDepense = async () => {
    if (!depenseToDelete) return;
    setIsDeleting(true);
    try {
      await depenseService.deleteDepense(depenseToDelete.id);
      setSuccessMsg('Dépense supprimée avec succès');
      setDepenseToDelete(null);
      fetchDepenses();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer cette dépense');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Description et catégorie',
      render: (d) => (
        <div>
          <p className="font-bold text-slate-900 text-sm">{d.description}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Tag className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {d.categorie?.libelle || 'Dépense'}
              {d.fournisseur ? ` · ${d.fournisseur}` : ''}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Montant décaissé (Ar)',
      render: (d) => (
        <span className="font-bold text-rose-600 text-sm sm:text-base">
          – {formatCurrency(d.montant)}
        </span>
      ),
    },
    {
      header: 'Date',
      render: (d) => (
        <span className="text-xs text-slate-700 font-medium">
          {formatDate(d.date_depense)}
        </span>
      ),
    },
    {
      header: 'Véhicule concerné',
      render: (d) => (
        <div className="text-xs text-slate-700">
          {d.immatriculation ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <Car className="w-3.5 h-3.5 text-slate-500" />
              <span>{d.immatriculation}</span>
            </span>
          ) : (
            <span className="text-slate-400">Frais généraux</span>
          )}
        </div>
      ),
    },
    {
      header: 'Paiement / référence',
      render: (d) => (
        <div className="text-xs text-slate-700">
          <p className="font-medium text-slate-800">
            {MODE_PAIEMENT_LABELS[d.mode_paiement] || d.mode_paiement || 'Espèces'}
          </p>
          {d.reference && (
            <p className="text-slate-400 font-mono text-[11px] mt-0.5">
              Réf. : {d.reference}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end">
          {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <button
              type="button"
              onClick={() => setDepenseToDelete(d)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
              title="Supprimer la dépense"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dépenses d'exploitation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Suivez l'ensemble des frais engagés : carburant, réparations, péages et charges.
          </p>
        </div>

        {hasRole([
          ROLES.ADMINISTRATEUR,
          ROLES.RESPONSABLE,
          ROLES.COMPTABLE_CAISSIER,
        ]) && (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2f54eb] hover:bg-blue-700 text-white font-medium rounded-xl px-5 py-2.5 shadow-xs"
          >
            Nouvelle dépense
          </Button>
        )}
      </div>

      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg('')}
        />
      )}
      {error && (
        <Alert
          type="danger"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {loading ? (
        <Loader message="Chargement des dépenses..." />
      ) : (
        <div className="space-y-2">
          <Table
            columns={columns}
            data={depenses}
            emptyMessage="Aucune dépense enregistrée."
          />
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={limit}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      <DepenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveDepense}
        categories={categories}
        vehicules={vehicules}
        loading={modalLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(depenseToDelete)}
        onClose={() => setDepenseToDelete(null)}
        onConfirm={handleDeleteDepense}
        title="Supprimer la dépense"
        message={`Êtes-vous certain de vouloir supprimer cette dépense de ${formatCurrency(
          depenseToDelete?.montant,
        )} (${depenseToDelete?.description}) ?`}
        loading={isDeleting}
      />
    </div>
  );
};
