import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Briefcase,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/common/Button.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { ROLES } from '../utils/constants.js';
import { authService } from '../services/authService.js';

export const Login = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Formulaire Connexion
  const [loginField, setLoginField] = useState('');
  const [passwordField, setPasswordField] = useState('');

  // Formulaire Inscription directe
  const [regNom, setRegNom] = useState('');
  const [regLogin, setRegLogin] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState(ROLES.ADMINISTRATEUR);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  // Traitement Connexion
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginField.trim() || !passwordField.trim()) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);
      await login({
        login: loginField.trim(),
        mot_de_passe: passwordField,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Identifiants incorrects. Veuillez vérifier vos accès.');
    } finally {
      setLoading(false);
    }
  };

  // Traitement Inscription directe
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regNom.trim()) {
      setError('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!regLogin.trim()) {
      setError('Veuillez choisir un identifiant de connexion.');
      return;
    }
    if (/\s/.test(regLogin.trim())) {
      setError("L'identifiant ne doit pas contenir d'espaces.");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        nom_utilisateur: regNom.trim(),
        login: regLogin.trim(),
        mot_de_passe: regPassword,
        role: regRole,
      });

      const registeredLogin = regLogin.trim();

      // Réinitialiser les champs d'inscription
      setRegNom('');
      setRegLogin('');
      setRegPassword('');
      setRegConfirmPassword('');

      // Pré-remplir la connexion et basculer vers l'onglet connexion
      setLoginField(registeredLogin);
      setPasswordField('');
      setActiveTab('login');
      setSuccess('Compte créé avec succès ! Connectez-vous maintenant avec votre mot de passe.');
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || '';
      if (msg.toLowerCase().includes('existe') || msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
        setError('Cet identifiant est déjà utilisé. Veuillez en choisir un autre.');
      } else {
        setError(msg || 'Erreur lors de la création du compte. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const ROLE_OPTIONS = [
    {
      id: ROLES.ADMINISTRATEUR,
      title: 'Administrateur',
      desc: 'Gestion globale du système. (Les comptes Responsable, Agent et Caissier sont créés par l\'administrateur dans l\'application)',
      accent: 'border-purple-500 bg-purple-500/15 text-purple-300 ring-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* ================= LEFT BRAND HERO PANEL ================= */}
        <div className="lg:col-span-5 bg-[#0c1222] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          <div className="relative z-10 space-y-7">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-2xl font-bold text-white tracking-tight">Mendrika</h1>
                  <span className="text-[10px] font-bold text-cyan-400">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Transport &amp; Logistique
                </p>
              </div>
            </div>

            {/* Platform Headline */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-cyan-400">
                Système de gestion centralisé
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Maîtrisez votre parc et vos finances en temps réel.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Plateforme intégrée pour le suivi des courses, l&apos;optimisation des véhicules et le contrôle strict de la trésorerie.
              </p>
            </div>

            {/* Feature Bullets (clean line style) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 text-xs text-slate-200">
                <Truck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white text-sm">Gestion complète des activités</div>
                  <div className="text-slate-400 text-xs mt-0.5">Locations, transports de marchandises et missions</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-slate-200">
                <TrendingUp className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white text-sm">Suivi financier &amp; rentrées</div>
                  <div className="text-slate-400 text-xs mt-0.5">Recettes, dépenses, encaissements et balance nette</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-slate-200">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white text-sm">Sécurité &amp; rôles métiers</div>
                  <div className="text-slate-400 text-xs mt-0.5">Administrateur, Responsable, Agent, Comptable</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer certification */}
          <div className="pt-8 relative z-10 flex items-center justify-between text-xs text-slate-500">
            <span>© 2026 Mendrika Transport</span>
            <span className="text-xs font-bold text-cyan-400 tracking-wider">
              ITDCMADA
            </span>
          </div>
        </div>

        {/* ================= RIGHT INTERACTIVE FORM PANEL ================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#0c1222]/95">
          <div className="max-w-md w-full mx-auto space-y-6">

            {/* Top Navigation Pill Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#090d18] border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={
                  'py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center ' +
                  (activeTab === 'login'
                    ? 'bg-[#2f54eb] text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-white')
                }
              >
                Se connecter
              </button>

              <button
                type="button"
                onClick={() => switchTab('register')}
                className={
                  'py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center ' +
                  (activeTab === 'register'
                    ? 'bg-[#2f54eb] text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-white')
                }
              >
                Créer un compte
              </button>
            </div>

            {/* Notifications */}
            {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* ================= FORM 1 : SE CONNECTER ================= */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Connexion</h3>
                  <p className="text-xs text-slate-400">
                    Saisissez vos identifiants pour accéder à votre espace de travail.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  {/* Identifiant */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Identifiant de connexion
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={loginField}
                        onChange={(e) => setLoginField(e.target.value)}
                        placeholder="Ex. : jean.rakoto"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordField}
                        onChange={(e) => setPasswordField(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#2f54eb] hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ================= FORM 2 : CRÉER UN COMPTE ================= */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Nouveau compte</h3>
                  <p className="text-xs text-slate-400">
                    Remplissez vos informations pour créer votre accès.
                  </p>
                </div>

                <div className="space-y-3.5 pt-1">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nom complet
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regNom}
                        onChange={(e) => setRegNom(e.target.value)}
                        placeholder="Ex. : Rakoto Jean"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Identifiant */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Identifiant de connexion
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regLogin}
                        onChange={(e) => setRegLogin(e.target.value)}
                        placeholder="Ex. : jean.rakoto"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Mots de passe */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Mot de passe
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Votre mot de passe"
                            className="w-full pl-10 pr-10 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Répétez le mot de passe"
                            className="w-full pl-10 pr-10 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">6 caractères minimum</p>
                  </div>

                  {/* Rôle du compte */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Rôle du compte
                    </label>
                    <div className="p-3.5 rounded-xl border border-blue-600 bg-[#121c38] text-white flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">
                          Administrateur
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                          Gestion globale du système. Les comptes Responsable, Agent et Caissier sont créés par l'administrateur dans l'application.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#2f54eb] hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer mon compte</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};