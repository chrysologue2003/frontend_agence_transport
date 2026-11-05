import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { Table } from '../components/common/Table.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { ClientModal } from '../components/clients/ClientModal.jsx';
import { clientService } from '../services/clientService.js';
import { formatDate } from '../utils/formatters.js';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES } from '../utils/constants.js';

export const Clients = () => {
  const { hasRole } = useAuth();
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal & Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await clientService.getClients({
        page,
        limit,
        search,
      });
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setClients(items);
      setTotal(response.total || items.length);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchClients();
  };

  const handleOpenCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedClient) {
        await clientService.updateClient(selectedClient.id, formData);
        setSuccessMsg('Client mis à jour avec succès');
      } else {
        await clientService.createClient(formData);
        setSuccessMsg('Nouveau client enregistré avec succès');
      }
      fetchClients();
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      await clientService.deleteClient(clientToDelete.id);
      setSuccessMsg('Client supprimé avec succès');
      setClientToDelete(null);
      fetchClients();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer ce client');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Client',
      render: (client) => (
        <div>
          <p className="font-semibold text-slate-900">
            {client.nom} {client.prenom || ''}
          </p>
          <span className="text-xs text-slate-500 font-mono">
            ID: {client.id.slice(0, 8)}...
          </span>
        </div>
      ),
    },
    {
      header: 'Type',
      render: (client) => (
        <Badge
          variant={client.type_client === 'ENTREPRISE' ? 'purple' : 'primary'}
        >
          {client.type_client || 'Particulier'}
        </Badge>
      ),
    },
    {
      header: 'Contact',
      render: (client) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{client.telephone}</span>
          </div>
          {client.email && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{client.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Adresse',
      render: (client) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-xs truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{client.adresse || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Créé le',
      render: (client) => (
        <span className="text-xs text-slate-500">
          {formatDate(client.date_creation)}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (client) => (
        <div className="flex items-center justify-end gap-1.5">
          {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.AGENT]) && (
            <button
              type="button"
              onClick={() => handleOpenEdit(client)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE]) && (
            <button
              type="button"
              onClick={() => setClientToDelete(client)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des clients"
        subtitle="Consultez, ajoutez et gérez les comptes clients de votre agence."
        action={
          hasRole([ROLES.ADMINISTRATEUR, ROLES.RESPONSABLE, ROLES.AGENT]) && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Nouveau client
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

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou numéro de téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" size="md">
              Rechercher
            </Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Clients Table */}
      {loading ? (
        <Loader message="Chargement des clients..." />
      ) : (
        <div className="space-y-2">
          <Table
            columns={columns}
            data={clients}
            emptyMessage="Aucun client trouvé avec ces critères."
          />
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Modal create / edit */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveClient}
        client={selectedClient}
        loading={modalLoading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(clientToDelete)}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDeleteClient}
        title="Supprimer le client"
        message={`Êtes-vous certain de vouloir supprimer le client ${clientToDelete?.nom} ${clientToDelete?.prenom || ''} ?`}
        loading={isDeleting}
      />
    </div>
  );
};
