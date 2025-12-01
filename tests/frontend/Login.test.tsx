// tests/frontend/Login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

// Mock de react-router-dom → solo reemplazamos useNavigate
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de AuthContext → usamos LOGIN MOCK
jest.mock('../../src/frontend/src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

import Login from '../../src/frontend/src/pages/Login';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Login />
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login exitoso como teacher navega a /teacher/dashboard', async () => {
    mockLogin.mockResolvedValueOnce({ role: 'teacher' });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Correo'), {
      target: { value: 'joel@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('joel@gmail.com', '123456');
      expect(mockNavigate).toHaveBeenCalledWith('/teacher/dashboard');
    });
  });

  test('muestra error si login falla', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas'));

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Correo'), {
      target: { value: 'bad@mail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'wrong' },
    });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
  });
});