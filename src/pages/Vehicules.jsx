import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Car, Calendar, Gauge } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { VehiculeModal } from '../components/vehicules/VehiculeModal.jsx';
import { vehiculeService } from '../services/vehiculeService.js';
import { formatDate, getResourceStatusBadge } from '../utils/formatters.js';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES } from '../utils/constants.js';

export const Vehicules = () => {
  const { hasRole } = useAuth();
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [vehiculeToDelete, setVehiculeToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchVehicules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await vehiculeService.getVehicules({ page: 1, limit: 100 });
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setVehicules(items);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicules();
  }, [fetchVehicules]);

  const handleOpenCreate = () => {
    setSelectedVehicule(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicule) => {
    setSelectedVehicule(vehicule);
    setIsModalOpen(true);
  };

  const handleSaveVehicule = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedVehicule) {
        await vehiculeService.updateVehicule(
          selectedVehicule.immatriculation,
          formData,
        );
        setSuccessMsg('Véhicule mis à jour avec succès');
      } else {
        await vehiculeService.createVehicule(formData);
        setSuccessMsg('Nouveau véhicule enregistré avec succès');
      }
      fetchVehicules();
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteVehicule = async () => {
    if (!vehiculeToDelete) return;
    setIsDeleting(true);
    try {
      await vehiculeService.deleteVehicule(vehiculeToDelete.immatriculation);
      setSuccessMsg('Véhicule supprimé avec succès');
      setVehiculeToDelete(null);
      fetchVehicules();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer ce véhicule');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Immatriculation',
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 tracking-wider font-mono">
              {v.immatriculation}
            </p>
            <span className="text-xs text-slate-500">{v.type_vehicule || 'Véhicule'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Marque & Modèle',
      render: (v) => (
        <div>
          <p className="font-semibold text-slate-800">
            {v.marque} {v.modele}
          </p>
          <span className="text-xs text-slate-500">
            Capacité: {v.capacite} T / pers.
          </span>
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (v) => {
        const badge = getResourceStatusBadge(v.statut);
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
      header: 'Kilométrage & État',
      render: (v) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1 text-slate-700">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            <span>{v.kilometrage ? `${v.kilometrage} km` : 'Non renseigné'}</span>
          </div>
          <span className="text-slate-500">{v.etat || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Validité assurance',
      render: (v) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(v.date_expiration_assurance)}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (v) => (
        <div className="flex items-center justify-end gap-1.5">
          {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <>
              <button
                type="button"
                onClick={() => handleOpenEdit(v)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setVehiculeToDelete(v)}
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
        title="Flotte de véhicules"
        subtitle="Suivez la disponibilité, l'état technique et les documents de vos véhicules."
        action={
          hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Nouveau véhicule
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
        <Loader message="Chargement des véhicules..." />
      ) : (
        <Table
          columns={columns}
          data={vehicules}
          emptyMessage="Aucun véhicule enregistré dans la flotte."
        />
      )}

      <VehiculeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveVehicule}
        vehicule={selectedVehicule}
        loading={modalLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(vehiculeToDelete)}
        onClose={() => setVehiculeToDelete(null)}
        onConfirm={handleDeleteVehicule}
        title="Supprimer le véhicule"
        message={`Êtes-vous certain de vouloir supprimer le véhicule ${vehiculeToDelete?.immatriculation} (${vehiculeToDelete?.marque} ${vehiculeToDelete?.modele}) ?`}
        loading={isDeleting}
      />
    </div>
  );
};
