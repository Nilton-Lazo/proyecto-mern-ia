// tests/frontend/StudentActivities.test.tsx
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../src/frontend/src/context/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token',
  }),
}));

import StudentActivities from '../../src/frontend/src/pages/student/StudentActivities';

function mockFetchOnce(data: unknown) {
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  }) as jest.Mock;
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
          displayStatus: 'en_progreso',
          actualizada: '2025-01-02T00:00:00.000Z',
        },
        {
          _id: 'a2',
          titulo: 'Lectura 2',
          dueAt: null,
          progreso: 100,
          status: 'submitted',
          displayStatus: 'entregada',
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
    expect(screen.getByText('80%')).toBeInTheDocument();

    const completadasCard = screen.getByText('Completadas').closest('div');
    expect(completadasCard).not.toBeNull();
    expect(within(completadasCard as HTMLElement).getByText('1')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/student/activities',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
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
      await screen.findByText('No hay actividades para mostrar')
    ).toBeInTheDocument();
  });
});
