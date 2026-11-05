import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, UserSquare2, Phone, Award, Calendar } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { ChauffeurModal } from '../components/chauffeurs/ChauffeurModal.jsx';
import { chauffeurService } from '../services/chauffeurService.js';
import { formatDate, getResourceStatusBadge } from '../utils/formatters.js';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES } from '../utils/constants.js';

export const Chauffeurs = () => {
  const { hasRole } = useAuth();
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal & Delete state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chauffeurToDelete, setChauffeurToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchChauffeurs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await chauffeurService.getChauffeurs({ page: 1, limit: 100 });
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setChauffeurs(items);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des chauffeurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChauffeurs();
  }, [fetchChauffeurs]);

  const handleOpenCreate = () => {
    setSelectedChauffeur(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setIsModalOpen(true);
  };

  const handleSaveChauffeur = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedChauffeur) {
        await chauffeurService.updateChauffeur(
          selectedChauffeur.matricule,
          formData,
        );
        setSuccessMsg('Chauffeur mis à jour avec succès');
      } else {
        await chauffeurService.createChauffeur(formData);
        setSuccessMsg('Nouveau chauffeur enregistré avec succès');
      }
      fetchChauffeurs();
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteChauffeur = async () => {
    if (!chauffeurToDelete) return;
    setIsDeleting(true);
    try {
      await chauffeurService.deleteChauffeur(chauffeurToDelete.matricule);
      setSuccessMsg('Chauffeur supprimé avec succès');
      setChauffeurToDelete(null);
      fetchChauffeurs();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer ce chauffeur');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Matricule & Identité',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 font-bold text-xs">
            <UserSquare2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">
              {c.nom} {c.prenom || ''}
            </p>
            <span className="text-xs text-slate-500 font-mono">
              Mat: {c.matricule}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Téléphone',
      render: (c) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{c.telephone}</span>
        </div>
      ),
    },
    {
      header: 'Permis',
      render: (c) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 font-medium text-slate-800">
            <Award className="w-3.5 h-3.5 text-blue-500" />
            <span>N° {c.numero_permis}</span>
            {c.categorie_permis && (
              <span className="bg-slate-100 px-1.5 py-0.2 rounded font-bold text-slate-600">
                Cat. {c.categorie_permis}
              </span>
            )}
          </div>
          <span className="text-slate-500">
            Exp: {formatDate(c.date_expiration_permis)}
          </span>
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (c) => {
        const badge = getResourceStatusBadge(c.statut);
        return (
          <span
            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.classes}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      header: 'Embauche',
      render: (c) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(c.date_embauche)}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <>
              <button
                type="button"
                onClick={() => handleOpenEdit(c)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setChauffeurToDelete(c)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des chauffeurs"
        subtitle="Suivez la disponibilité, les permis et les informations de vos conducteurs."
        action={
          hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Nouveau chauffeur
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
        <Loader message="Chargement des chauffeurs..." />
      ) : (
        <Table
          columns={columns}
          data={chauffeurs}
          emptyMessage="Aucun chauffeur enregistré pour le moment."
        />
      )}

      <ChauffeurModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveChauffeur}
        chauffeur={selectedChauffeur}
        loading={modalLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(chauffeurToDelete)}
        onClose={() => setChauffeurToDelete(null)}
        onConfirm={handleDeleteChauffeur}
        title="Supprimer le chauffeur"
        message={`Êtes-vous certain de vouloir supprimer le chauffeur ${chauffeurToDelete?.nom} ${chauffeurToDelete?.prenom || ''} (Matricule: ${chauffeurToDelete?.matricule}) ?`}
        loading={isDeleting}
      />
    </div>
  );
};
