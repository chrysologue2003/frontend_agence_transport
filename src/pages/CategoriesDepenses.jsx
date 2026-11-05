import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Input } from '../components/common/Input.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { categorieDepenseService } from '../services/categorieDepenseService.js';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES } from '../utils/constants.js';
import { validateRequired } from '../utils/validators.js';

export const CategoriesDepenses = () => {
  const { hasRole } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [formData, setFormData] = useState({ libelle: '', famille: '' });
  const [modalErrors, setModalErrors] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  // Delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await categorieDepenseService.getCategories();
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setCategories(items);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setSelectedCat(null);
    setFormData({ libelle: '', famille: '' });
    setModalErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setSelectedCat(cat);
    setFormData({ libelle: cat.libelle, famille: cat.famille || '' });
    setModalErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const libErr = validateRequired(formData.libelle, 'Le libellé', 2);
    if (libErr) errs.libelle = libErr;
    setModalErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setModalLoading(true);
    try {
      if (selectedCat) {
        await categorieDepenseService.updateCategorie(selectedCat.id, {
          libelle: formData.libelle.trim(),
          famille: formData.famille.trim() || undefined,
        });
        setSuccessMsg('Catégorie mise à jour avec succès');
      } else {
        await categorieDepenseService.createCategorie({
          libelle: formData.libelle.trim(),
          famille: formData.famille.trim() || undefined,
        });
        setSuccessMsg('Nouvelle catégorie créée avec succès');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!catToDelete) return;
    setIsDeleting(true);
    try {
      await categorieDepenseService.deleteCategorie(catToDelete.id);
      setSuccessMsg('Catégorie supprimée avec succès');
      setCatToDelete(null);
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer cette catégorie');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Libellé de la catégorie',
      render: (c) => <span className="font-semibold text-slate-800">{c.libelle}</span>,
    },
    {
      header: 'Famille / Groupe',
      render: (c) => (
        <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
          {c.famille || 'Général'}
        </span>
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
                onClick={() => setCatToDelete(c)}
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
        title="Catégories de dépenses"
        subtitle="Paramétrez les postes de dépenses de l'entreprise (Carburant, Entretien, Péages, etc.)."
        action={
          hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Nouvelle catégorie
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
        <Loader message="Chargement des catégories..." />
      ) : (
        <Table
          columns={columns}
          data={categories}
          emptyMessage="Aucune catégorie de dépense enregistrée."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCat ? 'Modifier la catégorie' : 'Nouvelle catégorie de dépense'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Libellé"
            name="libelle"
            value={formData.libelle}
            onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
            placeholder="Ex: Carburant"
            error={modalErrors.libelle}
            required
            autoFocus
          />
          <Input
            label="Famille / Groupe"
            name="famille"
            value={formData.famille}
            onChange={(e) => setFormData({ ...formData, famille: e.target.value })}
            placeholder="Ex: Exploitation, Administratif"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={modalLoading}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {selectedCat ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(catToDelete)}
        onClose={() => setCatToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer la catégorie"
        message={`Êtes-vous certain de vouloir supprimer la catégorie "${catToDelete?.libelle}" ?`}
        loading={isDeleting}
      />
    </div>
  );
};
