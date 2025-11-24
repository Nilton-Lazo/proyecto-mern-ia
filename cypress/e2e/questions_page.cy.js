/// <reference types="cypress" />

// Pruebas E2E sobre la página de "Preguntas" usando tu backend real

describe('Página de preguntas (student)', () => {
  const textoDemo =
    'El espacio es el continuo tridimensional que ocupa la materia y la energía.';

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.asStudent();          // login real contra tu API
    cy.visit('/questions');  // entra al generador
  });

  it('camino feliz: un student genera preguntas y se dispara la llamada a /api/ai/questions', () => {
    // 1) Interceptar la llamada real del frontend
    //    Usamos comodín para evitar problemas de baseUrl, /api extra, etc.
    cy.intercept('POST', '**/ai/questions').as('genQuestions');

    // 2) Página cargada
    cy.contains(/generador de preguntas y retroalimentación/i).should('exist');

    // 3) Escribir el texto en el primer textarea
    cy.get('textarea')
      .first()
      .should('be.visible')
      .clear()
      .type(textoDemo);

    // 4) Click en "Generar preguntas"
    cy.contains('button', /generar preguntas/i).click();

    // 5) Esperamos la request real al backend
    cy.wait('@genQuestions')
      .its('response.statusCode')
      .should('be.within', 200, 299);   // debe ser 2xx

    // 6) (Opcional) Alguna aserción suave de UI:
    //    simplemente verificamos que la página no se rompió y sigue mostrando el panel.
    cy.contains(/sesgos detectados en el texto/i).should('exist');
  });

  it('camino infeliz: si intenta generar sin texto no debe romper la página', () => {
    // En este flujo NO interceptamos nada, solo validamos UX básica.

    // Aseguramos que el textarea esté vacío
    cy.get('textarea').first().clear();

    // El botón debe estar deshabilitado cuando no hay texto
    cy.contains('button', /generar preguntas/i)
      .should('be.visible')
      .and('be.disabled');

    // Confirmamos que seguimos en la página y la UI está estable
    cy.contains(/generador de preguntas y retroalimentación/i).should('exist');
    cy.get('textarea').first().should('be.visible');
  });
});