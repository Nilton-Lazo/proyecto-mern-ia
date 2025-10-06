import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Questions from '../../src/frontend/src/pages/Questions';

// mock global fetch
const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  (global as any).fetch = fetchMock;
});

test('envía texto, muestra preguntas y permite pedir feedback', async () => {
  // 1ª llamada: /api/ai/questions
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: { questions: ['¿Qué es IA?', '¿Para qué sirve?'] }
    })
  } as any);

  // 2ª llamada: /api/ai/feedback
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ feedback: 'Correcta' })
  } as any);

  render(<Questions />);

  const textarea = screen.getByRole('textbox');
  await userEvent.type(textarea, 'Texto demo');

  const submitBtn = screen.getByRole('button', { name: /generar preguntas/i });
  await userEvent.click(submitBtn);

  // aparecen las preguntas
  expect(await screen.findByText('¿Qué es IA?')).toBeInTheDocument();
  expect(screen.getByText('¿Para qué sirve?')).toBeInTheDocument();

  // Escribo respuesta a la primera
  const answerAreas = screen.getAllByRole('textbox');
  await userEvent.clear(answerAreas[1]);
  await userEvent.type(answerAreas[1], 'Mi respuesta');

  // Pido feedback de la primera
  const feedbackBtn = screen
    .getAllByRole('button')
    .find(b => /retroalimentación/i.test(b.textContent || ''))!;
  await userEvent.click(feedbackBtn);

  // mensaje y feedback visibles
  await waitFor(() => {
    // ^correcta$ para no confundir con "Respuesta guardada correctamente"
    expect(screen.getByText(/^correcta$/i)).toBeInTheDocument();
    expect(screen.getByText(/respuesta guardada/i)).toBeInTheDocument();
  });
});

test('muestra estado de carga al generar preguntas', async () => {
  // Promesa controlada para mantener el fetch "en vuelo"
  let resolveFetch: (v: any) => void;
  const pending = new Promise<any>((res) => (resolveFetch = res));

  fetchMock.mockReturnValueOnce(pending as any);

  render(<Questions />);

  const textarea = screen.getByRole('textbox');
  await userEvent.type(textarea, 'Texto demo');

  const submitBtn = screen.getByRole('button', { name: /generar preguntas/i });
  await userEvent.click(submitBtn);

  // Mientras el fetch está pendiente, el botón debe estar deshabilitado
  await waitFor(() => expect(submitBtn).toBeDisabled());

  // Ahora resolvemos el fetch
  resolveFetch!({
    ok: true,
    json: async () => ({ data: { questions: [] } }),
  });

  // Y finalmente vuelve a habilitarse
  await waitFor(() => expect(submitBtn).not.toBeDisabled());
});