// tests/frontend/StudentActivityDetail.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../../src/frontend/src/context/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token',
  }),
}));

import StudentActivityDetail from '../../src/frontend/src/pages/StudentActivityDetail';

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/student/activities/abc123']}>
      <Routes>
        <Route path="/student/activities/:id" element={<StudentActivityDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('StudentActivityDetail page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('carga y muestra datos', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        _id: 'abc123',
        title: 'Lectura sobre sesgos',
        text: 'Texto de actividad.',
        instructions: 'Lee y responde.',
        progressPercent: 0,
        status: 'draft',
        answer: '',
      }),
    });

    renderWithRoute();

    expect(await screen.findByText('Lectura sobre sesgos')).toBeInTheDocument();
    expect(screen.getByText('Texto de actividad.')).toBeInTheDocument();
  });

  test('permite guardar borrador', async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: 'abc123',
          title: 'Lectura X',
          text: 'Texto X',
          progressPercent: 0,
          status: 'draft',
          answer: '',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ progressPercent: 60 }),
      });

    renderWithRoute();

    await screen.findByText('Lectura X');

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Mi respuesta...' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar borrador/i }));

    expect(await screen.findByText(/Borrador guardado/)).toBeInTheDocument();
  });

  test('permite enviar actividad', async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: 'abc123',
          title: 'Lectura X',
          text: 'Texto X',
          progressPercent: 60,
          status: 'draft',
          answer: 'Borrador previo',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, status: 'submitted' }),
      });

    renderWithRoute();

    await screen.findByText('Lectura X');

    fireEvent.click(screen.getByRole('button', { name: /enviar actividad/i }));

    expect(await screen.findByText('¡Entregada!')).toBeInTheDocument();
    expect(screen.getByText(/Progreso actual:/)).toHaveTextContent('100%');
  });
});