import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, CreditCard, Calendar, User, Filter, X } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { PaiementModal } from '../components/paiements/PaiementModal.jsx';
import { paiementService } from '../services/paiementService.js';
import { activiteService } from '../services/activiteService.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES, MODE_PAIEMENT_LABELS } from '../utils/constants.js';

export const Paiements = () => {
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activiteIdParam = searchParams.get('activite_id');

  const [paiements, setPaiements] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activites, setActivites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedActiviteId, setPreselectedActiviteId] = useState(activiteIdParam);
  const [isDeleting, setIsDeleting] = useState(false);
  const [paiementToDelete, setPaiementToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (activiteIdParam) {
      setPreselectedActiviteId(activiteIdParam);
      setIsModalOpen(true);
    }
  }, [activiteIdParam]);

  const fetchPaiements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await paiementService.getPaiements({ page, limit });
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setPaiements(items);
      setTotal(response.total || items.length);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchActivites = async () => {
    try {
      const res = await activiteService.getActivites({ page: 1, limit: 100 });
      setActivites(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchPaiements();
    fetchActivites();
  }, [fetchPaiements]);

  const handleSavePaiement = async (formData) => {
    setModalLoading(true);
    try {
      await paiementService.createPaiement(formData);
      setSuccessMsg('Paiement enregistré avec succès (Recette et Caisse synchronisées)');
      fetchPaiements();
      fetchActivites();
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeletePaiement = async () => {
    if (!paiementToDelete) return;
    setIsDeleting(true);
    try {
      await paiementService.deletePaiement(paiementToDelete.id);
      setSuccessMsg('Paiement annulé et supprimé avec succès');
      setPaiementToDelete(null);
      fetchPaiements();
      fetchActivites();
    } catch (err) {
      setError(err.message || 'Impossible d\'annuler ce paiement');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Montant encaissé',
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-base">
              {formatCurrency(p.montant)}
            </p>
            <span className="text-xs text-slate-500 font-mono">
              ID: {p.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Mode & Référence',
      render: (p) => (
        <div>
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
            {MODE_PAIEMENT_LABELS[p.mode_paiement] || p.mode_paiement || 'Espèces'}
          </span>
          {p.reference && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Réf: {p.reference}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Date de versement',
      render: (p) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(p.date_paiement)}</span>
        </div>
      ),
    },
    {
      header: 'Activité associée',
      render: (p) => (
        <div className="text-xs text-slate-700">
          <p className="font-semibold text-slate-800">
            {p.activite?.type_prestation?.libelle || 'Prestation'}
          </p>
          <span className="text-slate-500 font-mono">
            Activité: {p.activite_id ? p.activite_id.slice(0, 8) + '...' : '-'}
          </span>
        </div>
      ),
    },
    {
      header: 'Enregistré par',
      render: (p) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{p.created_by?.nom_utilisateur || 'Admin'}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <button
              type="button"
              onClick={() => setPaiementToDelete(p)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Supprimer / Annuler paiement"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements & Encaissements"
        subtitle="Historique des versements clients, avances et règlements de solde."
        action={
          hasRole([
            ROLES.ADMINISTRATEUR,
            ROLES.RESPONSABLE,
            ROLES.COMPTABLE_CAISSIER,
            ROLES.AGENT,
          ]) && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Nouveau paiement
            </Button>
          )
        }
      />

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

      {activiteIdParam && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Affichage des versements pour l'activité :{' '}
              <strong className="font-mono font-bold">{activiteIdParam}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchParams({});
              setPreselectedActiviteId(null);
            }}
            className="flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-950 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Voir tous les paiements
          </button>
        </div>
      )}

      {loading ? (
        <Loader message="Chargement des paiements..." />
      ) : (
        <div className="space-y-2">
          <Table
            columns={columns}
            data={
              activiteIdParam
                ? paiements.filter((p) => p.activite_id === activiteIdParam)
                : paiements
            }
            emptyMessage={
              activiteIdParam
                ? "Aucun paiement enregistré pour cette activité spécifique."
                : "Aucun paiement enregistré pour le moment."
            }
          />
          <Pagination
            currentPage={page}
            totalItems={
              activiteIdParam
                ? paiements.filter((p) => p.activite_id === activiteIdParam).length
                : total
            }
            pageSize={limit}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      <PaiementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSavePaiement}
        activites={activites}
        initialActiviteId={preselectedActiviteId}
        loading={modalLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(paiementToDelete)}
        onClose={() => setPaiementToDelete(null)}
        onConfirm={handleDeletePaiement}
        title="Annuler le versement"
        message={`Êtes-vous certain de vouloir annuler ce paiement de ${formatCurrency(
          paiementToDelete?.montant,
        )} ? Le reste à payer de l'activité sera réajusté.`}
        loading={isDeleting}
      />
    </div>
  );
};
