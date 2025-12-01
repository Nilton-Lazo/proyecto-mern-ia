// tests/frontend/StudentActivities.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
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

    expect(await screen.findByText('Lectura 1')).toBeInTheDocument();
    expect(screen.getByText('Lectura 2')).toBeInTheDocument();

    // KPI → (60 + 100) / 2 = 80
    expect(screen.getByText('80%')).toBeInTheDocument();

    // 1 actividad entregada
    expect(screen.getByText('1')).toBeInTheDocument();

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