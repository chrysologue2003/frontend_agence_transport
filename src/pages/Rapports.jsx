import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Download,
  Filter,
  FileSpreadsheet,
  CalendarDays,
  Users,
  Car,
  UserSquare2,
  Tag,
  PiggyBank,
  TrendingUp,
  Receipt,
  AlertCircle,
  BarChart3,
  Scale,
  FolderTree,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Select } from '../components/common/Select.jsx';
import { Table } from '../components/common/Table.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { Card } from '../components/common/Card.jsx';
import { activiteService } from '../services/activiteService.js';
import { recetteService } from '../services/recetteService.js';
import { depenseService } from '../services/depenseService.js';
import { caisseService } from '../services/caisseService.js';
import { clientService } from '../services/clientService.js';
import { vehiculeService } from '../services/vehiculeService.js';
import { chauffeurService } from '../services/chauffeurService.js';
import { typePrestationService } from '../services/typePrestationService.js';
import { categorieDepenseService } from '../services/categorieDepenseService.js';
import { formatCurrency, formatDate, formatDateTime, getActiviteStatusBadge } from '../utils/formatters.js';

const toDateStr = (d) => d.toISOString().split('T')[0];

// Main sections according to CDC Section 21
const MAIN_CATEGORIES = [
  { key: 'activites', label: "Rapports d'activités", icon: CalendarDays },
  { key: 'finances', label: 'Rapports financiers', icon: Scale },
];

// Sub-reports for Activités (CDC §21)
const ACTIVITE_REPORTS = [
  { key: 'liste_activites', label: 'Liste des activités (tous filtres)', icon: FileText },
  { key: 'par_client', label: 'Activités par client', icon: Users },
  { key: 'par_vehicule', label: 'Activités par véhicule', icon: Car },
  { key: 'par_chauffeur', label: 'Activités par chauffeur', icon: UserSquare2 },
  { key: 'par_type', label: 'Activités par type de prestation', icon: Tag },
];

// Sub-reports for Finances (CDC §21)
const FINANCE_REPORTS = [
  { key: 'balance_financiere', label: 'Balance financière & Résultat par période', icon: Scale },
  { key: 'liste_recettes', label: 'Liste des recettes', icon: TrendingUp },
  { key: 'recettes_par_prestation', label: 'Recettes par prestation', icon: Tag },
  { key: 'liste_depenses', label: 'Liste des dépenses', icon: Receipt },
  { key: 'depenses_par_categorie', label: 'Dépenses par catégorie', icon: FolderTree },
  { key: 'depenses_par_vehicule', label: 'Dépenses par véhicule', icon: Car },
  { key: 'situation_caisse', label: 'Situation de caisse', icon: PiggyBank },
  { key: 'impayes', label: 'Suivi des impayés clients', icon: AlertCircle },
];

