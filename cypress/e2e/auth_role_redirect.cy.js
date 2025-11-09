/// <reference types="cypress" />

describe('Login real y redirecciones por rol', () => {
  it('Teacher: tras login real va a /teacher/dashboard', () => {
    cy.asTeacher();

    // Abre cualquier ruta pública; tu Layout leerá localStorage y mostrará nav con usuario
    cy.visit('/login'); // o '/', da igual
    // ahora navega al dashboard del profe
    cy.visit('/teacher/dashboard');

    cy.location('pathname').should('eq', '/teacher/dashboard');
    cy.contains(/panel docente/i).should('exist');
    cy.contains(/asignar nueva actividad/i).should('exist');
  });

  it('Student: tras login real va a /questions', () => {
    cy.asStudent();

    // flujo típico del estudiante
    cy.visit('/questions');
    cy.location('pathname').should('eq', '/questions');
    cy.contains(/tutor de lectura crítica/i).should('exist');
    cy.contains(/generar preguntas/i).should('exist');
  });

  it('Protección de ruta: un student no puede ver /teacher/dashboard', () => {
    cy.asStudent();

    cy.visit('/teacher/dashboard');
    // RoleRoute debe expulsarlo (ajusta si rediriges a "/" o "/questions")
    cy.location('pathname').should('match', /^\/($|questions)/);
  });
});