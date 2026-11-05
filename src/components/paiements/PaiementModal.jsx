import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Button } from '../common/Button.jsx';
import { Alert } from '../common/Alert.jsx';
import { MODE_PAIEMENT } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import {
  validateStrictPositiveNumber,
  validateDate,
  validateRequired,
} from '../../utils/validators.js';

export const PaiementModal = ({
  isOpen,
  onClose,
  onSubmit,
  activites = [],
  loading = false,
  initialActiviteId = null,
}) => {
  const [formData, setFormData] = useState({
    activite_id: '',
    date_paiement: new Date().toISOString().split('T')[0],
    montant: '',
    mode_paiement: MODE_PAIEMENT.ESPECES,
    reference: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Eligible activities that have reste_a_payer > 0, or the explicitly chosen activity
  const payableActivites = activites.filter(
    (a) =>
      a.id === initialActiviteId ||
      (a.statut !== 'ANNULEE' && Number(a.reste_a_payer) > 0),
  );

  useEffect(() => {
    if (!isOpen) return;

    const targetAct = initialActiviteId
      ? activites.find((a) => a.id === initialActiviteId)
      : payableActivites[0];

    if (targetAct) {
      setFormData({
        activite_id: targetAct.id,
        date_paiement: new Date().toISOString().split('T')[0],
        montant: targetAct.reste_a_payer ? String(targetAct.reste_a_payer) : '',
        mode_paiement: MODE_PAIEMENT.ESPECES,
        reference: '',
      });
    } else {
      setFormData({
        activite_id: '',
        date_paiement: new Date().toISOString().split('T')[0],
        montant: '',
        mode_paiement: MODE_PAIEMENT.ESPECES,
        reference: '',
      });
    }
    setErrors({});
    setApiError('');
  }, [isOpen, initialActiviteId, activites]);

  const selectedActivity = activites.find((a) => a.id === formData.activite_id);

  const handleActivityChange = (actId) => {
    const act = activites.find((a) => a.id === actId);
    setFormData({
      ...formData,
      activite_id: actId,
      montant: act?.reste_a_payer ? String(act.reste_a_payer) : '',
    });
  };

  const validate = () => {
    const newErrors = {};
    const actErr = validateRequired(formData.activite_id, "L'activité");
    if (actErr) newErrors.activite_id = actErr;

    const dateErr = validateDate(formData.date_paiement, 'La date de paiement');
    if (dateErr) newErrors.date_paiement = dateErr;

    const montantErr = validateStrictPositiveNumber(formData.montant, 'Le montant');
    if (montantErr) {
      newErrors.montant = montantErr;
    } else if (
      selectedActivity &&
      Number(formData.montant) > Number(selectedActivity.reste_a_payer) + 0.01
    ) {
      newErrors.montant = `Le montant ne peut pas dépasser le reste à payer (${formatCurrency(
        selectedActivity.reste_a_payer,
      )})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');

    const payload = {
      activite_id: formData.activite_id,
      date_paiement: formData.date_paiement,
      montant: Number(formData.montant),
      mode_paiement: formData.mode_paiement,
      reference: formData.reference.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Erreur lors de l\'enregistrement du paiement');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enregistrer un nouveau paiement"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && <Alert type="danger" message={apiError} />}

        <Select
          label="Activité / Course concernée"
          name="activite_id"
          value={formData.activite_id}
          onChange={(e) => handleActivityChange(e.target.value)}
          options={payableActivites.map((a) => ({
            value: a.id,
            label: `${a.client?.nom || 'Client'} - ${a.type_prestation?.libelle || 'Course'} (${formatDate(
              a.date_activite,
            )}) [Reste: ${formatCurrency(a.reste_a_payer)}]`,
          }))}
          error={errors.activite_id}
          required
        />

        {selectedActivity && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1">
            <p className="font-semibold text-sm text-blue-950">
              Détails de l'activité sélectionnée
            </p>
            <p>Prix total : <span className="font-bold">{formatCurrency(selectedActivity.prix)}</span></p>
            <p>Avance déjà versée : <span className="font-bold">{formatCurrency(selectedActivity.avance)}</span></p>
            <p>Reste actuel à payer : <span className="font-bold text-rose-700">{formatCurrency(selectedActivity.reste_a_payer)}</span></p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Montant à encaisser (Ar)"
            name="montant"
            type="number"
            value={formData.montant}
            onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
            placeholder="Ex: 50000"
            error={errors.montant}
            required
          />
          <Input
            label="Date de versement"
            name="date_paiement"
            type="date"
            value={formData.date_paiement}
            onChange={(e) =>
              setFormData({ ...formData, date_paiement: e.target.value })
            }
            error={errors.date_paiement}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Mode de paiement"
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
              { value: MODE_PAIEMENT.AUTRE, label: 'Autre' },
            ]}
          />
          <Input
            label="Référence / Reçu"
            name="reference"
            value={formData.reference}
            onChange={(e) =>
              setFormData({ ...formData, reference: e.target.value })
            }
            placeholder="Ex: MVola #084920"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Valider l'encaissement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
