/// <reference types="cypress" />

describe('Autenticación y redirecciones por rol', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Teacher', () => {
    it('camino feliz: login real y acceso a /teacher/dashboard', () => {
      cy.asTeacher();
      cy.visit('/teacher/dashboard');

      cy.location('pathname').should('eq', '/teacher/dashboard');
      cy.contains(/panel docente/i).should('exist');
      cy.contains(/asignar nueva actividad/i).should('exist');
    });

    it('camino infeliz: sin sesión no accede a /teacher/dashboard', () => {
      cy.visit('/teacher/dashboard');
      cy.location('pathname').should('eq', '/login');
    });
  });

  describe('Student', () => {
    it('camino feliz: login real y acceso a /student/home', () => {
      cy.asStudent();
      cy.visit('/student/home');

      cy.location('pathname').should('eq', '/student/home');
    });

    it('camino feliz: puede usar /questions (ruta pública autenticada)', () => {
      cy.asStudent();
      cy.visit('/questions');

      cy.location('pathname').should('eq', '/questions');
      cy.contains(/generador de preguntas y retroalimentación/i).should('exist');
      cy.contains('button', /generar preguntas/i).should('exist');
    });

    it('camino infeliz: un student no puede ver /teacher/dashboard', () => {
      cy.asStudent();
      cy.visit('/teacher/dashboard');
      cy.location('pathname').should('eq', '/');
    });
  });

  describe('Login API', () => {
    it('camino infeliz: credenciales inválidas devuelven 401', () => {
      const baseApi = Cypress.env('baseApi');

      cy.request({
        method: 'POST',
        url: `${baseApi}/auth/login`,
        body: {
          email: Cypress.env('teacherEmail'),
          password: 'contraseña-incorrecta',
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });
});
