import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Input } from '../components/common/Input.jsx';
import { Select } from '../components/common/Select.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { userService, roleService } from '../services/userService.js';
import { ROLE_LABELS, ROLES } from '../utils/constants.js';
import { validateRequired } from '../utils/validators.js';
import { useAuth } from '../hooks/useAuth.js';

export const Users = () => {
  const { user: currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    login: '',
    mot_de_passe: '',
    role: '',
  });
  const [modalErrors, setModalErrors] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  // Delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsersAndRoles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, rolesRes] = await Promise.all([
        userService.getUsers(),
        roleService.getRoles().catch(() => ({ data: [] })),
      ]);
      const uItems = Array.isArray(usersRes.data)
        ? usersRes.data
        : Array.isArray(usersRes)
        ? usersRes
        : [];
      const rItems = Array.isArray(rolesRes.data)
        ? rolesRes.data
        : Array.isArray(rolesRes)
        ? rolesRes
        : [];

      setUsers(uItems);
      setRoles(rItems);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    // Pre-select first available role
    const defaultRole = roles.length > 0 ? roles[0].libelle : '';
    setFormData({
      nom_utilisateur: '',
      login: '',
      mot_de_passe: '',
      role: defaultRole,
    });
    setModalErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setFormData({
      nom_utilisateur: u.nom_utilisateur || '',
      login: u.login || '',
      mot_de_passe: '',
      role: (typeof u.role === 'object' ? u.role?.libelle : u.role) || '',
    });
    setModalErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const nomErr = validateRequired(formData.nom_utilisateur, 'Le nom complet', 3);
    if (nomErr) errs.nom_utilisateur = nomErr;

    const loginErr = validateRequired(formData.login, "L'identifiant de connexion", 3);
    if (loginErr) {
      errs.login = loginErr;
    } else if (/\s/.test(formData.login.trim())) {
      errs.login = "L'identifiant ne doit pas contenir d'espaces";
    }

    if (!selectedUser) {
      if (!formData.mot_de_passe.trim()) {
        errs.mot_de_passe = 'Le mot de passe est obligatoire';
      } else if (formData.mot_de_passe.trim().length < 6) {
        errs.mot_de_passe = 'Le mot de passe doit comporter au moins 6 caractères';
      }
    } else if (formData.mot_de_passe.trim() && formData.mot_de_passe.trim().length < 6) {
      errs.mot_de_passe = 'Le mot de passe doit comporter au moins 6 caractères';
    }

    if (!formData.role) {
      errs.role = 'Le rôle est obligatoire';
    }
    setModalErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setModalLoading(true);
    try {
      if (selectedUser) {
        const payload = {
          nom_utilisateur: formData.nom_utilisateur.trim(),
          login: formData.login.trim(),
          role: formData.role || undefined,
        };
        if (formData.mot_de_passe.trim()) {
          payload.mot_de_passe = formData.mot_de_passe.trim();
        }
        await userService.updateUser(selectedUser.id, payload);
        setSuccessMsg('Utilisateur mis à jour avec succès');
      } else {
        await userService.createUser({
          nom_utilisateur: formData.nom_utilisateur.trim(),
          login: formData.login.trim(),
          mot_de_passe: formData.mot_de_passe.trim(),
          role: formData.role || undefined,
        });
        setSuccessMsg('Nouvel utilisateur créé avec succès');
      }
      setIsModalOpen(false);
      fetchUsersAndRoles();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement de l\'utilisateur');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      setSuccessMsg('Compte utilisateur supprimé avec succès');
      setUserToDelete(null);
      fetchUsersAndRoles();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer cet utilisateur');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Utilisateur',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            {u.nom_utilisateur ? u.nom_utilisateur.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-bold text-slate-900">{u.nom_utilisateur}</p>
            <span className="text-xs text-slate-500 font-mono">
              Login: @{u.login}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Rôle & Permissions',
      render: (u) => {
        const roleLib = typeof u.role === 'object' ? u.role?.libelle : u.role;
        return (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-xs text-slate-700">
              {ROLE_LABELS[roleLib] || roleLib || 'Sans rôle'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (u) => {
        const isSelf = u.id === currentUser?.id || u.login === currentUser?.login;
        return (
          <div className="flex items-center justify-end gap-1.5">
            {hasRole([ROLES.ADMINISTRATEUR]) && (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(u)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!isSelf && (
                  <button
                    type="button"
                    onClick={() => setUserToDelete(u)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle="Administrez les comptes des agents, responsables et caissiers ainsi que leurs accès."
        action={
          hasRole([ROLES.ADMINISTRATEUR]) && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Nouvel utilisateur
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
        <Loader message="Chargement des utilisateurs..." />
      ) : (
        <Table
          columns={columns}
          data={users}
          emptyMessage="Aucun utilisateur configuré."
        />
      )}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            name="nom_utilisateur"
            value={formData.nom_utilisateur}
            onChange={(e) =>
              setFormData({ ...formData, nom_utilisateur: e.target.value })
            }
            placeholder="Ex: Jean Dupont"
            error={modalErrors.nom_utilisateur}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Identifiant (Login)"
              name="login"
              value={formData.login}
              onChange={(e) =>
                setFormData({ ...formData, login: e.target.value })
              }
              placeholder="Ex: jdupont"
              error={modalErrors.login}
              required
            />
            <Input
              label={
                selectedUser
                  ? 'Nouveau mot de passe (optionnel)'
                  : 'Mot de passe'
              }
              name="mot_de_passe"
              type="password"
              value={formData.mot_de_passe}
              onChange={(e) =>
                setFormData({ ...formData, mot_de_passe: e.target.value })
              }
              placeholder="••••••••"
              error={modalErrors.mot_de_passe}
              required={!selectedUser}
            />
          </div>

          <Select
            label="Rôle attribué"
            name="role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            options={roles.map((r) => ({
              value: r.libelle,
              label: `${ROLE_LABELS[r.libelle] || r.libelle}`,
            }))}
            error={modalErrors.role}
            placeholder="Sélectionner un rôle..."
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
              {selectedUser ? 'Enregistrer' : 'Créer le compte'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le compte"
        message={`Êtes-vous certain de vouloir supprimer l'utilisateur "${userToDelete?.nom_utilisateur}" (@${userToDelete?.login}) ?`}
        loading={isDeleting}
      />
    </div>
  );
};
