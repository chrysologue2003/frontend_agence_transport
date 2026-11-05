import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CalendarCheck2,
  Car,
  UserSquare2,
  Users,
  MapPin,
  Clock,
  Play,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Link2,
  CreditCard,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { ActiviteModal } from '../components/activites/ActiviteModal.jsx';
import { ClientPaymentLinkModal } from '../components/activites/ClientPaymentLinkModal.jsx';
import { PaiementModal } from '../components/paiements/PaiementModal.jsx';
import { activiteService } from '../services/activiteService.js';
import { paiementService } from '../services/paiementService.js';
import { clientService } from '../services/clientService.js';
import { vehiculeService } from '../services/vehiculeService.js';
import { chauffeurService } from '../services/chauffeurService.js';
import { typePrestationService } from '../services/typePrestationService.js';
import {
  formatCurrency,
  formatDate,
  getActiviteStatusBadge,
} from '../utils/formatters.js';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES, STATUT_ACTIVITE } from '../utils/constants.js';

export const Activites = () => {
  const { hasRole } = useAuth();
  const [activites, setActivites] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown relations
  const [clients, setClients] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [typesPrestations, setTypesPrestations] = useState([]);

  // Modal & Actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivite, setSelectedActivite] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activiteToDelete, setActiviteToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Lien de Paiement Client & Encaissement Rapide
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);
  const [paymentLinkActivite, setPaymentLinkActivite] = useState(null);
  const [isQuickPayModalOpen, setIsQuickPayModalOpen] = useState(false);
  const [quickPayActivite, setQuickPayActivite] = useState(null);
  const [quickPayLoading, setQuickPayLoading] = useState(false);

  const fetchActivites = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await activiteService.getActivites({ page, limit });
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setActivites(items);
      setTotal(response.total || items.length);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des activités');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchDropdownData = async () => {
    try {
      const [cRes, vRes, chRes, tRes] = await Promise.all([
        clientService.getClients({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        vehiculeService.getVehicules({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        chauffeurService.getChauffeurs({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        typePrestationService.getTypesPrestations().catch(() => ({ data: [] })),
      ]);
      setClients(Array.isArray(cRes.data) ? cRes.data : Array.isArray(cRes) ? cRes : []);
      setVehicules(Array.isArray(vRes.data) ? vRes.data : Array.isArray(vRes) ? vRes : []);
      setChauffeurs(Array.isArray(chRes.data) ? chRes.data : Array.isArray(chRes) ? chRes : []);
      setTypesPrestations(Array.isArray(tRes.data) ? tRes.data : Array.isArray(tRes) ? tRes : []);
    } catch {
      // Ignored non-blocking
    }
  };

  useEffect(() => {
    fetchActivites();
    fetchDropdownData();
  }, [fetchActivites]);

  const handleOpenCreate = () => {
    setSelectedActivite(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act) => {
    setSelectedActivite(act);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (act, newStatus) => {
    try {
      await activiteService.updateActivite(act.id, { statut: newStatus });
      setSuccessMsg(`Statut de l'activité mis à jour : ${newStatus}`);
      fetchActivites();
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleSaveActivite = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedActivite) {
        await activiteService.updateActivite(selectedActivite.id, formData);
        setSuccessMsg('Activité mise à jour avec succès');
      } else {
        await activiteService.createActivite(formData);
        setSuccessMsg('Activité créée avec succès (avance enregistrée)');
      }
      fetchActivites();
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteActivite = async () => {
    if (!activiteToDelete) return;
    setIsDeleting(true);
    try {
      await activiteService.deleteActivite(activiteToDelete.id);
      setSuccessMsg('Activité supprimée avec succès');
      setActiviteToDelete(null);
      fetchActivites();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer cette activité');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenPaymentLink = (act) => {
    setPaymentLinkActivite(act);
    setIsPaymentLinkModalOpen(true);
  };

  const handleOpenQuickPay = (act) => {
    setQuickPayActivite(act);
    setIsQuickPayModalOpen(true);
  };

  const handleSaveQuickPay = async (formData) => {
    setQuickPayLoading(true);
    try {
      await paiementService.createPaiement(formData);
      setSuccessMsg(
        'Paiement client enregistré avec succès ! Le solde restant et la caisse sont actualisés.',
      );
      setIsQuickPayModalOpen(false);
      setQuickPayActivite(null);
      fetchActivites();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement du paiement");
    } finally {
      setQuickPayLoading(false);
    }
  };

  const columns = [
    {
      header: 'Prestation & Client',
      render: (act) => (
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <CalendarCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{act.type_prestation?.libelle || act.type_prestation_code || 'Prestation'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{act.client?.nom} {act.client?.prenom || ''}</span>
          </div>
          {act.destination && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{act.destination}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Affectations',
      render: (act) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Car className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono font-medium">
              {act.immatriculation || act.vehicule?.immatriculation || 'Non affecté'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <UserSquare2 className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {act.chauffeur
                ? `${act.chauffeur.nom} ${act.chauffeur.prenom || ''}`
                : act.matricule_chauffeur || 'Non affecté'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      render: (act) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(act.date_activite)}</span>
        </div>
      ),
    },
    {
      header: 'Montants & Règlement',
      render: (act) => {
        const reste = Number(act.reste_a_payer) || 0;
        const isSolde = reste <= 0;
        return (
          <div className="text-xs space-y-1.5 min-w-[170px]">
            <div>
              <p className="font-bold text-slate-900">{formatCurrency(act.prix)}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-emerald-600 font-medium text-[11px]">
                  Avance: {formatCurrency(act.avance)}
                </span>
                <span
                  className={`font-semibold text-[11px] ${
                    isSolde ? 'text-slate-500' : 'text-rose-600'
                  }`}
                >
                  Reste: {formatCurrency(reste)}
                </span>
              </div>
            </div>

            {/* Boutons de lien de paiement et encaissement client */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleOpenPaymentLink(act)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                title="Lien de paiement du client (copier / partager / reçu)"
              >
                <Link2 className="w-3 h-3" /> Lien paiement
              </button>

              {!isSolde &&
                act.statut !== 'ANNULEE' &&
                hasRole([
                  ROLES.ADMINISTRATEUR,
                  ROLES.RESPONSABLE,
                  ROLES.COMPTABLE_CAISSIER,
                  ROLES.AGENT,
                ]) && (
                  <button
                    type="button"
                    onClick={() => handleOpenQuickPay(act)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                    title="Encaisser le paiement de ce client"
                  >
                    <CreditCard className="w-3 h-3" /> Encaisser
                  </button>
                )}

              {isSolde && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Soldé
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Statut',
      render: (act) => {
        const badge = getActiviteStatusBadge(act.statut);
        return (
          <div className="space-y-1.5">
            <span
              className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.classes}`}
            >
              {badge.label}
            </span>

            {/* Quick status transitions */}
            {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.AGENT]) && (
              <div className="flex items-center gap-1">
                {act.statut === STATUT_ACTIVITE.EN_ATTENTE && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(act, STATUT_ACTIVITE.EN_COURS)}
                    className="p-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1 cursor-pointer"
                    title="Démarrer la course"
                  >
                    <Play className="w-3 h-3" /> Démarrer
                  </button>
                )}
                {act.statut === STATUT_ACTIVITE.EN_COURS && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(act, STATUT_ACTIVITE.TERMINEE)}
                    className="p-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center gap-1 cursor-pointer"
                    title="Terminer la course"
                  >
                    <CheckCircle className="w-3 h-3" /> Terminer
                  </button>
                )}
                {(act.statut === STATUT_ACTIVITE.EN_ATTENTE ||
                  act.statut === STATUT_ACTIVITE.EN_COURS) && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(act, STATUT_ACTIVITE.ANNULEE)}
                    className="p-1 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 flex items-center gap-1 cursor-pointer"
                    title="Annuler la course"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (act) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleOpenPaymentLink(act)}
            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Lien de paiement du client"
          >
            <Link2 className="w-4 h-4" />
          </button>
          {Number(act.reste_a_payer) > 0 &&
            act.statut !== 'ANNULEE' &&
            hasRole([
              ROLES.ADMINISTRATEUR,
              ROLES.RESPONSABLE,
              ROLES.COMPTABLE_CAISSIER,
              ROLES.AGENT,
            ]) && (
              <button
                type="button"
                onClick={() => handleOpenQuickPay(act)}
                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                title="Encaisser le paiement client"
              >
                <CreditCard className="w-4 h-4" />
              </button>
            )}
          {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.AGENT]) && (
            <button
              type="button"
              onClick={() => handleOpenEdit(act)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <button
              type="button"
              onClick={() => setActiviteToDelete(act)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Supprimer"
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
        title="Activités & Courses"
        subtitle="Pilotez les prestations de transport, les affectations véhicules/chauffeurs et les statuts."
        action={
          hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.AGENT]) && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Nouvelle activité
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

      {loading ? (
        <Loader message="Chargement des activités..." />
      ) : (
        <div className="space-y-2">
          <Table
            columns={columns}
            data={activites}
            emptyMessage="Aucune prestation de transport enregistrée."
          />
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={limit}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      <ActiviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveActivite}
        activite={selectedActivite}
        clients={clients}
        vehicules={vehicules}
        chauffeurs={chauffeurs}
        typesPrestations={typesPrestations}
        loading={modalLoading}
      />

      {/* Modale Lien de paiement client & partage */}
      <ClientPaymentLinkModal
        isOpen={isPaymentLinkModalOpen}
        onClose={() => {
          setIsPaymentLinkModalOpen(false);
          setPaymentLinkActivite(null);
        }}
        activite={paymentLinkActivite}
        onOpenPayment={(act) => handleOpenQuickPay(act)}
      />

      {/* Modale d'encaissement direct d'une activité */}
      <PaiementModal
        isOpen={isQuickPayModalOpen}
        onClose={() => {
          setIsQuickPayModalOpen(false);
          setQuickPayActivite(null);
        }}
        onSubmit={handleSaveQuickPay}
        activites={activites}
        initialActiviteId={quickPayActivite?.id}
        loading={quickPayLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(activiteToDelete)}
        onClose={() => setActiviteToDelete(null)}
        onConfirm={handleDeleteActivite}
        title="Supprimer l'activité"
        message={`Êtes-vous certain de vouloir supprimer cette prestation pour ${activiteToDelete?.client?.nom || 'le client'} (${formatCurrency(activiteToDelete?.prix)}) ?`}
        loading={isDeleting}
      />
    </div>
  );
};
