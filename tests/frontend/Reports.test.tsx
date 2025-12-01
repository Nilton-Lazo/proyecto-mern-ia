import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Reports from '../../src/frontend/src/pages/Reports';

describe('Reports page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('muestra resumen de reportes cuando carga correctamente', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 3,
        correctas: 1,
        incorrectas: 1,
        parciales: 1,
        ultimas: [
          {
            _id: 'r1',
            text: 'Texto',
            question: '¿Qué es IA?',
            answer: 'Una máquina',
            feedback: 'CORRECTA',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ],
      }),
    }) as any;

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );

    expect(
      await screen.findByText('Reportes de respuestas')
    ).toBeInTheDocument();

    // Total de respuestas
    expect(screen.getByText('3')).toBeInTheDocument();

    // Alguna de las etiquetas de KPIs
    expect(screen.getByText(/Correctas/)).toBeInTheDocument();
    expect(screen.getByText(/Parciales/)).toBeInTheDocument();
    expect(screen.getByText(/Incorrectas/)).toBeInTheDocument();

    // Última respuesta en la tabla
    expect(screen.getByText('¿Qué es IA?')).toBeInTheDocument();
    expect(screen.getByText('Una máquina')).toBeInTheDocument();
    expect(screen.getByText('CORRECTA')).toBeInTheDocument();
  });

  test('muestra mensaje de error si no hay reporte', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockRejectedValue(
      new Error('Network error')
    ) as any;

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/No se pudieron cargar los reportes/i)
    ).toBeInTheDocument();
  });
});