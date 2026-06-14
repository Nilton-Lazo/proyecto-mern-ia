/// <reference types="cypress" />

describe('Asignar actividad (docente)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.asTeacher();
    cy.visit('/teacher/assign');
  });

  it('camino feliz: crea actividad con área, tema y estudiante seleccionado', () => {
    cy.contains('h1', /asignar actividad/i).should('exist');
    cy.contains(/información de la actividad/i).should('exist');
    cy.contains(/estudiantes asignados/i).should('exist');

    cy.get('input[type="checkbox"]', { timeout: 10000 })
      .should('have.length.at.least', 1)
      .first()
      .check();

    cy.get('input[placeholder*="Energía y cambio climático"]')
      .clear()
      .type('Actividad E2E Cypress');

    cy.get('input[placeholder*="Cambio climático"]').clear().type('Lectura crítica E2E');

    cy.get('textarea[placeholder*="Indica qué debe hacer"]')
      .type('Lee el texto y responde con apoyo de IA.');

    cy.get('textarea[placeholder*="Pega el texto"]')
      .type('Este es un texto de prueba para la actividad de lectura comprensiva.');

    cy.get('input[type="date"]').type('2026-12-31');

    cy.contains('button', /asignar actividad/i).click();

    cy.contains(/actividad asignada correctamente/i, { timeout: 10000 }).should('exist');
  });

  it('camino infeliz: muestra error si falta el título', () => {
    cy.contains('button', /asignar actividad/i).click();
    cy.contains(/el título es obligatorio/i).should('exist');
  });

  it('camino infeliz: muestra error si falta el tema', () => {
    cy.get('input[placeholder*="Energía y cambio climático"]').type('Sin tema');
    cy.get('textarea[placeholder*="Pega el texto"]').type('Texto de prueba.');
    cy.get('input[type="checkbox"]').first().check();
    cy.contains('button', /asignar actividad/i).click();
    cy.contains(/indica el tema/i).should('exist');
  });
});
