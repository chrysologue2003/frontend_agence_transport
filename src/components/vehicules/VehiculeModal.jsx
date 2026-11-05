import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Button } from '../common/Button.jsx';
import { Alert } from '../common/Alert.jsx';
import { STATUT_VEHICULE } from '../../utils/constants.js';
import {
  validateRequired,
  validateInteger,
  validatePositiveNumber,
} from '../../utils/validators.js';

export const VehiculeModal = ({
  isOpen,
  onClose,
  onSubmit,
  vehicule = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    type_vehicule: '',
    capacite: '',
    annee_mise_circulation: '',
    kilometrage: '',
    etat: '',
    statut: STATUT_VEHICULE.DISPONIBLE,
    date_assurance: '',
    date_expiration_assurance: '',
    date_visite_technique: '',
    date_prochaine_maintenance: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (vehicule) {
      setFormData({
        immatriculation: vehicule.immatriculation || '',
        marque: vehicule.marque || '',
        modele: vehicule.modele || '',
        type_vehicule: vehicule.type_vehicule || '',
        capacite: vehicule.capacite ?? '',
        annee_mise_circulation: vehicule.annee_mise_circulation ?? '',
        kilometrage: vehicule.kilometrage ?? '',
        etat: vehicule.etat || '',
        statut: vehicule.statut || STATUT_VEHICULE.DISPONIBLE,
        date_assurance: vehicule.date_assurance ? vehicule.date_assurance.split('T')[0] : '',
        date_expiration_assurance: vehicule.date_expiration_assurance ? vehicule.date_expiration_assurance.split('T')[0] : '',
        date_visite_technique: vehicule.date_visite_technique ? vehicule.date_visite_technique.split('T')[0] : '',
        date_prochaine_maintenance: vehicule.date_prochaine_maintenance ? vehicule.date_prochaine_maintenance.split('T')[0] : '',
      });
    } else {
      setFormData({
        immatriculation: '',
        marque: '',
        modele: '',
        type_vehicule: '',
        capacite: '',
        annee_mise_circulation: '',
        kilometrage: '',
        etat: '',
        statut: STATUT_VEHICULE.DISPONIBLE,
        date_assurance: '',
        date_expiration_assurance: '',
        date_visite_technique: '',
        date_prochaine_maintenance: '',
      });
    }
    setErrors({});
    setApiError('');
  }, [vehicule, isOpen]);

  const validate = () => {
    const newErrors = {};
    const immErr = validateRequired(formData.immatriculation, "L'immatriculation", 3);
    if (immErr) newErrors.immatriculation = immErr;

    const marqueErr = validateRequired(formData.marque, 'La marque', 2);
    if (marqueErr) newErrors.marque = marqueErr;

    const modeleErr = validateRequired(formData.modele, 'Le modèle', 1);
    if (modeleErr) newErrors.modele = modeleErr;

    const capErr = validateInteger(formData.capacite, 'La capacité', 1);
    if (capErr) newErrors.capacite = capErr;

    if (formData.annee_mise_circulation) {
      const year = Number(formData.annee_mise_circulation);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1960 || year > currentYear + 1) {
        newErrors.annee_mise_circulation = `Année invalide (entre 1960 et ${currentYear + 1})`;
      }
    }

    if (formData.kilometrage) {
      const kmErr = validatePositiveNumber(formData.kilometrage, 'Le kilométrage');
      if (kmErr) newErrors.kilometrage = kmErr;
    }

    if (formData.date_assurance && formData.date_expiration_assurance) {
      if (new Date(formData.date_expiration_assurance) < new Date(formData.date_assurance)) {
        newErrors.date_expiration_assurance = "L'expiration doit être postérieure à la souscription";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');

    const payload = {
      ...formData,
      capacite: Number(formData.capacite),
      annee_mise_circulation: formData.annee_mise_circulation ? Number(formData.annee_mise_circulation) : undefined,
      kilometrage: formData.kilometrage ? Number(formData.kilometrage) : undefined,
      date_assurance: formData.date_assurance || undefined,
      date_expiration_assurance: formData.date_expiration_assurance || undefined,
      date_visite_technique: formData.date_visite_technique || undefined,
      date_prochaine_maintenance: formData.date_prochaine_maintenance || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Erreur lors de l\'enregistrement du véhicule');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicule ? 'Modifier le véhicule' : 'Nouveau véhicule'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && <Alert type="danger" message={apiError} />}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Immatriculation"
            name="immatriculation"
            value={formData.immatriculation}
            onChange={(e) =>
              setFormData({ ...formData, immatriculation: e.target.value })
            }
            placeholder="Ex: 1234-TAB"
            error={errors.immatriculation}
            disabled={Boolean(vehicule)} // PK cannot be edited
            required
          />
          <Input
            label="Marque"
            name="marque"
            value={formData.marque}
            onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
            placeholder="Ex: Toyota"
            error={errors.marque}
            required
          />
          <Input
            label="Modèle"
            name="modele"
            value={formData.modele}
            onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
            placeholder="Ex: Hilux"
            error={errors.modele}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Capacité (tonnes / places)"
            name="capacite"
            type="number"
            step="0.1"
            value={formData.capacite}
            onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
            placeholder="Ex: 3.5"
            error={errors.capacite}
            required
          />
          <Input
            label="Type de véhicule"
            name="type_vehicule"
            value={formData.type_vehicule}
            onChange={(e) =>
              setFormData({ ...formData, type_vehicule: e.target.value })
            }
            placeholder="Ex: Camionnette / Berline"
          />
          <Select
            label="Statut"
            name="statut"
            value={formData.statut}
            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            options={[
              { value: STATUT_VEHICULE.DISPONIBLE, label: 'Disponible' },
              { value: STATUT_VEHICULE.AFFECTE, label: 'Affecté' },
              { value: STATUT_VEHICULE.EN_SERVICE, label: 'En service' },
              { value: STATUT_VEHICULE.EN_MAINTENANCE, label: 'En maintenance' },
              { value: STATUT_VEHICULE.HORS_SERVICE, label: 'Hors service' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Année mise en circ."
            name="annee_mise_circulation"
            type="number"
            value={formData.annee_mise_circulation}
            onChange={(e) =>
              setFormData({ ...formData, annee_mise_circulation: e.target.value })
            }
            placeholder="Ex: 2020"
            error={errors.annee_mise_circulation}
          />
          <Input
            label="Kilométrage (km)"
            name="kilometrage"
            type="number"
            value={formData.kilometrage}
            onChange={(e) =>
              setFormData({ ...formData, kilometrage: e.target.value })
            }
            placeholder="Ex: 45000"
            error={errors.kilometrage}
          />
          <Input
            label="État général"
            name="etat"
            value={formData.etat}
            onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
            placeholder="Ex: Très bon état"
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Dates & Contrôles techniques
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Assurance début"
              name="date_assurance"
              type="date"
              value={formData.date_assurance}
              onChange={(e) =>
                setFormData({ ...formData, date_assurance: e.target.value })
              }
            />
            <Input
              label="Expiration assurance"
              name="date_expiration_assurance"
              type="date"
              value={formData.date_expiration_assurance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date_expiration_assurance: e.target.value,
                })
              }
              error={errors.date_expiration_assurance}
            />
            <Input
              label="Visite technique"
              name="date_visite_technique"
              type="date"
              value={formData.date_visite_technique}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date_visite_technique: e.target.value,
                })
              }
            />
            <Input
              label="Prochaine maintenance"
              name="date_prochaine_maintenance"
              type="date"
              value={formData.date_prochaine_maintenance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date_prochaine_maintenance: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {vehicule ? 'Enregistrer les modifications' : 'Créer le véhicule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
