import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Textarea } from '../common/Textarea.jsx';
import { Button } from '../common/Button.jsx';
import { Alert } from '../common/Alert.jsx';
import { MODE_PAIEMENT } from '../../utils/constants.js';
import {
  validateStrictPositiveNumber,
  validateDate,
  validateRequired,
} from '../../utils/validators.js';

export const DepenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  vehicules = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    date_depense: new Date().toISOString().split('T')[0],
    categorie_id: '',
    description: '',
    montant: '',
    immatriculation: '',
    fournisseur: '',
    mode_paiement: MODE_PAIEMENT.ESPECES,
    reference: '',
    justificatif: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    setFormData({
      date_depense: new Date().toISOString().split('T')[0],
      categorie_id: categories[0]?.id || '',
      description: '',
      montant: '',
      immatriculation: '',
      fournisseur: '',
      mode_paiement: MODE_PAIEMENT.ESPECES,
      reference: '',
      justificatif: '',
    });
    setErrors({});
    setApiError('');
  }, [isOpen, categories]);

  const validate = () => {
    const newErrors = {};
    const catErr = validateRequired(formData.categorie_id, 'La catégorie');
    if (catErr) newErrors.categorie_id = catErr;

    const dateErr = validateDate(formData.date_depense, 'La date de la dépense');
    if (dateErr) newErrors.date_depense = dateErr;

    const descErr = validateRequired(formData.description, 'La description', 3);
    if (descErr) newErrors.description = descErr;

    const montantErr = validateStrictPositiveNumber(formData.montant, 'Le montant');
    if (montantErr) newErrors.montant = montantErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');

    const payload = {
      date_depense: formData.date_depense,
      categorie_id: formData.categorie_id,
      description: formData.description.trim(),
      montant: Number(formData.montant),
      immatriculation: formData.immatriculation || undefined,
      fournisseur: formData.fournisseur.trim() || undefined,
      mode_paiement: formData.mode_paiement || undefined,
      reference: formData.reference.trim() || undefined,
      justificatif: formData.justificatif.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Erreur lors de l\'enregistrement de la dépense');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enregistrer une nouvelle dépense"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && <Alert type="danger" message={apiError} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Catégorie de dépense"
            name="categorie_id"
            value={formData.categorie_id}
            onChange={(e) =>
              setFormData({ ...formData, categorie_id: e.target.value })
            }
            options={categories.map((c) => ({
              value: c.id,
              label: `${c.libelle} (${c.famille || 'Général'})`,
            }))}
            error={errors.categorie_id}
            required
          />
          <Input
            label="Date de la dépense"
            name="date_depense"
            type="date"
            value={formData.date_depense}
            onChange={(e) =>
              setFormData({ ...formData, date_depense: e.target.value })
            }
            error={errors.date_depense}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Montant (Ar)"
            name="montant"
            type="number"
            value={formData.montant}
            onChange={(e) =>
              setFormData({ ...formData, montant: e.target.value })
            }
            placeholder="Ex: 85000"
            error={errors.montant}
            required
          />
          <Select
            label="Véhicule concerné"
            name="immatriculation"
            value={formData.immatriculation}
            onChange={(e) =>
              setFormData({ ...formData, immatriculation: e.target.value })
            }
            placeholder="Aucun véhicule spécifique..."
            options={vehicules.map((v) => ({
              value: v.immatriculation,
              label: `${v.immatriculation} (${v.marque} ${v.modele})`,
            }))}
          />
        </div>

        <Textarea
          label="Description / Motif"
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Ex: Remplacement des plaquettes de frein avant..."
          error={errors.description}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Fournisseur / Bénéficiaire"
            name="fournisseur"
            value={formData.fournisseur}
            onChange={(e) =>
              setFormData({ ...formData, fournisseur: e.target.value })
            }
            placeholder="Ex: Station Total"
          />
          <Select
            label="Mode de règlement"
            name="mode_paiement"
            value={formData.mode_paiement}
            onChange={(e) =>
              setFormData({ ...formData, mode_paiement: e.target.value })
            }
            options={[
              { value: MODE_PAIEMENT.ESPECES, label: 'Espèces' },
              { value: MODE_PAIEMENT.MOBILE_MONEY, label: 'Mobile Money' },
              { value: MODE_PAIEMENT.VIREMENT, label: 'Virement bancaire' },
              { value: MODE_PAIEMENT.CHEQUE, label: 'Chèque' },
            ]}
          />
          <Input
            label="N° Facture / Référence"
            name="reference"
            value={formData.reference}
            onChange={(e) =>
              setFormData({ ...formData, reference: e.target.value })
            }
            placeholder="Ex: FACT-2026-08"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Enregistrer la sortie de caisse
          </Button>
        </div>
      </form>
    </Modal>
  );
};
