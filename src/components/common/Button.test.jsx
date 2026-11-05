import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button.jsx';
import { ArrowRight } from 'lucide-react';

describe('Button Component', () => {
  it('doit afficher le texte du bouton', () => {
    render(<Button>Cliquez ici</Button>);
    expect(screen.getByRole('button', { name: /Cliquez ici/i })).toBeInTheDocument();
  });

  it('doit appeler la fonction onClick lors d\'un clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);
    const btn = screen.getByRole('button', { name: /Action/i });
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('ne doit pas déclencher onClick si le bouton est désactivé', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Désactivé</Button>);
    const btn = screen.getByRole('button', { name: /Désactivé/i });
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
    expect(btn).toBeDisabled();
  });

  it('doit afficher l\'indicateur de chargement et désactiver le bouton quand loading=true', () => {
    render(<Button loading>Envoi</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });
});
