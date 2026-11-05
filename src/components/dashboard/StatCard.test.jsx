import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard.jsx';
import { DollarSign } from 'lucide-react';

describe('StatCard Component', () => {
  it('doit afficher le titre, la valeur formatée et la tendance', () => {
    render(
      <StatCard
        title="Recettes Totales"
        value="15 000 000 Ar"
        icon={DollarSign}
        color="emerald"
        trend={{ positive: true, value: '+12%', label: 'vs mois dernier' }}
      />
    );
    expect(screen.getByText('Recettes Totales')).toBeInTheDocument();
    expect(screen.getByText('15 000 000 Ar')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('vs mois dernier')).toBeInTheDocument();
  });

  it('doit gérer l\'état de chargement sans afficher la valeur', () => {
    render(
      <StatCard
        title="Dépenses"
        value="5 000 000 Ar"
        loading={true}
      />
    );
    expect(screen.getByText('Dépenses')).toBeInTheDocument();
    expect(screen.queryByText('5 000 000 Ar')).not.toBeInTheDocument();
  });
});
