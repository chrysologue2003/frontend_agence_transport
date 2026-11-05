/**
 * Formate un montant en Ariary (MGA / Ar)
 * Ex: 100000 -> 100 000 Ar
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0 Ar';
  }
  const numeric = Number(amount);
  return new Intl.NumberFormat('fr-MG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numeric) + ' Ar';
};

/**
 * Formate une date en JJ/MM/AAAA
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formate une date et heure en JJ/MM/AAAA HH:mm
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Retourne le style de badge pour les statuts d'activités
 */
export const getActiviteStatusBadge = (status) => {
  switch (status) {
    case 'EN_ATTENTE':
      return {
        label: 'En attente',
        classes: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 'EN_COURS':
      return {
        label: 'En cours',
        classes: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'TERMINEE':
      return {
        label: 'Terminée',
        classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    case 'ANNULEE':
      return {
        label: 'Annulée',
        classes: 'bg-rose-100 text-rose-800 border-rose-200',
      };
    default:
      return {
        label: status || '-',
        classes: 'bg-slate-100 text-slate-800 border-slate-200',
      };
  }
};

/**
 * Retourne le style de badge pour les statuts de véhicules et chauffeurs
 */
export const getResourceStatusBadge = (status) => {
  switch (status) {
    case 'DISPONIBLE':
      return {
        label: 'Disponible',
        classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    case 'AFFECTE':
    case 'EN_ACTIVITE':
    case 'EN_SERVICE':
      return {
        label: status === 'EN_ACTIVITE' ? 'En activité' : status === 'EN_SERVICE' ? 'En service' : 'Affecté',
        classes: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'EN_CONGE':
    case 'EN_MAINTENANCE':
      return {
        label: status === 'EN_CONGE' ? 'En congé' : 'En maintenance',
        classes: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 'INDISPONIBLE':
    case 'HORS_SERVICE':
    case 'SUSPENDU':
      return {
        label: status === 'SUSPENDU' ? 'Suspendu' : status === 'HORS_SERVICE' ? 'Hors service' : 'Indisponible',
        classes: 'bg-rose-100 text-rose-800 border-rose-200',
      };
    default:
      return {
        label: status || '-',
        classes: 'bg-slate-100 text-slate-800 border-slate-200',
      };
  }
};
