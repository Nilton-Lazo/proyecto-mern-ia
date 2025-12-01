// tests/frontend/StudentActivities.test.tsx
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock directo del AuthContext
jest.mock('../../src/frontend/src/context/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token',
  }),
}));

import StudentActivities from '../../src/frontend/src/pages/StudentActivities';

// Helper para mockear fetch
function mockFetchOnce(data: any) {
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  }) as any;
}

describe('StudentActivities page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('muestra actividades asignadas y KPIs', async () => {
    mockFetchOnce({
      activities: [
        {
          _id: 'a1',
          titulo: 'Lectura 1',
          dueAt: '2025-01-01T00:00:00.000Z',
          progreso: 60,
          status: 'draft',
          actualizada: '2025-01-02T00:00:00.000Z',
        },
        {
          _id: 'a2',
          titulo: 'Lectura 2',
          dueAt: null,
          progreso: 100,
          status: 'submitted',
          actualizada: '2025-01-03T00:00:00.000Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <StudentActivities />
      </MemoryRouter>
    );

    // Items renderizados
    expect(await screen.findByText('Lectura 1')).toBeInTheDocument();
    expect(screen.getByText('Lectura 2')).toBeInTheDocument();

    // KPI: (60+100)/2 = 80
    expect(screen.getByText('80%')).toBeInTheDocument();

    // --- KPI Completadas ---
    const completadasCard = screen.getByText('Completadas').closest('div');
    expect(completadasCard).not.toBeNull();
    expect(
      within(completadasCard as HTMLElement).getByText('1')
    ).toBeInTheDocument();

    // --- KPI En progreso ---
    // Hay dos textos "En progreso". Tomamos el PRIMERO (la tarjeta KPI)
    const [kpiEnProgresoLabel] = screen.getAllByText('En progreso');
    const enProgresoCard = kpiEnProgresoLabel.closest('div');

    expect(enProgresoCard).not.toBeNull();
    expect(
      within(enProgresoCard as HTMLElement).getByText('1')
    ).toBeInTheDocument();

    // Verificar llamada a fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/student/activities',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
    });
  });

  test('muestra estado vacío cuando no hay actividades', async () => {
    mockFetchOnce({ activities: [] });

    render(
      <MemoryRouter>
        <StudentActivities />
      </MemoryRouter>
    );

    expect(
      await screen.findByText('Aún no tienes actividades asignadas.')
    ).toBeInTheDocument();
  });
});