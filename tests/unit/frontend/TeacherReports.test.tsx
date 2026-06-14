import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TeacherReports from '../../../src/frontend/src/pages/teacher/TeacherReports';

jest.mock('../../../src/frontend/src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 't1', email: 'l@t.com', nombres: 'Luis', role: 'teacher' },
    token: 'tok',
  }),
}));

jest.mock('../../../src/frontend/src/services/reportService', () => ({
  fetchTeacherReportSummary: jest.fn().mockResolvedValue({
    summary: {
      totalStudents: 3,
      activitiesAssigned: 2,
      totalAssignments: 6,
      submitted: 4,
      pending: 1,
      overdue: 1,
      avgComprehension: 65,
      participation: 80,
      studentsAtRisk: 1,
      hasData: true,
    },
    teacher: { nombres: 'Luis', apellidos: 'M' },
  }),
  fetchTeacherReportSkills: jest.fn().mockResolvedValue({ skills: [], hasData: false }),
  fetchTeacherReportStudents: jest.fn().mockResolvedValue({
    students: [
      { studentId: 's1', nombres: 'Ana', apellidos: 'G', email: 'a@t.com', completed: 2, total: 3, avgProgress: 70, avgComprehension: 65, weakestSkill: 'Inferencial', status: 'en_seguimiento', statusLabel: 'En seguimiento' },
    ],
    hasData: true,
  }),
  fetchTeacherReportAreas: jest.fn().mockResolvedValue({ areas: [], hasData: false }),
  fetchTeacherReportDifficulty: jest.fn().mockResolvedValue({ activities: [], hasData: false }),
  fetchTeacherReportAnswers: jest.fn().mockResolvedValue({ answers: [], hasData: false }),
  fetchTeacherReportAlerts: jest.fn().mockResolvedValue({ alerts: [{ type: 'habilidad', message: 'La habilidad inferencial está por debajo del 60%.', severity: 'warning' }] }),
  fetchTeacherReportRecommendations: jest.fn().mockResolvedValue({ recommendations: ['Reforzar preguntas inferenciales.'], evidence: [], hasData: true }),
  downloadTeacherReportPdf: jest.fn(),
  downloadTeacherReportCsv: jest.fn(),
}));

describe('TeacherReports', () => {
  test('renderiza reportes del grupo y alertas', async () => {
    render(
      <MemoryRouter>
        <TeacherReports />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Reportes pedagógicos del grupo/i)).toBeInTheDocument();
    expect(await screen.findByText(/Evidencia para certificación ICACIT/i)).toBeInTheDocument();
    expect(await screen.findByText(/inferencial está por debajo/i)).toBeInTheDocument();
  });
});
