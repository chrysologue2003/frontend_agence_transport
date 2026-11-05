import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Button } from '../common/Button.jsx';
import { Alert } from '../common/Alert.jsx';
import { STATUT_CHAUFFEUR } from '../../utils/constants.js';
import { validateTelephone, validateRequired } from '../../utils/validators.js';

export const ChauffeurModal = ({
  isOpen,
  onClose,
  onSubmit,
  chauffeur = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    numero_permis: '',
    categorie_permis: '',
    date_expiration_permis: '',
    date_embauche: '',
    statut: STATUT_CHAUFFEUR.DISPONIBLE,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (chauffeur) {
      setFormData({
        matricule: chauffeur.matricule || '',
        nom: chauffeur.nom || '',
        prenom: chauffeur.prenom || '',
        telephone: chauffeur.telephone || '',
        adresse: chauffeur.adresse || '',
        numero_permis: chauffeur.numero_permis || '',
        categorie_permis: chauffeur.categorie_permis || '',
        date_expiration_permis: chauffeur.date_expiration_permis
          ? chauffeur.date_expiration_permis.split('T')[0]
          : '',
        date_embauche: chauffeur.date_embauche
          ? chauffeur.date_embauche.split('T')[0]
          : '',
        statut: chauffeur.statut || STATUT_CHAUFFEUR.DISPONIBLE,
      });
    } else {
      setFormData({
        matricule: '',
        nom: '',
        prenom: '',
        telephone: '',
        adresse: '',
        numero_permis: '',
        categorie_permis: '',
        date_expiration_permis: '',
        date_embauche: '',
        statut: STATUT_CHAUFFEUR.DISPONIBLE,
      });
    }
    setErrors({});
    setApiError('');
  }, [chauffeur, isOpen]);

  const validate = () => {
    const newErrors = {};
    const matErr = validateRequired(formData.matricule, 'Le matricule', 2);
    if (matErr) newErrors.matricule = matErr;

    const nomErr = validateRequired(formData.nom, 'Le nom', 2);
    if (nomErr) newErrors.nom = nomErr;

    const phoneErr = validateTelephone(formData.telephone);
    if (phoneErr) newErrors.telephone = phoneErr;

    const permisErr = validateRequired(formData.numero_permis, 'Le numéro de permis', 3);
    if (permisErr) newErrors.numero_permis = permisErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');

    const payload = {
      ...formData,
      date_expiration_permis: formData.date_expiration_permis || undefined,
      date_embauche: formData.date_embauche || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Erreur lors de l\'enregistrement du chauffeur');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={chauffeur ? 'Modifier le chauffeur' : 'Nouveau chauffeur'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && <Alert type="danger" message={apiError} />}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Matricule"
            name="matricule"
            value={formData.matricule}
            onChange={(e) =>
              setFormData({ ...formData, matricule: e.target.value })
            }
            placeholder="Ex: CH-001"
            error={errors.matricule}
            disabled={Boolean(chauffeur)} // PK cannot be changed
            required
            autoFocus
          />
          <Input
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="Ex: Rabe"
            error={errors.nom}
            required
          />
          <Input
            label="Prénom"
            name="prenom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            placeholder="Ex: Paul"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Téléphone"
            name="telephone"
            value={formData.telephone}
            onChange={(e) =>
              setFormData({ ...formData, telephone: e.target.value })
            }
            placeholder="Ex: 032 12 345 67 (034, 032, 037, 038)"
            error={errors.telephone}
            required
          />
          <Input
            label="Adresse"
            name="adresse"
            value={formData.adresse}
            onChange={(e) =>
              setFormData({ ...formData, adresse: e.target.value })
            }
            placeholder="Ex: Analamahitsy"
          />
          <Select
            label="Statut"
            name="statut"
            value={formData.statut}
            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            options={[
              { value: STATUT_CHAUFFEUR.DISPONIBLE, label: 'Disponible' },
              { value: STATUT_CHAUFFEUR.EN_ACTIVITE, label: 'En activité' },
              { value: STATUT_CHAUFFEUR.EN_CONGE, label: 'En congé' },
              { value: STATUT_CHAUFFEUR.INDISPONIBLE, label: 'Indisponible' },
              { value: STATUT_CHAUFFEUR.SUSPENDU, label: 'Suspendu' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="N° Permis de conduire"
            name="numero_permis"
            value={formData.numero_permis}
            onChange={(e) =>
              setFormData({ ...formData, numero_permis: e.target.value })
            }
            placeholder="Ex: 987654321"
            error={errors.numero_permis}
            required
          />
          <Input
            label="Catégorie permis"
            name="categorie_permis"
            value={formData.categorie_permis}
            onChange={(e) =>
              setFormData({ ...formData, categorie_permis: e.target.value })
            }
            placeholder="Ex: B, C, D"
          />
          <Input
            label="Date expiration permis"
            name="date_expiration_permis"
            type="date"
            value={formData.date_expiration_permis}
            onChange={(e) =>
              setFormData({
                ...formData,
                date_expiration_permis: e.target.value,
              })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date d'embauche"
            name="date_embauche"
            type="date"
            value={formData.date_embauche}
            onChange={(e) =>
              setFormData({ ...formData, date_embauche: e.target.value })
            }
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {chauffeur ? 'Enregistrer les modifications' : 'Créer le chauffeur'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
