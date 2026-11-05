import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getActiviteStatusBadge,
  getResourceStatusBadge,
} from './formatters.js';

describe('Formatters Utility', () => {
  describe('formatCurrency', () => {
    it('doit formater un montant valide avec symbole Ar', () => {
      const result = formatCurrency(20000);
      expect(result).toContain('20');
      expect(result).toContain('Ar');
    });

    it('doit retourner "0 Ar" pour null ou undefined', () => {
      expect(formatCurrency(null)).toBe('0 Ar');
      expect(formatCurrency(undefined)).toBe('0 Ar');
      expect(formatCurrency('abc')).toBe('0 Ar');
    });

    it('doit formater correctement 0', () => {
      expect(formatCurrency(0)).toBe('0 Ar');
    });
  });

  describe('formatDate', () => {
    it('doit formater une date valide au format fr-FR JJ/MM/AAAA', () => {
      const formatted = formatDate('2026-09-14');
      expect(formatted).toBe('14/09/2026');
    });

    it('doit retourner "-" pour une date absente', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
      expect(formatDate('')).toBe('-');
    });
  });

  describe('formatDateTime', () => {
    it('doit formater date et heure correctement', () => {
      const formatted = formatDateTime('2026-09-14T10:30:00');
      expect(formatted).toContain('14/09/2026');
      expect(formatted).toContain('10:30');
    });

    it('doit retourner "-" pour null ou vide', () => {
      expect(formatDateTime(null)).toBe('-');
      expect(formatDateTime('')).toBe('-');
    });
  });

  describe('getActiviteStatusBadge', () => {
    it('doit retourner le bon label et style pour EN_ATTENTE', () => {
      const badge = getActiviteStatusBadge('EN_ATTENTE');
      expect(badge.label).toBe('En attente');
      expect(badge.classes).toContain('amber');
    });

    it('doit retourner le bon label et style pour TERMINEE', () => {
      const badge = getActiviteStatusBadge('TERMINEE');
      expect(badge.label).toBe('Terminée');
      expect(badge.classes).toContain('emerald');
    });

    it('doit retourner le bon label et style pour ANNULEE', () => {
      const badge = getActiviteStatusBadge('ANNULEE');
      expect(badge.label).toBe('Annulée');
      expect(badge.classes).toContain('rose');
    });
  });

  describe('getResourceStatusBadge', () => {
    it('doit retourner "Disponible" avec classes emerald pour DISPONIBLE', () => {
      const badge = getResourceStatusBadge('DISPONIBLE');
      expect(badge.label).toBe('Disponible');
      expect(badge.classes).toContain('emerald');
    });

    it('doit retourner "En maintenance" pour EN_MAINTENANCE', () => {
      const badge = getResourceStatusBadge('EN_MAINTENANCE');
      expect(badge.label).toBe('En maintenance');
      expect(badge.classes).toContain('amber');
    });
  });
});
