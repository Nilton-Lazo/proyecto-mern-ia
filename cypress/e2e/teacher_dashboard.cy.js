/// <reference types="cypress" />

describe('Panel docente con backend real', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('camino feliz: un teacher ve su panel y las métricas reales', () => {
    cy.asTeacher();
    cy.visit('/teacher/dashboard');

    cy.location('pathname').should('eq', '/teacher/dashboard');
    cy.contains(/panel docente/i).should('exist');
    cy.contains(/gestiona actividades/i).should('exist');

    cy.contains('Actividades')
      .parents('.app-card')
      .first()
      .find('p.text-3xl')
      .invoke('text')
      .then((txt) => Number(txt.trim()))
      .should('be.gte', 0);

    cy.contains('Estudiantes')
      .parents('.app-card')
      .first()
      .find('p.text-3xl')
      .invoke('text')
      .then((txt) => Number(txt.trim()))
      .should('be.gte', 0);

    cy.contains(/progreso promedio/i)
      .parents('div')
      .first()
      .contains('%')
      .invoke('text')
      .then((txt) => Number(txt.replace('%', '').trim()))
      .should('be.gte', 0)
      .and('be.lte', 100);

    cy.contains(/actividades asignadas/i).should('exist');
    cy.get('table tbody tr').its('length').should('be.gte', 0);

    cy.contains('Asignar nueva actividad').should('exist');
    cy.contains('Ver reportes').should('exist');
  });

  it('camino infeliz (protección): sin login no entra al panel docente', () => {
    cy.visit('/teacher/dashboard');
    cy.location('pathname').should('eq', '/login');
  });

  it('camino infeliz (autorización): un student no puede ver /teacher/dashboard', () => {
    cy.asStudent();
    cy.visit('/teacher/dashboard');
    cy.location('pathname').should('eq', '/');
  });
});
