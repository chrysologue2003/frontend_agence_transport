import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Input } from '../components/common/Input.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { typePrestationService } from '../services/typePrestationService.js';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES } from '../utils/constants.js';
import { validateRequired } from '../utils/validators.js';

export const TypesPrestations = () => {
  const { hasRole } = useAuth();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({ code: '', libelle: '' });
  const [modalErrors, setModalErrors] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  // Delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await typePrestationService.getTypesPrestations();
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setTypes(items);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des types de prestations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleOpenCreate = () => {
    setSelectedType(null);
    setFormData({ code: '', libelle: '' });
    setModalErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setSelectedType(t);
    setFormData({ code: t.code, libelle: t.libelle });
    setModalErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!selectedType) {
      const codeErr = validateRequired(formData.code, 'Le code', 2);
      if (codeErr) errs.code = codeErr;
    }
    const libErr = validateRequired(formData.libelle, 'Le libellé', 2);
    if (libErr) errs.libelle = libErr;
    setModalErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setModalLoading(true);
    try {
      if (selectedType) {
        await typePrestationService.updateTypePrestation(selectedType.code, {
          libelle: formData.libelle,
        });
        setSuccessMsg('Type de prestation mis à jour avec succès');
      } else {
        await typePrestationService.createTypePrestation({
          code: formData.code.toUpperCase().trim(),
          libelle: formData.libelle.trim(),
        });
        setSuccessMsg('Nouveau type de prestation créé avec succès');
      }
      setIsModalOpen(false);
      fetchTypes();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    setIsDeleting(true);
    try {
      await typePrestationService.deleteTypePrestation(typeToDelete.code);
      setSuccessMsg('Type de prestation supprimé avec succès');
      setTypeToDelete(null);
      fetchTypes();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer ce type de prestation');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Code',
      render: (t) => (
        <span className="font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200">
          {t.code}
        </span>
      ),
    },
    {
      header: 'Libellé de la prestation',
      render: (t) => <span className="font-semibold text-slate-800">{t.libelle}</span>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <>
              <button
                type="button"
                onClick={() => handleOpenEdit(t)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTypeToDelete(t)}
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
        title="Types de prestations"
        subtitle="Configurez les catégories de courses et services proposés (ex: Location, Transport, etc.)."
        action={
          hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Nouveau type
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
        <Loader message="Chargement des types de prestations..." />
      ) : (
        <Table
          columns={columns}
          data={types}
          emptyMessage="Aucun type de prestation paramétré."
        />
      )}

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedType ? 'Modifier le type de prestation' : 'Nouveau type de prestation'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Ex: LOC, TRANS, DEM"
            error={modalErrors.code}
            disabled={Boolean(selectedType)} // PK cannot be updated
            required
            autoFocus
          />
          <Input
            label="Libellé"
            name="libelle"
            value={formData.libelle}
            onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
            placeholder="Ex: Location avec chauffeur"
            error={modalErrors.libelle}
            required
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
              {selectedType ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(typeToDelete)}
        onClose={() => setTypeToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le type de prestation"
        message={`Êtes-vous certain de vouloir supprimer le type "${typeToDelete?.libelle}" (${typeToDelete?.code}) ?`}
        loading={isDeleting}
      />
    </div>
  );
};
