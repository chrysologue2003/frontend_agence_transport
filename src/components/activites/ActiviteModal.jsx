import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Textarea } from '../common/Textarea.jsx';
import { Button } from '../common/Button.jsx';
import { Alert } from '../common/Alert.jsx';
import {
  STATUT_ACTIVITE,
  STATUT_VEHICULE,
  STATUT_CHAUFFEUR,
} from '../../utils/constants.js';
import { formatCurrency } from '../../utils/formatters.js';
import {
  validateStrictPositiveNumber,
  validatePositiveNumber,
  validateDate,
  validateRequired,
} from '../../utils/validators.js';

export const ActiviteModal = ({
  isOpen,
  onClose,
  onSubmit,
  activite = null,
  clients = [],
  vehicules = [],
  chauffeurs = [],
  typesPrestations = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    client_id: '',
    immatriculation: '',
    matricule_chauffeur: '',
    type_prestation_code: '',
    date_activite: new Date().toISOString().split('T')[0],
    destination: '',
    prix: '',
    avance: '0',
    statut: STATUT_ACTIVITE.EN_ATTENTE,
    observations: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (activite) {
      setFormData({
        client_id: activite.client_id || activite.client?.id || '',
        immatriculation: activite.immatriculation || '',
        matricule_chauffeur: activite.matricule_chauffeur || '',
        type_prestation_code: activite.type_prestation_code || '',
        date_activite: activite.date_activite
          ? activite.date_activite.split('T')[0]
          : new Date().toISOString().split('T')[0],
        destination: activite.destination || '',
        prix: activite.prix ?? '',
        avance: activite.avance ?? '0',
        statut: activite.statut || STATUT_ACTIVITE.EN_ATTENTE,
        observations: activite.observations || '',
      });
    } else {
      setFormData({
        client_id: clients[0]?.id || '',
        immatriculation: '',
        matricule_chauffeur: '',
        type_prestation_code: typesPrestations[0]?.code || '',
        date_activite: new Date().toISOString().split('T')[0],
        destination: '',
        prix: '',
        avance: '0',
        statut: STATUT_ACTIVITE.EN_ATTENTE,
        observations: '',
      });
    }
    setErrors({});
    setApiError('');
  }, [activite, isOpen, clients, typesPrestations]);

  const validate = () => {
    const newErrors = {};
    const clientErr = validateRequired(formData.client_id, 'Le client');
    if (clientErr) newErrors.client_id = 'Veuillez sélectionner un client';

    const typeErr = validateRequired(formData.type_prestation_code, 'Le type de prestation');
    if (typeErr) newErrors.type_prestation_code = typeErr;

    const dateErr = validateDate(formData.date_activite, 'La date de prestation');
    if (dateErr) newErrors.date_activite = dateErr;

    const prixErr = validateStrictPositiveNumber(formData.prix, 'Le prix total');
    if (prixErr) newErrors.prix = prixErr;

    if (formData.avance !== '' && formData.avance !== null && formData.avance !== undefined) {
      const avanceErr = validatePositiveNumber(formData.avance, "L'avance");
      if (avanceErr) {
        newErrors.avance = avanceErr;
      } else if (Number(formData.avance) > Number(formData.prix || 0)) {
        newErrors.avance = "L'avance ne peut pas être supérieure au prix total";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatedReste = Math.max(
    0,
    (Number(formData.prix) || 0) - (Number(formData.avance) || 0),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');

    const payload = {
      client_id: formData.client_id,
      immatriculation: formData.immatriculation || undefined,
      matricule_chauffeur: formData.matricule_chauffeur || undefined,
      type_prestation_code: formData.type_prestation_code,
      date_activite: formData.date_activite,
      destination: formData.destination || undefined,
      prix: Number(formData.prix),
      avance: Number(formData.avance) || 0,
      statut: formData.statut,
      observations: formData.observations || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Erreur lors de l\'enregistrement de l\'activité');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activite ? 'Modifier l\'activité' : 'Nouvelle activité / course'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && <Alert type="danger" message={apiError} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Client"
            name="client_id"
            value={formData.client_id}
            onChange={(e) =>
              setFormData({ ...formData, client_id: e.target.value })
            }
            options={clients.map((c) => ({
              value: c.id,
              label: `${c.nom} ${c.prenom || ''} (${c.telephone})`,
            }))}
            error={errors.client_id}
            required
          />
          <Select
            label="Type de prestation"
            name="type_prestation_code"
            value={formData.type_prestation_code}
            onChange={(e) =>
              setFormData({ ...formData, type_prestation_code: e.target.value })
            }
            options={typesPrestations.map((t) => ({
              value: t.code,
              label: `${t.libelle} (${t.code})`,
            }))}
            error={errors.type_prestation_code}
            required
          />
        </div>

        {(() => {
          const availableVehicules = vehicules.filter(
            (v) =>
              v.statut === STATUT_VEHICULE.DISPONIBLE ||
              (activite && v.immatriculation === formData.immatriculation),
          );

          const availableChauffeurs = chauffeurs.filter(
            (c) =>
              c.statut === STATUT_CHAUFFEUR.DISPONIBLE ||
              (activite && c.matricule === formData.matricule_chauffeur),
          );

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Véhicule affecté"
                name="immatriculation"
                value={formData.immatriculation}
                onChange={(e) =>
                  setFormData({ ...formData, immatriculation: e.target.value })
                }
                placeholder={
                  availableVehicules.length === 0
                    ? 'Aucun véhicule disponible'
                    : 'Sélectionner un véhicule (optionnel)...'
                }
                options={availableVehicules.map((v) => ({
                  value: v.immatriculation,
                  label: `${v.immatriculation} - ${v.marque} ${v.modele}`,
                }))}
                disabled={availableVehicules.length === 0 && !formData.immatriculation}
              />
              <Select
                label="Chauffeur affecté"
                name="matricule_chauffeur"
                value={formData.matricule_chauffeur}
                onChange={(e) =>
                  setFormData({ ...formData, matricule_chauffeur: e.target.value })
                }
                placeholder={
                  availableChauffeurs.length === 0
                    ? 'Aucun chauffeur disponible'
                    : 'Sélectionner un chauffeur (optionnel)...'
                }
                options={availableChauffeurs.map((c) => ({
                  value: c.matricule,
                  label: `${c.nom} ${c.prenom || ''} (${c.matricule})`,
                }))}
                disabled={availableChauffeurs.length === 0 && !formData.matricule_chauffeur}
              />
            </div>
          );
        })()}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date de la prestation"
            name="date_activite"
            type="date"
            value={formData.date_activite}
            onChange={(e) =>
              setFormData({ ...formData, date_activite: e.target.value })
            }
            error={errors.date_activite}
            required
          />
          <Input
            label="Destination / Trajet"
            name="destination"
            value={formData.destination}
            onChange={(e) =>
              setFormData({ ...formData, destination: e.target.value })
            }
            placeholder="Ex: Antananarivo - Toamasina"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <Input
            label="Prix total (Ar)"
            name="prix"
            type="number"
            value={formData.prix}
            onChange={(e) =>
              setFormData({ ...formData, prix: e.target.value })
            }
            placeholder="Ex: 150000"
            error={errors.prix}
            required
          />
          <Input
            label="Avance versée (Ar)"
            name="avance"
            type="number"
            value={formData.avance}
            onChange={(e) =>
              setFormData({ ...formData, avance: e.target.value })
            }
            placeholder="Ex: 50000"
            error={errors.avance}
            disabled={Boolean(activite)} // Avance is set at creation
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reste à payer (Calculé)
            </label>
            <div className="h-10 px-3.5 flex items-center bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm">
              {formatCurrency(calculatedReste)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Statut de l'activité"
            name="statut"
            value={formData.statut}
            onChange={(e) =>
              setFormData({ ...formData, statut: e.target.value })
            }
            options={[
              { value: STATUT_ACTIVITE.EN_ATTENTE, label: 'En attente' },
              { value: STATUT_ACTIVITE.EN_COURS, label: 'En cours' },
              { value: STATUT_ACTIVITE.TERMINEE, label: 'Terminée' },
              { value: STATUT_ACTIVITE.ANNULEE, label: 'Annulée' },
            ]}
          />
          <Textarea
            label="Observations"
            name="observations"
            value={formData.observations}
            onChange={(e) =>
              setFormData({ ...formData, observations: e.target.value })
            }
            placeholder="Notes particulières ou consignes..."
            rows={1}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {activite ? 'Enregistrer les modifications' : 'Créer l\'activité'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
