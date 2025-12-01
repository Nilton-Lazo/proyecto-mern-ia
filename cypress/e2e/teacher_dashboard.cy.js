/// <reference types="cypress" />

describe('Panel docente con backend real', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('camino feliz: un teacher ve su panel y las métricas reales', () => {
    // 1) Login real como docente (usa tu API y tu BD)
    cy.asTeacher();

    // 2) Ir al dashboard
    cy.visit('/teacher/dashboard');

    // 3) Verificar que estoy en la ruta correcta
    cy.location('pathname').should('eq', '/teacher/dashboard');

    // 4) Encabezados básicos
    cy.contains(/panel docente/i).should('exist');
    cy.contains(/gestiona actividades/i).should('exist');

    // 5) KPIs: que existan y sean números válidos (no controlamos el valor exacto)
    cy.contains('Actividades')
      .parent()
      .within(() => {
        cy.get('p')
          .eq(1) // el número grande
          .invoke('text')
          .then((txt) => Number(txt.trim()))
          .should('be.gte', 0); // 0 o más
      });

    cy.contains('Estudiantes')
      .parent()
      .within(() => {
        cy.get('p')
          .eq(1)
          .invoke('text')
          .then((txt) => Number(txt.trim()))
          .should('be.gte', 0);
      });

    cy.contains('Progreso promedio')
      .parent()
      .within(() => {
        cy.contains('%')
          .invoke('text')
          .then((txt) => Number(txt.replace('%', '').trim()))
          .should('be.gte', 0)
          .and('be.lte', 100);
      });

    // 6) Tabla: que exista y tenga 0 o más filas
    cy.contains(/actividades asignadas/i).should('exist');

    cy.get('table tbody tr')
      .its('length')
      .should('be.gte', 0); // si SABES que siempre habrá alguna, cambia a .should('be.gte', 1)

    // 7) Acciones rápidas visibles
    cy.contains('Asignar nueva actividad').should('exist');
    cy.contains('Ver reportes').should('exist');
  });

  it('camino infeliz (protección): sin login no entra al panel docente', () => {
    // Sin llamar a cy.asTeacher, vamos directo al dashboard
    cy.visit('/teacher/dashboard');

    // RoleRoute + Auth deberían redirigir.
    // Ajusta el matcher según a dónde rediriges en tu app (login, /, /questions, etc.)
    cy.location('pathname').should('match', /(login|questions|\/)$/);
  });

  it('camino infeliz (autorización): un student no puede ver /teacher/dashboard', () => {
    cy.asStudent();

    cy.visit('/teacher/dashboard');

    // Igual que tu prueba anterior: ver que NO se queda en esa ruta
    cy.location('pathname').should('match', /(questions|\/)$/);
  });
});