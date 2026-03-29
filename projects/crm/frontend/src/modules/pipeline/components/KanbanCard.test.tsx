import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { addDays, subDays, format } from 'date-fns';
import { KanbanCard, getDueDateBadge, formatLastActivity } from './KanbanCard';
import type { Opportunity } from '../pipeline.types';

// ---------------------------------------------------------------------------
// Shared test fixture
// ---------------------------------------------------------------------------

const baseOpportunity: Opportunity = {
  id: 'opp-1',
  clientId: 'client-1',
  motoInterest: 'Honda CB 300R',
  stage: 'consulta',
  isOpen: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastActivityAt: null,
  client: {
    id: 'client-1',
    firstName: 'Carlos',
    lastName: 'Gomez',
    phonePrimary: '1122334455',
  },
};

// Helper: ISO string for a date N days from now
function isoInDays(n: number): string {
  return (n >= 0 ? addDays(new Date(), n) : subDays(new Date(), Math.abs(n))).toISOString();
}

// ---------------------------------------------------------------------------
// Unit tests for getDueDateBadge helper
// ---------------------------------------------------------------------------

describe('getDueDateBadge', () => {
  it('retorna ⚠️ si la fecha de vencimiento ya pasó', () => {
    const pastDate = isoInDays(-1); // yesterday
    expect(getDueDateBadge(pastDate)).toBe('⚠️');
  });

  it('retorna ⚠️ si la fecha de vencimiento pasó hace varios días', () => {
    const oldDate = isoInDays(-10);
    expect(getDueDateBadge(oldDate)).toBe('⚠️');
  });

  it('retorna ⏰ si la fecha de vencimiento es hoy', () => {
    // Set time slightly in the future to ensure it's not in the past
    const today = new Date();
    today.setHours(today.getHours() + 2);
    expect(getDueDateBadge(today.toISOString())).toBe('⏰');
  });

  it('retorna ⏰ si la fecha de vencimiento es mañana', () => {
    const tomorrow = isoInDays(1);
    expect(getDueDateBadge(tomorrow)).toBe('⏰');
  });

  it('retorna ⏰ si la fecha de vencimiento es en 3 días exactos', () => {
    const threeDays = isoInDays(3);
    expect(getDueDateBadge(threeDays)).toBe('⏰');
  });

  it('retorna null si la fecha está lejos (más de 3 días)', () => {
    const farDate = isoInDays(10);
    expect(getDueDateBadge(farDate)).toBeNull();
  });

  it('retorna null si no hay fecha', () => {
    expect(getDueDateBadge(null)).toBeNull();
    expect(getDueDateBadge(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Unit tests for formatLastActivity helper
// ---------------------------------------------------------------------------

describe('formatLastActivity', () => {
  it('retorna "Sin actividad" si no hay fecha', () => {
    expect(formatLastActivity(null)).toBe('Sin actividad');
    expect(formatLastActivity(undefined)).toBe('Sin actividad');
  });

  it('retorna "Última actividad: hoy" para fecha de hoy', () => {
    const today = new Date().toISOString();
    expect(formatLastActivity(today)).toBe('Última actividad: hoy');
  });

  it('retorna "Última actividad: hace 1 día" para ayer', () => {
    const yesterday = subDays(new Date(), 1).toISOString();
    expect(formatLastActivity(yesterday)).toBe('Última actividad: hace 1 día');
  });

  it('retorna "Última actividad: hace X días" para fechas más antiguas', () => {
    const fiveDaysAgo = subDays(new Date(), 5).toISOString();
    expect(formatLastActivity(fiveDaysAgo)).toBe('Última actividad: hace 5 días');
  });
});

// ---------------------------------------------------------------------------
// KanbanCard component render tests
// ---------------------------------------------------------------------------

describe('KanbanCard', () => {
  // -------------------------------------------------------------------------
  // Due date badge: overdue
  // -------------------------------------------------------------------------

  it('muestra ícono ⚠️ si la fecha de vencimiento ya pasó', () => {
    const pastDue = isoInDays(-2);
    render(
      createElement(KanbanCard, {
        opportunity: baseOpportunity,
        nearestDueAt: pastDue,
      }),
    );

    const badge = screen.getByTestId('badge-overdue');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('⚠️');
  });

  // -------------------------------------------------------------------------
  // Due date badge: due soon
  // -------------------------------------------------------------------------

  it('muestra ícono ⏰ si la fecha de vencimiento es en los próximos 3 días', () => {
    const soonDue = isoInDays(2);
    render(
      createElement(KanbanCard, {
        opportunity: baseOpportunity,
        nearestDueAt: soonDue,
      }),
    );

    const badge = screen.getByTestId('badge-soon');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('⏰');
  });

  // -------------------------------------------------------------------------
  // Due date badge: no icon when date is far or absent
  // -------------------------------------------------------------------------

  it('no muestra íconos si la fecha está lejos', () => {
    const farDate = isoInDays(30);
    render(
      createElement(KanbanCard, {
        opportunity: baseOpportunity,
        nearestDueAt: farDate,
      }),
    );

    expect(screen.queryByTestId('badge-overdue')).not.toBeInTheDocument();
    expect(screen.queryByTestId('badge-soon')).not.toBeInTheDocument();
  });

  it('no muestra íconos si no hay fecha de vencimiento', () => {
    render(
      createElement(KanbanCard, {
        opportunity: baseOpportunity,
        nearestDueAt: null,
      }),
    );

    expect(screen.queryByTestId('badge-overdue')).not.toBeInTheDocument();
    expect(screen.queryByTestId('badge-soon')).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Last activity (RF-11)
  // -------------------------------------------------------------------------

  it('muestra "Sin actividad" si la oportunidad no tiene actividades', () => {
    render(
      createElement(KanbanCard, {
        opportunity: { ...baseOpportunity, lastActivityAt: null },
      }),
    );

    expect(screen.getByTestId('last-activity-label')).toHaveTextContent('Sin actividad');
  });

  it('muestra "Última actividad: hace X días" si tiene fecha de última actividad', () => {
    const threeDaysAgo = subDays(new Date(), 3).toISOString();
    render(
      createElement(KanbanCard, {
        opportunity: { ...baseOpportunity, lastActivityAt: threeDaysAgo },
      }),
    );

    expect(screen.getByTestId('last-activity-label')).toHaveTextContent(
      'Última actividad: hace 3 días',
    );
  });

  it('muestra el nombre del cliente y el modelo de moto', () => {
    render(
      createElement(KanbanCard, {
        opportunity: baseOpportunity,
      }),
    );

    expect(screen.getByText('Carlos Gomez')).toBeInTheDocument();
    expect(screen.getByText('Honda CB 300R')).toBeInTheDocument();
  });
});