export const Rapports = () => {
  const [mainCategory, setMainCategory] = useState('activites');
  const [selectedReport, setSelectedReport] = useState('liste_activites');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState([]);

  // Date filters
  const today = toDateStr(new Date());
  const firstDayOfMonth = toDateStr(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const firstDayOfYear = toDateStr(new Date(new Date().getFullYear(), 0, 1));

  const [dateFrom, setDateFrom] = useState(firstDayOfMonth);
  const [dateTo, setDateTo] = useState(today);

  // Dimension filters
  const [filterClient, setFilterClient] = useState('');
  const [filterVehicule, setFilterVehicule] = useState('');
  const [filterChauffeur, setFilterChauffeur] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');

  // Dropdown datasets
  const [clients, setClients] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cRes, vRes, chRes, tRes, catRes] = await Promise.all([
          clientService.getClients({ page: 1, limit: 300 }).catch(() => ({ data: [] })),
          vehiculeService.getVehicules({ page: 1, limit: 200 }).catch(() => ({ data: [] })),
          chauffeurService.getChauffeurs({ page: 1, limit: 200 }).catch(() => ({ data: [] })),
          typePrestationService.getTypesPrestations().catch(() => ({ data: [] })),
          categorieDepenseService.getCategories().catch(() => ({ data: [] })),
        ]);
        setClients(Array.isArray(cRes.data) ? cRes.data : Array.isArray(cRes) ? cRes : []);
        setVehicules(Array.isArray(vRes.data) ? vRes.data : Array.isArray(vRes) ? vRes : []);
        setChauffeurs(Array.isArray(chRes.data) ? chRes.data : Array.isArray(chRes) ? chRes : []);
        setTypes(Array.isArray(tRes.data) ? tRes.data : Array.isArray(tRes) ? tRes : []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : Array.isArray(catRes) ? catRes : []);
      } catch {}
    };
    fetchDropdowns();
  }, []);

  const handleCategoryChange = (cat) => {
    setMainCategory(cat);
    if (cat === 'activites') {
      setSelectedReport('liste_activites');
    } else {
      setSelectedReport('balance_financiere');
    }
    setReportData([]);
  };

  const handleQuickPeriod = (period) => {
    const now = new Date();
    if (period === 'month') {
      setDateFrom(firstDayOfMonth);
      setDateTo(today);
    } else if (period === 'last_month') {
      const prevMonthFirst = toDateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const prevMonthLast = toDateStr(new Date(now.getFullYear(), now.getMonth(), 0));
      setDateFrom(prevMonthFirst);
      setDateTo(prevMonthLast);
    } else if (period === 'year') {
      setDateFrom(firstDayOfYear);
      setDateTo(today);
    } else if (period === 'all') {
      setDateFrom('');
      setDateTo('');
    }
  };

  // Generate Report Engine
  const generateReport = useCallback(async () => {
    setLoading(true);
    setError('');
    setReportData([]);

    try {
      if (mainCategory === 'activites') {
        const actRes = await activiteService.getActivites({ page: 1, limit: 1000 });
        let items = Array.isArray(actRes.data) ? actRes.data : Array.isArray(actRes) ? actRes : [];

        // Apply filters
        if (dateFrom) items = items.filter((a) => a.date_activite >= dateFrom);
        if (dateTo) items = items.filter((a) => a.date_activite <= dateTo + 'T23:59:59');
        if (filterClient) items = items.filter((a) => a.client?.id === filterClient);
        if (filterVehicule) items = items.filter((a) => (a.immatriculation || a.vehicule?.immatriculation) === filterVehicule);
        if (filterChauffeur) items = items.filter((a) => a.chauffeur?.id === filterChauffeur);
        if (filterType) items = items.filter((a) => a.type_prestation?.code === filterType || a.type_prestation?.libelle === filterType);

        if (selectedReport === 'liste_activites') {
          setReportData(items);
        } else if (selectedReport === 'par_client') {
          // Aggregate by client
          const grouped = {};
          items.forEach((a) => {
            const cId = a.client?.id || 'inconnu';
            const cName = a.client ? `${a.client.nom} ${a.client.prenom || ''}`.trim() : 'Client non renseigné';
            if (!grouped[cId]) {
              grouped[cId] = { id: cId, nom: cName, telephone: a.client?.telephone || '-', nbActivites: 0, totalPrix: 0, totalAvance: 0, totalReste: 0 };
            }
            grouped[cId].nbActivites += 1;
            grouped[cId].totalPrix += Number(a.prix || 0);
            grouped[cId].totalAvance += Number(a.avance || 0);
            grouped[cId].totalReste += Number(a.reste_a_payer || 0);
          });
          setReportData(Object.values(grouped).sort((a, b) => b.totalPrix - a.totalPrix));
        } else if (selectedReport === 'par_vehicule') {
          // Aggregate by vehicle
          const grouped = {};
          items.forEach((a) => {
            const immat = a.immatriculation || a.vehicule?.immatriculation || 'Non affecté';
            if (!grouped[immat]) {
              grouped[immat] = { immatriculation: immat, marque: a.vehicule?.marque || '-', modele: a.vehicule?.modele || '-', nbActivites: 0, totalChiffreAffaires: 0 };
            }
            grouped[immat].nbActivites += 1;
            grouped[immat].totalChiffreAffaires += Number(a.prix || 0);
          });
          setReportData(Object.values(grouped).sort((a, b) => b.totalChiffreAffaires - a.totalChiffreAffaires));
        } else if (selectedReport === 'par_chauffeur') {
          // Aggregate by chauffeur
          const grouped = {};
          items.forEach((a) => {
            const chId = a.chauffeur?.id || a.matricule_chauffeur || 'non_affecte';
            const chNom = a.chauffeur ? `${a.chauffeur.nom} ${a.chauffeur.prenom || ''}`.trim() : a.matricule_chauffeur || 'Non affecté';
            if (!grouped[chId]) {
              grouped[chId] = { id: chId, nom: chNom, matricule: a.chauffeur?.matricule || '-', nbActivites: 0, totalChiffreAffaires: 0 };
            }
            grouped[chId].nbActivites += 1;
            grouped[chId].totalChiffreAffaires += Number(a.prix || 0);
          });
          setReportData(Object.values(grouped).sort((a, b) => b.totalChiffreAffaires - a.totalChiffreAffaires));
        } else if (selectedReport === 'par_type') {
          // Aggregate by type de prestation
          const grouped = {};
          items.forEach((a) => {
            const code = a.type_prestation?.code || a.type_prestation_code || 'AUT';
            const lib = a.type_prestation?.libelle || 'Autre';
            if (!grouped[code]) {
              grouped[code] = { code, libelle: lib, nbActivites: 0, totalPrix: 0, totalAvance: 0, totalReste: 0 };
            }
            grouped[code].nbActivites += 1;
            grouped[code].totalPrix += Number(a.prix || 0);
            grouped[code].totalAvance += Number(a.avance || 0);
            grouped[code].totalReste += Number(a.reste_a_payer || 0);
          });
          setReportData(Object.values(grouped).sort((a, b) => b.totalPrix - a.totalPrix));
        }
      } else {
        // Financial Reports
        if (selectedReport === 'balance_financiere') {
          const [recRes, depRes] = await Promise.all([
            recetteService.getRecettes({ page: 1, limit: 1000 }).catch(() => ({ data: [] })),
            depenseService.getDepenses({ page: 1, limit: 1000 }).catch(() => ({ data: [] })),
          ]);
          let recs = Array.isArray(recRes.data) ? recRes.data : [];
          let deps = Array.isArray(depRes.data) ? depRes.data : [];
          if (dateFrom) {
            recs = recs.filter((r) => r.date_recette >= dateFrom);
            deps = deps.filter((d) => d.date_depense >= dateFrom);
          }
          if (dateTo) {
            recs = recs.filter((r) => r.date_recette <= dateTo);
            deps = deps.filter((d) => d.date_depense <= dateTo);
          }
          const totalRec = recs.reduce((s, r) => s + Number(r.montant || 0), 0);
          const totalDep = deps.reduce((s, d) => s + Number(d.montant || 0), 0);
          const soldeNet = totalRec - totalDep;

          // Build summary rows
          const rows = [
            { category: 'Recettes d\'exploitation (Encaissements)', count: recs.length, montant: totalRec, type: 'RECETTE' },
            { category: 'Dépenses d\'exploitation (Décaissements)', count: deps.length, montant: totalDep, type: 'DEPENSE' },
            { category: 'RÉSULTAT NET / BALANCE FINANCIÈRE', count: recs.length + deps.length, montant: soldeNet, type: 'SOLDE' },
          ];
          setReportData(rows);
        } else if (selectedReport === 'liste_recettes') {
          const res = await recetteService.getRecettes({ page: 1, limit: 1000 });
          let items = Array.isArray(res.data) ? res.data : [];
          if (dateFrom) items = items.filter((r) => r.date_recette >= dateFrom);
          if (dateTo) items = items.filter((r) => r.date_recette <= dateTo);
          if (filterType) items = items.filter((r) => r.type_prestation === filterType);
          setReportData(items);
        } else if (selectedReport === 'recettes_par_prestation') {
          const res = await recetteService.getRecettes({ page: 1, limit: 1000 });
          let items = Array.isArray(res.data) ? res.data : [];
          if (dateFrom) items = items.filter((r) => r.date_recette >= dateFrom);
          if (dateTo) items = items.filter((r) => r.date_recette <= dateTo);

          const totalOverall = items.reduce((s, r) => s + Number(r.montant || 0), 0);
          const grouped = {};
          items.forEach((r) => {
            const type = r.type_prestation || 'Non spécifié';
            if (!grouped[type]) {
              grouped[type] = { type_prestation: type, nbRecettes: 0, montantTotal: 0 };
            }
            grouped[type].nbRecettes += 1;
            grouped[type].montantTotal += Number(r.montant || 0);
          });
          const rows = Object.values(grouped).map((g) => ({
            ...g,
            pourcentage: totalOverall > 0 ? ((g.montantTotal / totalOverall) * 100).toFixed(1) + ' %' : '0 %',
          })).sort((a, b) => b.montantTotal - a.montantTotal);
          setReportData(rows);
        } else if (selectedReport === 'liste_depenses') {
          const res = await depenseService.getDepenses({ page: 1, limit: 1000 });
          let items = Array.isArray(res.data) ? res.data : [];
          if (dateFrom) items = items.filter((d) => d.date_depense >= dateFrom);
          if (dateTo) items = items.filter((d) => d.date_depense <= dateTo);
          if (filterCategorie) items = items.filter((d) => d.categorie?.id === filterCategorie || d.categorie_id === filterCategorie);
          if (filterVehicule) items = items.filter((d) => d.immatriculation === filterVehicule);
          setReportData(items);
        } else if (selectedReport === 'depenses_par_categorie') {
          const res = await depenseService.getDepenses({ page: 1, limit: 1000 });
          let items = Array.isArray(res.data) ? res.data : [];
          if (dateFrom) items = items.filter((d) => d.date_depense >= dateFrom);
          if (dateTo) items = items.filter((d) => d.date_depense <= dateTo);

          const totalOverall = items.reduce((s, d) => s + Number(d.montant || 0), 0);
          const grouped = {};
          items.forEach((d) => {
            const cat = d.categorie?.libelle || 'Général';
            const famille = d.categorie?.famille || 'Autres';
            if (!grouped[cat]) {
              grouped[cat] = { categorie: cat, famille, nbDepenses: 0, montantTotal: 0 };
            }
            grouped[cat].nbDepenses += 1;
            grouped[cat].montantTotal += Number(d.montant || 0);
          });
          const rows = Object.values(grouped).map((g) => ({
            ...g,
            pourcentage: totalOverall > 0 ? ((g.montantTotal / totalOverall) * 100).toFixed(1) + ' %' : '0 %',
          })).sort((a, b) => b.montantTotal - a.montantTotal);
          setReportData(rows);
        } else if (selectedReport === 'depenses_par_vehicule') {
          const res = await depenseService.getDepenses({ page: 1, limit: 1000 });
          let items = Array.isArray(res.data) ? res.data : [];
          if (dateFrom) items = items.filter((d) => d.date_depense >= dateFrom);
          if (dateTo) items = items.filter((d) => d.date_depense <= dateTo);
          if (filterVehicule) items = items.filter((d) => d.immatriculation === filterVehicule);

          const grouped = {};
          items.forEach((d) => {
            const immat = d.immatriculation || 'Frais généraux (sans véhicule)';
            if (!grouped[immat]) {
              grouped[immat] = { immatriculation: immat, nbDepenses: 0, montantTotal: 0 };
            }
            grouped[immat].nbDepenses += 1;
            grouped[immat].montantTotal += Number(d.montant || 0);
          });
          setReportData(Object.values(grouped).sort((a, b) => b.montantTotal - a.montantTotal));
        } else if (selectedReport === 'situation_caisse') {
          const res = await caisseService.getMouvements({ page: 1, limit: 1000 });
          let items = Array.isArray(res.data) ? res.data : [];
          if (dateFrom) items = items.filter((m) => m.date_mouvement >= dateFrom);
          if (dateTo) items = items.filter((m) => m.date_mouvement <= dateTo + 'T23:59:59');
          setReportData(items);
        } else if (selectedReport === 'impayes') {
          const res = await activiteService.getActivites({ page: 1, limit: 1000 });
          let items = Array.isArray(res.data) ? res.data : [];
          items = items.filter((a) => Number(a.reste_a_payer) > 0 && a.statut !== 'ANNULEE');
          if (filterClient) items = items.filter((a) => a.client?.id === filterClient);
          setReportData(items.sort((a, b) => Number(b.reste_a_payer) - Number(a.reste_a_payer)));
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  }, [
    mainCategory,
    selectedReport,
    dateFrom,
    dateTo,
    filterClient,
    filterVehicule,
    filterChauffeur,
    filterType,
    filterCategorie,
  ]);

  // Define Columns dynamically according to the active report
  const reportColumns = useMemo(() => {
    switch (selectedReport) {
      case 'liste_activites':
        return [
          { header: 'Date', export: (r) => formatDate(r.date_activite), render: (r) => <span className="text-xs">{formatDate(r.date_activite)}</span> },
          { header: 'Client', export: (r) => `${r.client?.nom || ''} ${r.client?.prenom || ''}`.trim(), render: (r) => <span className="text-xs font-semibold">{r.client?.nom} {r.client?.prenom}</span> },
          { header: 'Prestation', export: (r) => r.type_prestation?.libelle || r.type_prestation_code || '', render: (r) => <span className="text-xs font-medium text-blue-700">{r.type_prestation?.libelle || r.type_prestation_code}</span> },
          { header: 'Destination', export: (r) => r.destination || '', render: (r) => <span className="text-xs">{r.destination || '-'}</span> },
          { header: 'Véhicule', export: (r) => r.immatriculation || r.vehicule?.immatriculation || '', render: (r) => <span className="text-xs font-mono">{r.immatriculation || r.vehicule?.immatriculation || '-'}</span> },
          { header: 'Chauffeur', export: (r) => r.chauffeur ? `${r.chauffeur.nom} ${r.chauffeur.prenom || ''}` : r.matricule_chauffeur || '', render: (r) => <span className="text-xs">{r.chauffeur ? `${r.chauffeur.nom} ${r.chauffeur.prenom || ''}` : r.matricule_chauffeur || '-'}</span> },
          { header: 'Prix convenu', export: (r) => Number(r.prix), render: (r) => <span className="text-xs font-bold text-slate-900">{formatCurrency(r.prix)}</span> },
          { header: 'Avance payée', export: (r) => Number(r.avance), render: (r) => <span className="text-xs text-emerald-600 font-medium">{formatCurrency(r.avance)}</span> },
          { header: 'Reste à payer', export: (r) => Number(r.reste_a_payer), render: (r) => <span className={`text-xs font-bold ${Number(r.reste_a_payer) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{formatCurrency(r.reste_a_payer)}</span> },
          {
            header: 'Statut', export: (r) => r.statut, render: (r) => {
              const badge = getActiviteStatusBadge(r.statut);
              return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.classes}`}>{badge.label}</span>;
            }
          },
        ];

      case 'par_client':
        return [
          { header: 'Client', export: (r) => r.nom, render: (r) => <span className="font-semibold text-xs text-slate-900">{r.nom}</span> },
          { header: 'Téléphone', export: (r) => r.telephone, render: (r) => <span className="text-xs font-mono text-slate-600">{r.telephone}</span> },
          { header: 'Courses', export: (r) => r.nbActivites, render: (r) => <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{r.nbActivites}</span> },
          { header: 'Total convenu', export: (r) => r.totalPrix, render: (r) => <span className="text-xs font-bold text-slate-900">{formatCurrency(r.totalPrix)}</span> },
          { header: 'Total payé', export: (r) => r.totalAvance, render: (r) => <span className="text-xs text-emerald-600 font-medium">{formatCurrency(r.totalAvance)}</span> },
          { header: 'Impayés restants', export: (r) => r.totalReste, render: (r) => <span className={`text-xs font-bold ${r.totalReste > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{formatCurrency(r.totalReste)}</span> },
        ];

      case 'par_vehicule':
        return [
          { header: 'Immatriculation', export: (r) => r.immatriculation, render: (r) => <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">{r.immatriculation}</span> },
          { header: 'Marque & Modèle', export: (r) => `${r.marque} ${r.modele}`, render: (r) => <span className="text-xs text-slate-700">{r.marque} {r.modele}</span> },
          { header: 'Courses réalisées', export: (r) => r.nbActivites, render: (r) => <span className="text-xs font-bold text-blue-700">{r.nbActivites}</span> },
          { header: 'Chiffre d\'affaires généré', export: (r) => r.totalChiffreAffaires, render: (r) => <span className="text-xs font-bold text-emerald-600">{formatCurrency(r.totalChiffreAffaires)}</span> },
        ];

      case 'par_chauffeur':
        return [
          { header: 'Nom du chauffeur', export: (r) => r.nom, render: (r) => <span className="font-semibold text-xs text-slate-900">{r.nom}</span> },
          { header: 'Matricule', export: (r) => r.matricule, render: (r) => <span className="text-xs font-mono text-slate-600">{r.matricule}</span> },
          { header: 'Courses affectées', export: (r) => r.nbActivites, render: (r) => <span className="text-xs font-bold text-blue-700">{r.nbActivites}</span> },
          { header: 'Chiffre d\'affaires lié', export: (r) => r.totalChiffreAffaires, render: (r) => <span className="text-xs font-bold text-emerald-600">{formatCurrency(r.totalChiffreAffaires)}</span> },
        ];

      case 'par_type':
        return [
          { header: 'Code', export: (r) => r.code, render: (r) => <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">{r.code}</span> },
          { header: 'Type de prestation', export: (r) => r.libelle, render: (r) => <span className="text-xs font-semibold text-slate-900">{r.libelle}</span> },
          { header: 'Nombre de courses', export: (r) => r.nbActivites, render: (r) => <span className="text-xs font-bold text-blue-700">{r.nbActivites}</span> },
          { header: 'Montant total', export: (r) => r.totalPrix, render: (r) => <span className="text-xs font-bold text-slate-900">{formatCurrency(r.totalPrix)}</span> },
          { header: 'Encaissé', export: (r) => r.totalAvance, render: (r) => <span className="text-xs text-emerald-600 font-medium">{formatCurrency(r.totalAvance)}</span> },
          { header: 'Reste dû', export: (r) => r.totalReste, render: (r) => <span className={`text-xs font-bold ${r.totalReste > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{formatCurrency(r.totalReste)}</span> },
        ];

      case 'balance_financiere':
        return [
          { header: 'Catégorie de Flux', export: (r) => r.category, render: (r) => <span className="text-xs font-bold text-slate-900">{r.category}</span> },
          { header: 'Nombre d\'opérations', export: (r) => r.count, render: (r) => <span className="text-xs font-medium text-slate-600">{r.count}</span> },
          {
            header: 'Montant net', export: (r) => r.montant, render: (r) => (
              <span className={`text-sm font-bold ${r.type === 'RECETTE' ? 'text-emerald-600' : r.type === 'DEPENSE' ? 'text-rose-600' : r.montant >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                {r.type === 'RECETTE' ? '+ ' : r.type === 'DEPENSE' ? '- ' : ''}{formatCurrency(r.montant)}
              </span>
            )
          },
        ];

      case 'liste_recettes':
        return [
          { header: 'Date', export: (r) => formatDate(r.date_recette), render: (r) => <span className="text-xs">{formatDate(r.date_recette)}</span> },
          { header: 'Prestation', export: (r) => r.type_prestation || 'Transport', render: (r) => <span className="text-xs font-semibold text-slate-900">{r.type_prestation || 'Transport'}</span> },
          { header: 'Montant encaissé', export: (r) => Number(r.montant), render: (r) => <span className="text-xs font-bold text-emerald-600">+ {formatCurrency(r.montant)}</span> },
          { header: 'Mode de paiement', export: (r) => r.mode_paiement || 'Espèces', render: (r) => <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">{r.mode_paiement || 'Espèces'}</span> },
          { header: 'Référence', export: (r) => r.reference || '-', render: (r) => <span className="text-xs font-mono text-slate-500">{r.reference || '-'}</span> },
          { header: 'Agent', export: (r) => r.user?.nom_utilisateur || 'Admin', render: (r) => <span className="text-xs text-slate-600">{r.user?.nom_utilisateur || 'Admin'}</span> },
        ];

      case 'recettes_par_prestation':
        return [
          { header: 'Type de prestation', export: (r) => r.type_prestation, render: (r) => <span className="text-xs font-bold text-slate-900">{r.type_prestation}</span> },
          { header: 'Nombre d\'encaissements', export: (r) => r.nbRecettes, render: (r) => <span className="text-xs text-slate-600">{r.nbRecettes}</span> },
          { header: 'Chiffre d\'affaires total', export: (r) => r.montantTotal, render: (r) => <span className="text-xs font-bold text-emerald-600">{formatCurrency(r.montantTotal)}</span> },
          { header: 'Part dans le CA', export: (r) => r.pourcentage, render: (r) => <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{r.pourcentage}</span> },
        ];

      case 'liste_depenses':
        return [
          { header: 'Date', export: (r) => formatDate(r.date_depense), render: (r) => <span className="text-xs">{formatDate(r.date_depense)}</span> },
          { header: 'Catégorie', export: (r) => r.categorie?.libelle || 'Général', render: (r) => <span className="text-xs font-semibold text-slate-900">{r.categorie?.libelle || 'Général'}</span> },
          { header: 'Description', export: (r) => r.description, render: (r) => <span className="text-xs text-slate-700">{r.description}</span> },
          { header: 'Véhicule concerné', export: (r) => r.immatriculation || 'Frais généraux', render: (r) => <span className="text-xs font-mono text-slate-600">{r.immatriculation || 'Frais généraux'}</span> },
          { header: 'Montant décaissé', export: (r) => Number(r.montant), render: (r) => <span className="text-xs font-bold text-rose-600">- {formatCurrency(r.montant)}</span> },
          { header: 'Fournisseur / Réf', export: (r) => r.fournisseur || r.reference || '-', render: (r) => <span className="text-xs text-slate-500">{r.fournisseur || r.reference || '-'}</span> },
        ];

      case 'depenses_par_categorie':
        return [
          { header: 'Catégorie de dépense', export: (r) => r.categorie, render: (r) => <span className="text-xs font-bold text-slate-900">{r.categorie}</span> },
          { header: 'Famille de coût', export: (r) => r.famille, render: (r) => <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{r.famille}</span> },
          { header: 'Nombre de dépenses', export: (r) => r.nbDepenses, render: (r) => <span className="text-xs text-slate-600">{r.nbDepenses}</span> },
          { header: 'Montant total', export: (r) => r.montantTotal, render: (r) => <span className="text-xs font-bold text-rose-600">- {formatCurrency(r.montantTotal)}</span> },
          { header: 'Part des dépenses', export: (r) => r.pourcentage, render: (r) => <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">{r.pourcentage}</span> },
        ];

      case 'depenses_par_vehicule':
        return [
          { header: 'Véhicule', export: (r) => r.immatriculation, render: (r) => <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">{r.immatriculation}</span> },
          { header: 'Nombre d\'interventions', export: (r) => r.nbDepenses, render: (r) => <span className="text-xs text-slate-600">{r.nbDepenses}</span> },
          { header: 'Coût d\'exploitation total', export: (r) => r.montantTotal, render: (r) => <span className="text-xs font-bold text-rose-600">- {formatCurrency(r.montantTotal)}</span> },
        ];

      case 'situation_caisse':
        return [
          { header: 'Date & Heure', export: (r) => formatDateTime(r.date_mouvement), render: (r) => <span className="text-xs font-mono text-slate-600">{formatDateTime(r.date_mouvement)}</span> },
          {
            header: 'Mouvement', export: (r) => r.type_mouvement, render: (r) => (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${r.type_mouvement === 'ENTREE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {r.type_mouvement === 'ENTREE' ? 'ENTRÉE (+)' : 'SORTIE (-)'}
              </span>
            )
          },
          { header: 'Source / Motif', export: (r) => r.source, render: (r) => <span className="text-xs font-medium text-slate-900">{r.source}</span> },
          {
            header: 'Montant', export: (r) => Number(r.montant), render: (r) => (
              <span className={`text-xs font-bold ${r.type_mouvement === 'ENTREE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {r.type_mouvement === 'ENTREE' ? '+' : '-'} {formatCurrency(r.montant)}
              </span>
            )
          },
          { header: 'Solde après mouvement', export: (r) => Number(r.solde_apres), render: (r) => <span className="text-xs font-bold text-slate-900">{formatCurrency(r.solde_apres)}</span> },
        ];

      case 'impayes':
        return [
          { header: 'Client', export: (r) => `${r.client?.nom || ''} ${r.client?.prenom || ''}`.trim(), render: (r) => <span className="text-xs font-bold text-slate-900">{r.client?.nom} {r.client?.prenom}</span> },
          { header: 'Téléphone', export: (r) => r.client?.telephone || '-', render: (r) => <span className="text-xs font-mono text-slate-600">{r.client?.telephone || '-'}</span> },
          { header: 'Prestation', export: (r) => r.type_prestation?.libelle || r.type_prestation_code || 'Prestation', render: (r) => <span className="text-xs text-blue-700">{r.type_prestation?.libelle || r.type_prestation_code}</span> },
          { header: 'Date', export: (r) => formatDate(r.date_activite), render: (r) => <span className="text-xs text-slate-500">{formatDate(r.date_activite)}</span> },
          { header: 'Prix convenu', export: (r) => Number(r.prix), render: (r) => <span className="text-xs font-medium text-slate-800">{formatCurrency(r.prix)}</span> },
          { header: 'Avance payée', export: (r) => Number(r.avance), render: (r) => <span className="text-xs text-emerald-600 font-medium">{formatCurrency(r.avance)}</span> },
          { header: 'Reste à recevoir', export: (r) => Number(r.reste_a_payer), render: (r) => <span className="text-xs font-bold text-rose-600">{formatCurrency(r.reste_a_payer)}</span> },
        ];

      default:
        return [];
    }
  }, [selectedReport]);

  // Executive Summary Cards
  const summaryCards = useMemo(() => {
    if (!reportData.length) return null;

    if (selectedReport === 'liste_activites') {
      const totalCA = reportData.reduce((s, r) => s + Number(r.prix || 0), 0);
      const totalPaye = reportData.reduce((s, r) => s + Number(r.avance || 0), 0);
      const totalReste = reportData.reduce((s, r) => s + Number(r.reste_a_payer || 0), 0);
      return [
        { label: 'Total Activités', value: reportData.length },
        { label: 'Chiffre d\'affaires total', value: formatCurrency(totalCA), color: 'blue' },
        { label: 'Total Encaissé', value: formatCurrency(totalPaye), color: 'emerald' },
        { label: 'Reste à encaisser', value: formatCurrency(totalReste), color: totalReste > 0 ? 'rose' : 'slate' },
      ];
    }
    if (selectedReport === 'balance_financiere') {
      const rec = reportData.find((r) => r.type === 'RECETTE')?.montant || 0;
      const dep = reportData.find((r) => r.type === 'DEPENSE')?.montant || 0;
      const net = reportData.find((r) => r.type === 'SOLDE')?.montant || 0;
      return [
        { label: 'Total Recettes (+)', value: formatCurrency(rec), color: 'emerald' },
        { label: 'Total Dépenses (-)', value: formatCurrency(dep), color: 'rose' },
        { label: 'Résultat Net / Balance', value: formatCurrency(net), color: net >= 0 ? 'blue' : 'rose' },
      ];
    }
    if (selectedReport === 'liste_recettes' || selectedReport === 'recettes_par_prestation') {
      const total = reportData.reduce((s, r) => s + Number(r.montant || r.montantTotal || 0), 0);
      return [
        { label: 'Total Recettes', value: reportData.length },
        { label: 'Montant total encaissé', value: formatCurrency(total), color: 'emerald' },
      ];
    }
    if (selectedReport === 'liste_depenses' || selectedReport === 'depenses_par_categorie' || selectedReport === 'depenses_par_vehicule') {
      const total = reportData.reduce((s, r) => s + Number(r.montant || r.montantTotal || 0), 0);
      return [
        { label: 'Lignes de dépenses', value: reportData.length },
        { label: 'Montant total décaissé', value: formatCurrency(total), color: 'rose' },
      ];
    }
    if (selectedReport === 'impayes') {
      const totalImpayes = reportData.reduce((s, r) => s + Number(r.reste_a_payer || 0), 0);
      return [
        { label: 'Clients débiteurs', value: reportData.length },
        { label: 'Total créances à recevoir', value: formatCurrency(totalImpayes), color: 'rose' },
      ];
    }
    return null;
  }, [reportData, selectedReport]);

  // Export to PDF
  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const activeSubList = mainCategory === 'activites' ? ACTIVITE_REPORTS : FINANCE_REPORTS;
      const reportTitle = activeSubList.find((r) => r.key === selectedReport)?.label || 'Rapport';

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Header Branding
      doc.setFillColor(30, 58, 138); // blue-900
      doc.rect(0, 0, 297, 22, 'F');

      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('MENDRIKA TRANSPORT — SYSTÈME DE GESTION', 14, 14);

      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text(reportTitle.toUpperCase(), 14, 32);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const periodeLabel = dateFrom && dateTo ? `Période du ${formatDate(dateFrom)} au ${formatDate(dateTo)}` : 'Période : Historique complet';
      doc.text(`${periodeLabel}   |   Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 38);

      const tableHeaders = reportColumns.map((col) => col.header);
      const tableRows = reportData.map((item) =>
        reportColumns.map((col) => {
          const val = col.export ? col.export(item) : '';
          return typeof val === 'number' ? formatCurrency(val) : String(val ?? '');
        }),
      );

      autoTable(doc, {
        startY: 44,
        head: [tableHeaders],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [37, 99, 235], // blue-600
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          overflow: 'linebreak',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      // Footer Summary in PDF
      if (summaryCards && summaryCards.length > 0) {
        const finalY = (doc.lastAutoTable?.finalY || 180) + 8;
        if (finalY < 190) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          const summaryStr = summaryCards.map((c) => `${c.label}: ${c.value}`).join('   |   ');
          doc.text(`SYNTHÈSE : ${summaryStr}`, 14, finalY);
        }
      }

      const fileDate = dateFrom ? `${dateFrom}_${dateTo}` : 'complet';
      doc.save(`Mendrika_${selectedReport}_${fileDate}.pdf`);
    } catch (err) {
      setError('Erreur lors de l\'exportation PDF : ' + err.message);
    }
  };

  // Export to Excel
  const exportExcel = async () => {
    try {
      const { default: XLSX } = await import('xlsx');

      const headers = reportColumns.map((col) => col.header);
      const rows = reportData.map((item) =>
        reportColumns.map((col) => {
          const val = col.export ? col.export(item) : '';
          return val ?? '';
        }),
      );

      const ws_data = [
        [`MENDRIKA TRANSPORT — ${selectedReport.toUpperCase()}`],
        [`Période: ${dateFrom || 'Début'} au ${dateTo || 'Fin'}`],
        [],
        headers,
        ...rows,
      ];

      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport');

      const fileDate = dateFrom ? `${dateFrom}_${dateTo}` : 'complet';
      XLSX.writeFile(wb, `Mendrika_${selectedReport}_${fileDate}.xlsx`);
    } catch (err) {
      setError('Erreur lors de l\'exportation Excel : ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports & Analyses"
        subtitle="Produisez l'ensemble des rapports d'activités et financiers avec export instantané PDF et Excel."
      />

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* 1. Catégorie Principale (CDC §21) */}
      <div className="flex border-b border-slate-200">
        {MAIN_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = mainCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategoryChange(cat.key)}
              className={`flex items-center gap-2.5 px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Sous-rapports conformes au CDC §21 */}
      <div className="flex flex-wrap gap-2">
        {(mainCategory === 'activites' ? ACTIVITE_REPORTS : FINANCE_REPORTS).map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.key;
          return (
            <button
              key={rep.key}
              type="button"
              onClick={() => {
                setSelectedReport(rep.key);
                setReportData([]);
              }}
              className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{rep.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Zone de Filtrage & Période */}
      <Card bodyClassName="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Période rapide :
            </span>
            <button
              type="button"
              onClick={() => handleQuickPeriod('month')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700 cursor-pointer"
            >
              Ce mois
            </button>
            <button
              type="button"
              onClick={() => handleQuickPeriod('last_month')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700 cursor-pointer"
            >
              Mois dernier
            </button>
            <button
              type="button"
              onClick={() => handleQuickPeriod('year')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700 cursor-pointer"
            >
              Cette année
            </button>
            <button
              type="button"
              onClick={() => handleQuickPeriod('all')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700 cursor-pointer"
            >
              Tout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <Input
            label="Date de début"
            name="from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="Date de fin"
            name="to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />

          {/* Contextual Filters */}
          {(selectedReport === 'liste_activites' || selectedReport === 'impayes') && (
            <Select
              label="Filtrer par Client"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              placeholder="Tous les clients..."
              options={clients.map((c) => ({ value: c.id, label: `${c.nom} ${c.prenom || ''}` }))}
            />
          )}

          {(selectedReport === 'liste_activites' || selectedReport === 'liste_depenses' || selectedReport === 'depenses_par_vehicule') && (
            <Select
              label="Filtrer par Véhicule"
              value={filterVehicule}
              onChange={(e) => setFilterVehicule(e.target.value)}
              placeholder="Tous les véhicules..."
              options={vehicules.map((v) => ({ value: v.immatriculation, label: `${v.immatriculation} (${v.marque} ${v.modele})` }))}
            />
          )}

          {selectedReport === 'liste_activites' && (
            <>
              <Select
                label="Filtrer par Chauffeur"
                value={filterChauffeur}
                onChange={(e) => setFilterChauffeur(e.target.value)}
                placeholder="Tous les chauffeurs..."
                options={chauffeurs.map((c) => ({ value: c.id, label: `${c.nom} ${c.prenom || ''}` }))}
              />
              <Select
                label="Type de prestation"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                placeholder="Tous les types..."
                options={types.map((t) => ({ value: t.libelle, label: t.libelle }))}
              />
            </>
          )}

          {selectedReport === 'recettes_par_prestation' && (
            <Select
              label="Type de prestation"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              placeholder="Tous les types..."
              options={types.map((t) => ({ value: t.libelle, label: t.libelle }))}
            />
          )}

          {selectedReport === 'liste_depenses' && (
            <Select
              label="Filtrer par Catégorie"
              value={filterCategorie}
              onChange={(e) => setFilterCategorie(e.target.value)}
              placeholder="Toutes les catégories..."
              options={categories.map((cat) => ({ value: cat.id, label: `${cat.libelle} (${cat.famille || 'Général'})` }))}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Button variant="primary" icon={Filter} onClick={generateReport} loading={loading}>
            Générer le rapport
          </Button>

          {reportData.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={exportExcel}>
                Export Excel (.xlsx)
              </Button>
              <Button variant="outline" size="sm" icon={Download} onClick={exportPDF}>
                Export PDF
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 4. Cartes Récapitulatives Synthétiques */}
      {summaryCards && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summaryCards.map((card, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{card.label}</p>
              <p className={`text-lg font-bold mt-1 ${
                card.color === 'emerald' ? 'text-emerald-600' :
                card.color === 'rose' ? 'text-rose-600' :
                card.color === 'blue' ? 'text-blue-600' : 'text-slate-900'
              }`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 5. Tableau des résultats */}
      {loading ? (
        <Loader message="Calcul et génération du rapport en cours..." />
      ) : reportData.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{reportData.length} élément(s) répertorié(s)</span>
          </div>
          <Table
            columns={reportColumns.map((c) => ({ header: c.header, render: c.render }))}
            data={reportData}
            emptyMessage="Aucun résultat pour ces filtres."
          />
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">Sélectionnez le rapport désiré et cliquez sur "Générer le rapport"</p>
          <p className="text-xs text-slate-400 mt-1">Vous pourrez ensuite visualiser les synthèses et télécharger le document en PDF ou Excel.</p>
        </div>
      )}
    </div>
  );
};
