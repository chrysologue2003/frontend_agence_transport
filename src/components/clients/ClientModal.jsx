import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Textarea } from '../common/Textarea.jsx';
import { Button } from '../common/Button.jsx';
import { Alert } from '../common/Alert.jsx';
import { TYPE_CLIENT } from '../../utils/constants.js';
import { validateTelephone, validateRequired, validateEmail } from '../../utils/validators.js';

export const ClientModal = ({
  isOpen,
  onClose,
  onSubmit,
  client = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    email: '',
    type_client: TYPE_CLIENT.PARTICULIER,
    observations: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (client) {
      setFormData({
        nom: client.nom || '',
        prenom: client.prenom || '',
        telephone: client.telephone || '',
        adresse: client.adresse || '',
        email: client.email || '',
        type_client: client.type_client || TYPE_CLIENT.PARTICULIER,
        observations: client.observations || '',
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        telephone: '',
        adresse: '',
        email: '',
        type_client: TYPE_CLIENT.PARTICULIER,
        observations: '',
      });
    }
    setErrors({});
    setApiError('');
  }, [client, isOpen]);

  const validate = () => {
    const newErrors = {};
    const nomErr = validateRequired(formData.nom, 'Le nom', 2);
    if (nomErr) newErrors.nom = nomErr;

    const phoneErr = validateTelephone(formData.telephone);
    if (phoneErr) newErrors.telephone = phoneErr;

    const emailErr = validateEmail(formData.email, false);
    if (emailErr) newErrors.email = emailErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Erreur lors de l\'enregistrement du client');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Modifier le client' : 'Nouveau client'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && <Alert type="danger" message={apiError} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={(e) =>
              setFormData({ ...formData, nom: e.target.value })
            }
            placeholder="Ex: Rakoto"
            error={errors.nom}
            required
            autoFocus
          />
          <Input
            label="Prénom"
            name="prenom"
            value={formData.prenom}
            onChange={(e) =>
              setFormData({ ...formData, prenom: e.target.value })
            }
            placeholder="Ex: Jean"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Téléphone"
            name="telephone"
            value={formData.telephone}
            onChange={(e) =>
              setFormData({ ...formData, telephone: e.target.value })
            }
            placeholder="Ex: 034 12 345 67 (034, 032, 037, 038)"
            error={errors.telephone}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Ex: client@mail.com"
            error={errors.email}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Type de client"
            name="type_client"
            value={formData.type_client}
            onChange={(e) =>
              setFormData({ ...formData, type_client: e.target.value })
            }
            options={[
              { value: TYPE_CLIENT.PARTICULIER, label: 'Particulier' },
              { value: TYPE_CLIENT.ENTREPRISE, label: 'Entreprise' },
            ]}
          />
          <Input
            label="Adresse"
            name="adresse"
            value={formData.adresse}
            onChange={(e) =>
              setFormData({ ...formData, adresse: e.target.value })
            }
            placeholder="Ex: Lot II A 47 Antananarivo"
          />
        </div>

        <Textarea
          label="Observations"
          name="observations"
          value={formData.observations}
          onChange={(e) =>
            setFormData({ ...formData, observations: e.target.value })
          }
          placeholder="Notes particulières sur le client..."
          rows={2}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {client ? 'Enregistrer les modifications' : 'Créer le client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
