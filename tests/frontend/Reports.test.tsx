import { render, screen, waitFor } from '@testing-library/react';
import Reports from '../../src/frontend/src/pages/Reports';

const fetchMock = jest.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (global as any).fetch = fetchMock;
});

const sampleReport = {
  total: 3,
  correctas: 1,
  incorrectas: 1,
  parciales: 1,
  ultimas: [
    {
      _id: '1',
      text: 't',
      question: '¿Q1?',
      answer: 'A1',
      feedback: 'CORRECTA',
      createdAt: new Date().toISOString()
    }
  ]
};

test('muestra loading y luego renderiza gráficos y tabla', async () => {
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => sampleReport } as any);

  render(<Reports />);
  expect(screen.getByText(/cargando reportes/i)).toBeInTheDocument();

  // espera datos
  await waitFor(() => {
    expect(screen.getByText(/reportes de respuestas/i)).toBeInTheDocument();
  });

  // totales + encabezados de secciones
  expect(screen.getByText(/total de respuestas: 3/i)).toBeInTheDocument();
  expect(screen.getByText(/distribución/i)).toBeInTheDocument();
  expect(screen.getByText(/comparativa/i)).toBeInTheDocument();
  expect(screen.getByText(/últimas respuestas/i)).toBeInTheDocument();

  // Fila de tabla
  expect(screen.getByText('¿Q1?')).toBeInTheDocument();
  expect(screen.getByText('A1')).toBeInTheDocument();
  expect(screen.getByText('CORRECTA')).toBeInTheDocument();
});

test('muestra mensaje de error si fetch falla', async () => {
  fetchMock.mockRejectedValueOnce(new Error('network'));

  render(<Reports />);
  await waitFor(() => {
    expect(screen.getByText(/no se pudieron cargar los reportes/i)).toBeInTheDocument();
  });
});