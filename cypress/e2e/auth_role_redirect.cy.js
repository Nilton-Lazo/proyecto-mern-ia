/// <reference types="cypress" />

describe('Autenticación y redirecciones por rol', () => {
  beforeEach(() => {
    // Dejamos storage limpio antes de cada caso
    cy.clearLocalStorage();
  });

  // -------------------------
  // TEACHER – Caminos feliz e infeliz
  // -------------------------
  describe('Teacher', () => {
    it('camino feliz: login real y acceso a /teacher/dashboard', () => {
      // usa las credenciales reales definidas en cypress.env.json
      cy.asTeacher();

      cy.visit('/teacher/dashboard');

      cy.location('pathname').should('eq', '/teacher/dashboard');
      cy.contains(/panel docente/i).should('exist');
      cy.contains(/asignar nueva actividad/i).should('exist');
    });

    it('camino infeliz: sin sesión no debe poder acceder a /teacher/dashboard', () => {
      cy.clearLocalStorage(); // sin token

      cy.visit('/teacher/dashboard');

      // RoleRoute debería mandarlo a login o a una ruta pública.
      cy.location('pathname').should('match', /(\/login|\/$|\/questions)/);

      // Si normalmente lo llevas a /login, puedes ser más estricto:
      // cy.location('pathname').should('eq', '/login');
    });
  });

  // -------------------------
  // STUDENT – Caminos feliz e infeliz
  // -------------------------
  describe('Student', () => {
    it('camino feliz: login real y acceso a /questions', () => {
      cy.asStudent();

      cy.visit('/questions');

      cy.location('pathname').should('eq', '/questions');
      cy.contains("Generador de preguntas y retroalimentación").should("exist");
      cy.contains(/generar preguntas/i).should('exist');
    });

    it('camino infeliz: un student no puede ver /teacher/dashboard', () => {
      cy.asStudent();

      cy.visit('/teacher/dashboard');

      // Debe expulsarlo a una ruta permitida
      cy.location('pathname').should('match', /(\/questions|\/$)/);
    });
  });

  // -------------------------
  // LOGIN API – Camino infeliz (credenciales malas)
  // -------------------------
  describe('Login API', () => {
    it('camino infeliz: credenciales inválidas devuelven 401', () => {
      const baseApi = Cypress.env('baseApi');

      cy.request({
        method: 'POST',
        url: `${baseApi}/auth/login`,
        body: {
          email: Cypress.env('teacherEmail'),
          password: 'contraseña-incorrecta'
        },
        failOnStatusCode: false, // para que Cypress no corte el test
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });
});