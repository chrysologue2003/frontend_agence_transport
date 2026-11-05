import { describe, it, expect, beforeEach } from 'vitest';
import {
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearAuthSession,
} from './auth.js';
import { ROLES } from './constants.js';

describe('Auth Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Token management', () => {
    it('doit stocker, récupérer et supprimer le token JWT', () => {
      expect(getToken()).toBeNull();
      setToken('fake-jwt-token');
      expect(getToken()).toBe('fake-jwt-token');
      removeToken();
      expect(getToken()).toBeNull();
    });
  });

  describe('User storage', () => {
    it('doit stocker et récupérer un objet utilisateur valide', () => {
      const mockUser = { id: '1', login: 'admin', role: { libelle: ROLES.ADMINISTRATEUR } };
      setStoredUser(mockUser);
      expect(getStoredUser()).toEqual(mockUser);
      removeStoredUser();
      expect(getStoredUser()).toBeNull();
    });

    it('doit retourner null si le JSON est corrompu', () => {
      localStorage.setItem('mendrika_user_data', 'invalid-json');
      expect(getStoredUser()).toBeNull();
    });
  });

  describe('clearAuthSession', () => {
    it('doit vider le token et l\'utilisateur de session', () => {
      setToken('test-token');
      setStoredUser({ login: 'test' });
      clearAuthSession();
      expect(getToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });
  });
});
