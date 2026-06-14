import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Reports from '../../../src/frontend/src/pages/Reports';

jest.mock('../../../src/frontend/src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = jest.requireMock('../../../src/frontend/src/context/AuthContext');

function wrap(role: string) {
  useAuth.mockReturnValue({
    user: { id: '1', email: 'u@t.com', nombres: 'U', role },
    token: 'tok',
  });
  return (
    <MemoryRouter initialEntries={['/reports']}>
      <Routes>
        <Route path="/reports" element={<Reports />} />
        <Route path="/student/reports" element={<div>Student reports page</div>} />
        <Route path="/teacher/reports" element={<div>Teacher reports page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Reports redirect', () => {
  test('redirige estudiante a /student/reports', async () => {
    render(wrap('student'));
    expect(await screen.findByText('Student reports page')).toBeInTheDocument();
  });

  test('redirige docente a /teacher/reports', async () => {
    render(wrap('teacher'));
    expect(await screen.findByText('Teacher reports page')).toBeInTheDocument();
  });
});
