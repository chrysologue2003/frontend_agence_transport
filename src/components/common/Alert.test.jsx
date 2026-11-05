import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert.jsx';

describe('Alert Component', () => {
  it('doit afficher le message d\'alerte', () => {
    render(<Alert type="danger" message="Une erreur est survenue" />);
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
  });

  it('doit afficher le bouton de fermeture et appeler onClose lors du clic', () => {
    const handleClose = vi.fn();
    render(<Alert type="success" message="Succès" onClose={handleClose} />);
    const closeBtn = screen.getByRole('button');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
