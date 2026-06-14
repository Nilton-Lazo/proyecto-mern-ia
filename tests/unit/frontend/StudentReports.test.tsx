import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentReports from '../../../src/frontend/src/pages/student/StudentReports';

jest.mock('../../../src/frontend/src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 's1', email: 'a@t.com', nombres: 'Ana', role: 'student' },
    token: 'tok',
  }),
}));

jest.mock('../../../src/frontend/src/services/reportService', () => ({
  fetchStudentReportSummary: jest.fn().mockResolvedValue({
    summary: {
      student: { id: 's1', nombres: 'Ana', apellidos: 'G', email: 'a@t.com', role: 'student' },
      assigned: 2,
      completed: 1,
      inProgress: 1,
      pending: 0,
      overdue: 0,
      avgProgress: 75,
      avgComprehension: 70,
      totalQuestionsAnswered: 5,
      lastActivity: { titulo: 'Lectura 1', area: 'Comunicación', updatedAt: '2025-01-01' },
      hasData: true,
    },
  }),
  fetchStudentReportSkills: jest.fn().mockResolvedValue({
    skills: [
      { skill: 'literal', label: 'Comprensión literal', percentage: 80, level: 'logrado', levelLabel: 'Logrado', recommendation: 'Buen avance' },
    ],
    hasData: true,
  }),
  fetchStudentReportAreas: jest.fn().mockResolvedValue({ areas: [{ area: 'Comunicación', completed: 1, total: 2, avgComprehension: 70, status: 'adecuado', topTopic: 'Narrativa' }], hasData: true }),
  fetchStudentReportTimeline: jest.fn().mockResolvedValue({ timeline: [{ date: '2025-01-01', completed: 1, avgComprehension: 70, avgProgress: 75 }], hasData: true }),
  fetchStudentReportFeedback: jest.fn().mockResolvedValue({ feedback: [], activities: [], hasData: false }),
  fetchStudentReportRecommendations: jest.fn().mockResolvedValue({ recommendations: ['Refuerza comprensión inferencial.'], evidence: [], hasData: true }),
  downloadStudentReportPdf: jest.fn(),
}));

describe('StudentReports', () => {
  test('renderiza título y cards resumen', async () => {
    render(
      <MemoryRouter>
        <StudentReports />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Mis reportes de aprendizaje/i)).toBeInTheDocument();
    expect(await screen.findByText(/Actividades asignadas/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mapa de mejora lectora/i)).toBeInTheDocument();
  });
});
