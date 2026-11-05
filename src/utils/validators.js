/**
 * Utilitaires de validation pour tous les formulaires
 */

/**
 * Validation stricte du numéro de téléphone malgache.
 * Obligatoire : doit impérativement commencer par 034, 032, 037 ou 038.
 * Format standard : 10 chiffres (ex: 034 12 345 67) ou international (+261 34 ...).
 */
export const validateTelephone = (value) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return 'Le numéro de téléphone est obligatoire';
  }

  const trimmed = value.trim();

  // Nettoyage des séparateurs habituels (espaces, tirets, points, parenthèses)
  let clean = trimmed.replace(/[\s.\-_()]/g, '');

  // Normalisation des préfixes internationaux vers format local '0...'
  if (clean.startsWith('+261')) {
    clean = '0' + clean.slice(4);
  } else if (clean.startsWith('00261')) {
    clean = '0' + clean.slice(5);
  } else if (clean.startsWith('261') && clean.length === 12) {
    clean = '0' + clean.slice(3);
  }

  // Vérifier qu'il n'y a que des chiffres
  if (!/^\d+$/.test(clean)) {
    return 'Le numéro de téléphone ne doit contenir que des chiffres';
  }

  // Vérifier le préfixe obligatoire : 034, 032, 037 ou 038
  const prefixRegex = /^(034|032|037|038)/;
  if (!prefixRegex.test(clean)) {
    return 'Le numéro doit obligatoirement commencer par 034, 032, 037 ou 038';
  }

  // Vérifier la longueur exacte : 10 chiffres (03X + 7 chiffres)
  if (clean.length !== 10) {
    if (clean.length < 10) {
      return `Numéro trop court : 10 chiffres requis (${clean.length}/10)`;
    } else {
      return `Numéro trop long : 10 chiffres requis (${clean.length}/10)`;
    }
  }

  return null; // Valide
};

/**
 * Validation d'un champ texte obligatoire
 */
export const validateRequired = (value, fieldName = 'Ce champ', minLength = 1) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return `${fieldName} est obligatoire`;
  }
  if (value.trim().length < minLength) {
    return `${fieldName} doit contenir au moins ${minLength} caractère(s)`;
  }
  return null;
};

/**
 * Validation d'une adresse email
 */
export const validateEmail = (value, required = false) => {
  if (!value || !value.trim()) {
    return required ? "L'adresse email est obligatoire" : null;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value.trim())) {
    return "Format d'adresse email invalide (ex: exemple@domaine.com)";
  }
  return null;
};

/**
 * Validation d'un montant ou nombre strictement positif (> 0)
 */
export const validateStrictPositiveNumber = (value, fieldName = 'Le montant') => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} est obligatoire`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} doit être un nombre valide`;
  }
  if (num <= 0) {
    return `${fieldName} doit être strictement supérieur à 0`;
  }
  return null;
};

/**
 * Validation d'un nombre positif ou nul (>= 0)
 */
export const validatePositiveNumber = (value, fieldName = 'La valeur') => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} doit être un nombre valide`;
  }
  if (num < 0) {
    return `${fieldName} ne peut pas être négatif`;
  }
  return null;
};

/**
 * Validation d'un entier supérieur ou égal à min
 */
export const validateInteger = (value, fieldName = 'Ce champ', min = 1) => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} est obligatoire`;
  }
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num)) {
    return `${fieldName} doit être un nombre entier valide`;
  }
  if (num < min) {
    return `${fieldName} doit être supérieur ou égal à ${min}`;
  }
  return null;
};

/**
 * Validation d'une date obligatoire
 */
export const validateDate = (value, fieldName = 'La date') => {
  if (!value) {
    return `${fieldName} est obligatoire`;
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return `${fieldName} n'est pas une date valide`;
  }
  return null;
};
