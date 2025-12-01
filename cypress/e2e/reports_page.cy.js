/// <reference types="cypress" />

describe('Página de Reportes', () => {
  const baseApi = Cypress.env('baseApi');

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.asTeacher(); // o asStudent, según a quién permitas entrar
  });

  it('camino feliz: muestra totales y gráficos', () => {
    cy.intercept('GET', `${baseApi}/ai/reports`).as('getReports');

    cy.visit('/reports');

    cy.wait('@getReports').then((interception) => {
        const status = interception.response?.statusCode;
        //expect(interception.response?.statusCode).to.eq(200);
        expect(status).to.be.oneOf([200, 304]);
    });

    cy.contains(/reportes de respuestas/i).should('exist');
    cy.contains(/total de respuestas/i).should('exist');

    // Los contenedores de gráficos deberían existir
    cy.contains(/distribución/i).should('exist');
    cy.contains(/comparativa/i).should('exist');
  });

  it('camino infeliz: si el API falla, se muestra mensaje de error', () => {
    // Simulamos un fallo de red en vez de un 500 con body extraño
    cy.intercept('GET', `${baseApi}/ai/reports`, {
      forceNetworkError: true,
    }).as('getReportsFail');

    cy.visit('/reports');

    cy.wait('@getReportsFail');

    // El componente debería entrar en el catch y mostrar este mensaje
    cy.contains(/no se pudieron cargar los reportes/i).should('exist');
  });
});