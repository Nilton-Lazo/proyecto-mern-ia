// tests/frontend/StudentActivityDetail.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../../src/frontend/src/context/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token',
  }),
}));

import StudentActivityDetail from '../../src/frontend/src/pages/student/StudentActivityDetail';

const baseActivity = {
  _id: 'abc123',
  title: 'Lectura sobre sesgos',
  text: 'Texto de actividad.',
  instructions: 'Lee y responde.',
  progressPercent: 30,
  status: 'draft',
  displayStatus: 'en_progreso',
  questionsGenerated: true,
  questions: [
    { questionText: '¿Cuál es la idea principal?', type: 'main_idea', order: 1 },
  ],
  questionAnswers: [{ questionIndex: 0, answer: '', feedback: '' }],
  aiAnalysis: { mainIdea: 'Idea de prueba' },
};

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
    window.confirm = jest.fn(() => true);
  });

  test('carga y muestra datos', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => baseActivity,
    });

    renderWithRoute();

    expect(await screen.findByRole('heading', { name: 'Lectura sobre sesgos' })).toBeInTheDocument();
    expect(screen.getByText('Texto de actividad.')).toBeInTheDocument();
    expect(screen.getByText(/¿Cuál es la idea principal?/)).toBeInTheDocument();
  });

  test('permite guardar borrador', async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => baseActivity,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, progressPercent: 60 }),
      });

    renderWithRoute();
    await screen.findByRole('heading', { name: 'Lectura sobre sesgos' });

    const textareas = screen.getAllByRole('textbox');
    fireEvent.change(textareas[0], { target: { value: 'Mi respuesta...' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar borrador/i }));

    expect(await screen.findByText(/Borrador guardado/)).toBeInTheDocument();
  });

  test('permite enviar actividad', async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...baseActivity,
          questionAnswers: [{ questionIndex: 0, answer: 'Respuesta', feedback: '' }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          status: 'submitted',
          score: 85,
          feedbackSummary: 'Buen trabajo',
          recommendation: 'Sigue leyendo',
          motivation: '¡Excelente!',
          questionAnswers: [
            { questionIndex: 0, answer: 'Respuesta', feedback: 'Correcta', isCorrect: 'correcta' },
          ],
        }),
      });

    renderWithRoute();
    await screen.findByRole('heading', { name: 'Lectura sobre sesgos' });

    fireEvent.click(screen.getByRole('button', { name: /enviar actividad/i }));

    expect(await screen.findByText(/Actividad entregada/)).toBeInTheDocument();
  });
});
