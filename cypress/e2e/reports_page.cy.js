/// <reference types="cypress" />

describe('Reportes — estudiante', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.asStudent();
  });

  it('camino feliz: muestra resumen y mapa de habilidades', () => {
    cy.intercept('GET', '**/api/student/reports/summary', {
      statusCode: 200,
      body: {
        summary: {
          assigned: 3,
          completed: 1,
          inProgress: 1,
          pending: 1,
          overdue: 0,
          avgProgress: 60,
          avgComprehension: 72,
          totalQuestionsAnswered: 8,
          lastActivity: { titulo: 'Lectura 1' },
          hasData: true,
        },
      },
    }).as('summary');

    cy.intercept('GET', '**/api/student/reports/skills', {
      statusCode: 200,
      body: {
        skills: [
          { skill: 'literal', label: 'Comprensión literal', percentage: 80, level: 'logrado', levelLabel: 'Logrado', recommendation: 'Buen avance' },
        ],
        hasData: true,
      },
    }).as('skills');

    cy.intercept('GET', '**/api/student/reports/areas', { statusCode: 200, body: { areas: [], hasData: false } });
    cy.intercept('GET', '**/api/student/reports/timeline', { statusCode: 200, body: { timeline: [], hasData: false } });
    cy.intercept('GET', '**/api/student/reports/recent-feedback', { statusCode: 200, body: { feedback: [], activities: [], hasData: false } });
    cy.intercept('GET', '**/api/student/reports/recommendations', { statusCode: 200, body: { recommendations: [], evidence: [], hasData: false } });

    cy.visit('/student/reports');
    cy.wait('@summary');
    cy.contains(/mis reportes de aprendizaje/i).should('exist');
    cy.contains(/mapa de mejora lectora/i).should('exist');
    cy.contains(/actividades asignadas/i).should('exist');
  });

  it('camino infeliz: error de API', () => {
    cy.intercept('GET', '**/api/student/reports/summary', { forceNetworkError: true });
    cy.visit('/student/reports');
    cy.contains(/no se pudieron cargar los reportes/i).should('exist');
  });
});

describe('Reportes — docente', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.asTeacher();
  });

  it('muestra resumen del grupo y seguimiento', () => {
    cy.intercept('GET', '**/api/teacher/reports/summary', {
      statusCode: 200,
      body: {
        summary: {
          totalStudents: 5,
          activitiesAssigned: 2,
          submitted: 6,
          pending: 2,
          overdue: 1,
          avgComprehension: 68,
          participation: 75,
          studentsAtRisk: 1,
          hasData: true,
        },
        teacher: { nombres: 'Luis', apellidos: 'M' },
      },
    }).as('summary');

    cy.intercept('GET', '**/api/teacher/reports/skills', { statusCode: 200, body: { skills: [], hasData: false } });
    cy.intercept('GET', '**/api/teacher/reports/students', {
      statusCode: 200,
      body: {
        students: [
          { studentId: 's1', nombres: 'Ana', apellidos: 'G', completed: 2, total: 3, avgProgress: 70, avgComprehension: 65, weakestSkill: 'Inferencial', status: 'en_seguimiento', statusLabel: 'En seguimiento' },
        ],
        hasData: true,
      },
    });
    cy.intercept('GET', '**/api/teacher/reports/areas', { statusCode: 200, body: { areas: [], hasData: false } });
    cy.intercept('GET', '**/api/teacher/reports/activities-difficulty', { statusCode: 200, body: { activities: [], hasData: false } });
    cy.intercept('GET', '**/api/teacher/reports/recent-answers', { statusCode: 200, body: { answers: [], hasData: false } });
    cy.intercept('GET', '**/api/teacher/reports/alerts', { statusCode: 200, body: { alerts: [] } });
    cy.intercept('GET', '**/api/teacher/reports/recommendations', { statusCode: 200, body: { recommendations: [], evidence: [], hasData: false } });

    cy.visit('/teacher/reports');
    cy.wait('@summary');
    cy.contains(/reportes del grupo/i).should('exist');
    cy.contains(/seguimiento de estudiantes/i).should('exist');
  });
});
