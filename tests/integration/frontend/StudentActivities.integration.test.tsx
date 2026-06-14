/**
 * Integración frontend: componente + contrato API simulado.
 * (MSW handlers en tests/support/msw/ para ampliar cuando el entorno lo permita)
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentActivities from '../../../src/frontend/src/pages/student/StudentActivities';

jest.mock('../../../src/frontend/src/context/AuthContext', () => ({
  useAuth: () => ({ token: 'integration-token' }),
}));

describe('StudentActivities (integración frontend)', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        activities: [
          {
            _id: 'a1',
            titulo: 'Lectura integración',
            area: 'Comunicación',
            tema: 'MSW-ready',
            progreso: 30,
            status: 'draft',
            displayStatus: 'en_progreso',
            actualizada: new Date().toISOString(),
          },
        ],
        groupedByArea: [],
        total: 1,
        filtered: 1,
      }),
    }) as jest.Mock;
  });

  test('renderiza actividades devueltas por la API simulada', async () => {
    render(
      <MemoryRouter>
        <StudentActivities />
      </MemoryRouter>
    );

    expect(await screen.findByText('Lectura integración')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /mis actividades/i })).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/student/activities'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer integration-token' }),
      })
    );
  });
});
