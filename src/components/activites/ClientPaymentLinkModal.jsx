import React, { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Receipt,
  User,
  Phone,
  Calendar,
  MapPin,
  Car,
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const ClientPaymentLinkModal = ({
  isOpen,
  onClose,
  activite,
  onOpenPayment,
}) => {
  const [copied, setCopied] = useState(false);

  if (!activite) return null;

  const clientName = activite.client
    ? `${activite.client.nom} ${activite.client.prenom || ''}`.trim()
    : 'Client';
  const clientPhone = activite.client?.telephone || '';
  const prestationName =
    activite.type_prestation?.libelle ||
    activite.type_prestation_code ||
    'Prestation de transport';

  const prix = Number(activite.prix) || 0;
  const avance = Number(activite.avance) || 0;
  const reste = Number(activite.reste_a_payer) || 0;
  const isSolde = reste <= 0;

  // Generate direct payment link URL
  const paymentUrl = `${window.location.origin}/paiements?activite_id=${activite.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API fails
      const tempInput = document.createElement('input');
      tempInput.value = paymentUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendWhatsApp = () => {
    const formattedPhone = clientPhone.replace(/\D/g, '');
    const cleanPhone = formattedPhone.startsWith('0')
      ? '261' + formattedPhone.substring(1)
      : formattedPhone;

    const message = `Bonjour ${clientName},
Voici le récapitulatif pour votre prestation "${prestationName}" (Mendrika Transport) :
• Date : ${formatDate(activite.date_activite)}
• Prix total : ${formatCurrency(prix)}
• Avance reçue : ${formatCurrency(avance)}
• Reste à régler : ${formatCurrency(reste)}

Lien de suivi et règlement : ${paymentUrl}
Merci pour votre confiance !`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lien de Paiement & Facturation Client"
      size="lg"
    >
      <div className="space-y-5">
        {/* Résumé de la course & client */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  {prestationName}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Réf: {activite.id.slice(0, 13)}...
                </p>
              </div>
            </div>

            {isSolde ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Entièrement Soldé
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" /> En attente de solde
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-800 font-medium">{clientName}</span>
            </div>
            {clientPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-700">{clientPhone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDate(activite.date_activite)}</span>
            </div>
            {activite.destination && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{activite.destination}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bloc Financier : Total / Avance / Reste */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Prix Total
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {formatCurrency(prix)}
            </p>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
            <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
              Avance Reçue
            </p>
            <p className="text-base sm:text-lg font-bold text-emerald-700 mt-0.5">
              {formatCurrency(avance)}
            </p>
          </div>
          <div
            className={`border rounded-xl p-3 ${
              isSolde
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-rose-50/80 border-rose-200 text-rose-700'
            }`}
          >
            <p className="text-[11px] font-medium uppercase tracking-wider">
              Reste à Payer
            </p>
            <p className="text-base sm:text-lg font-bold mt-0.5">
              {formatCurrency(reste)}
            </p>
          </div>
        </div>

        {/* Boîte Lien de Paiement Client */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Lien direct de paiement & suivi client :
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={paymentUrl}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-white hover:bg-slate-900'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" /> Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copier le lien
                </>
              )}
            </button>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Ouvrir le lien dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          {copied && (
            <p className="text-xs text-emerald-600 font-medium">
              ✓ Le lien de paiement a été copié dans votre presse-papier.
            </p>
          )}
        </div>

        {/* Moyens de communication & Envoi au client */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-950">
            Partage direct au client :
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={MessageCircle}
              onClick={handleSendWhatsApp}
              className="bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700"
            >
              Envoyer par WhatsApp
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={handleCopyLink}
              className="bg-white text-slate-700"
            >
              Copier l'URL
            </Button>
          </div>
          <p className="text-[11px] text-indigo-800/80">
            Permet au client de consulter sa facture, vérifier le montant restant et procéder au versement (MVola, Airtel Money, Orange Money, Espèces).
          </p>
        </div>

        {/* Actions inférieures */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>

          {!isSolde && activite.statut !== 'ANNULEE' && onOpenPayment && (
            <Button
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => {
                onClose();
                onOpenPayment(activite);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Encaisser maintenant ({formatCurrency(reste)})
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
