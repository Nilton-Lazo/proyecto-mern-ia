/// <reference types="cypress" />

describe('Asignar actividad (docente)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.asTeacher();          // login real por API + sesión cacheada
    cy.visit('/teacher/assign');
  });

  it('camino feliz: el teacher crea una actividad para al menos un estudiante', () => {
    // 1) Vista básica
    cy.contains(/asignar actividad/i).should('exist');
    cy.contains(/texto de la lectura/i).should('exist');
    cy.contains(/selecciona estudiantes/i).should('exist');

    // 2) Esperar a que carguen estudiantes desde tu backend
    //    y marcar al menos un checkbox (solo hay checkboxes de estudiantes)
    cy.get('input[type="checkbox"]', { timeout: 10000 })
      .should('have.length.at.least', 1)
      .first()
      .check();

    // 3) Rellenar formulario de la izquierda
    cy.get('input[placeholder*="Energía y cambio climático"]')
      .clear()
      .type('Actividad E2E Cypress');

    cy.get('textarea[placeholder*="Describe qué esperas"]')
      .type('Que el estudiante lea el texto y escriba una reflexión crítica.');

    cy.get('textarea[placeholder*="Pega aquí el texto"]')
      .type('Este es un texto de prueba para la actividad de lectura crítica.');

    // 4) Fecha límite opcional
    cy.get('input[type="date"]').type('2025-11-19');

    // 5) Enviar
    cy.contains('button', /asignar actividad/i).click();

    // 6) Confirmación UI
    cy.contains(/actividad asignada correctamente/i, { timeout: 10000 }).should(
      'exist'
    );
  });

  it('camino infeliz: muestra error si falta algún campo obligatorio', () => {
    // Estamos en /teacher/assign por el beforeEach, sin rellenar nada

    // Sin título / sin texto / sin estudiantes
    cy.contains('button', /asignar actividad/i).click();

    cy.contains(/el título es obligatorio/i).should('exist');
    // si quieres, aquí puedes añadir más asserts según tus mensajes:
    // cy.contains(/debes incluir el texto de lectura/i).should('exist');
    // cy.contains(/selecciona al menos un estudiante/i).should('exist');
  });
});