import React, { useState, useEffect, useCallback } from 'react';
import {
  PiggyBank,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  CalendarDays,
  Calendar,
  Check,
  Equal,
  CreditCard,
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Table } from '../components/common/Table.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { caisseService } from '../services/caisseService.js';
import { formatCurrency } from '../utils/formatters.js';

// Helper to format date as DD/MM/YYYY and time as HH:mm
const splitDateTime = (dStr) => {
  if (!dStr) return { date: '-', time: '' };
  try {
    const d = new Date(dStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${mins}`,
    };
  } catch {
    return { date: dStr, time: '' };
  }
};

// Helper to get YYYY-MM-DD string from a local Date
const toDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPeriodRange = (preset) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (preset) {
    case 'all':
      return {
        from: `${y}-01-01`,
        to: `${y}-12-31`,
      };
    case 'today':
      return { from: toDateStr(now), to: toDateStr(now) };
    case 'week': {
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday = 0
      const monday = new Date(now);
      monday.setDate(now.getDate() - day);
      return { from: toDateStr(monday), to: toDateStr(now) };
    }
    case 'month':
      return {
        from: toDateStr(new Date(y, m, 1)),
        to: toDateStr(new Date(y, m + 1, 0)),
      };
    case 'quarter': {
      const q = Math.floor(m / 3);
      return {
        from: toDateStr(new Date(y, q * 3, 1)),
        to: toDateStr(new Date(y, (q + 1) * 3, 0)),
      };
    }
    case 'year':
      return {
        from: toDateStr(new Date(y, 0, 1)),
        to: toDateStr(new Date(y, 11, 31)),
      };
    default:
      return null;
  }
};

const PRESETS = [
  { key: 'all', label: 'Toutes les opérations' },
  { key: 'year', label: 'Cette année' },
  { key: 'month', label: 'Ce mois' },
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: 'Cette semaine' },
  { key: 'quarter', label: 'Ce trimestre' },
];

export const Caisse = () => {
  const now = new Date();
  const y = now.getFullYear();
  const initialRange = getPeriodRange('all');

  const [dateFrom, setDateFrom] = useState(initialRange.from);
  const [dateTo, setDateTo] = useState(initialRange.to);
  const [activePreset, setActivePreset] = useState('all');

  const [mouvements, setMouvements] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [soldeData, setSoldeData] = useState({
    solde: 0,
    solde_actuel: 0,
    recettes_total: 0,
    depenses_total: 0,
  });

  const fetchCaisseData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mouvRes, soldeRes] = await Promise.all([
        caisseService.getMouvements({ page, limit }),
        caisseService.getSolde({ from: dateFrom, to: dateTo }),
      ]);

      const items = Array.isArray(mouvRes.data)
        ? mouvRes.data
        : Array.isArray(mouvRes)
        ? mouvRes
        : [];
      setMouvements(items);
      setTotal(mouvRes.total || items.length);

      const sData = soldeRes.data || soldeRes;
      const latestSoldeFromList = items.length > 0 && items[0]?.solde_apres !== undefined
        ? Number(items[0].solde_apres)
        : null;

      setSoldeData({
        solde: Number(sData.solde) || 0,
        solde_actuel: sData.solde_actuel !== undefined
          ? Number(sData.solde_actuel)
          : (latestSoldeFromList !== null ? latestSoldeFromList : Number(sData.solde) || 0),
        recettes_total: Number(sData.recettes_total) || 0,
        depenses_total: Number(sData.depenses_total) || 0,
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des données de caisse');
    } finally {
      setLoading(false);
    }
  }, [page, limit, dateFrom, dateTo]);

  useEffect(() => {
    fetchCaisseData();
  }, [fetchCaisseData]);

  const handlePreset = (preset) => {
    setActivePreset(preset);
    const range = getPeriodRange(preset);
    if (range) {
      setDateFrom(range.from);
      setDateTo(range.to);
      setPage(1);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setActivePreset(null);
    setPage(1);
    fetchCaisseData();
  };

  const columns = [
    {
      header: 'Type de mouvement',
      render: (m) => {
        const isEntree = m.type_mouvement === 'ENTREE';
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
              isEntree
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}
          >
            {isEntree ? (
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span>{isEntree ? 'Entrée' : 'Sortie'}</span>
          </span>
        );
      },
    },
    {
      header: 'Source / justificatif',
      render: (m) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">
            {m.source?.startsWith('Paiement') || m.type_mouvement === 'ENTREE'
              ? 'Paiement'
              : 'Dépense'}
          </p>
          <p className="text-slate-400 font-mono text-[11px] mt-0.5">
            {m.source}
          </p>
        </div>
      ),
    },
    {
      header: 'Montant (Ar)',
      render: (m) => {
        const isEntree = m.type_mouvement === 'ENTREE';
        return (
          <span
            className={`font-bold text-sm ${
              isEntree ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isEntree ? '+ ' : '- '}
            {formatCurrency(m.montant)}
          </span>
        );
      },
    },
    {
      header: 'Solde après (Ar)',
      render: (m) => (
        <span className="font-bold text-slate-900 text-sm">
          {formatCurrency(m.solde_apres)}
        </span>
      ),
    },
    {
      header: 'Date et heure',
      render: (m) => {
        const dt = splitDateTime(m.date_mouvement);
        return (
          <div className="text-xs text-slate-600">
            <p className="font-medium">{dt.date}</p>
            <p className="text-slate-400 text-[11px]">{dt.time}</p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Journal de caisse &amp; balance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Suivez les flux d'entrées et de sorties. Calculez la balance sur la période de votre choix.
        </p>
      </div>

      {error && <Alert type="danger" message={error} />}

      {/* Period Presets + Custom Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        {/* Quick Preset Buttons */}
        <div>
          <p className="text-xs font-bold text-slate-700 mb-2.5">
            Période rapide
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const isActive = activePreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePreset(p.key)}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#2f54eb] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isActive && <Check className="w-3.5 h-3.5" />}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Range */}
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-col sm:flex-row sm:items-end gap-3 pt-3 border-t border-slate-100"
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Du</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Au</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs bg-[#2f54eb] hover:bg-blue-700 text-white transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Calculer le solde</span>
          </button>
        </form>
      </div>

      {/* Section 1 : Synthèse de caisse */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Synthèse de caisse</h3>
          <span className="text-xs text-slate-500">
            Cumul annuel · Du {dateFrom.split('-').reverse().join('/')} au {dateTo.split('-').reverse().join('/')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 : Solde Actuel en Caisse */}
          <div className="bg-[#1e3a8a] text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-200">
                Solde actuel en caisse
              </p>
              <CreditCard className="w-4 h-4 text-blue-200/80" />
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-extrabold text-white">
                {formatCurrency(soldeData.solde_actuel)}
              </h4>
              <p className="text-[11px] text-blue-200/80 mt-1">
                Trésorerie réelle disponible
              </p>
            </div>
          </div>

          {/* Card 2 : Total des entrées */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">
                Total des entrées
              </p>
              <ArrowDownLeft className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-extrabold text-emerald-600">
                + {formatCurrency(soldeData.recettes_total)}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Sur la période filtrée
              </p>
            </div>
          </div>

          {/* Card 3 : Total des sorties */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">
                Total des sorties
              </p>
              <ArrowUpRight className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-extrabold text-rose-600">
                – {formatCurrency(soldeData.depenses_total)}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Sur la période filtrée
              </p>
            </div>
          </div>

          {/* Card 4 : Balance de la période */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">
                Balance de la période
              </p>
              <Equal className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-extrabold text-emerald-600">
                + {formatCurrency(soldeData.solde)}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Entrées moins sorties · Cumul 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 : Mouvements de caisse */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Mouvements de caisse</h3>
          <span className="text-xs text-slate-500">
            Montants en ariary (Ar) · Du plus récent au plus ancien
          </span>
        </div>

        {loading ? (
          <Loader message="Chargement des mouvements de caisse..." />
        ) : (
          <div className="space-y-2">
            <Table
              columns={columns}
              data={mouvements}
              emptyMessage="Aucun mouvement de caisse pour cette période."
            />
            <Pagination
              currentPage={page}
              totalItems={total}
              pageSize={limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
