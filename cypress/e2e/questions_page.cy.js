/// <reference types="cypress" />

describe('Página de preguntas (student)', () => {
  const textoDemo =
    'El espacio es el continuo tridimensional que ocupa la materia y la energía.';

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.asStudent();
    cy.visit('/questions');
  });

  it('camino feliz: genera preguntas y dispara llamada a /api/ai/questions', () => {
    cy.intercept('POST', '**/ai/questions', {
      statusCode: 200,
      body: { data: { questions: ['¿Cuál es la idea principal?', '¿Qué inferencia puedes hacer?'] } },
    }).as('genQuestions');

    cy.intercept('POST', '**/ai/biases', {
      statusCode: 200,
      body: { biases: ['generalización'] },
    }).as('genBiases');

    cy.contains(/generador de preguntas y retroalimentación/i).should('exist');

    cy.get('textarea[placeholder*="Escribe o pega aquí"]')
      .should('be.visible')
      .clear()
      .type(textoDemo);

    cy.contains('button', /generar preguntas/i).click();

    cy.wait('@genQuestions').its('response.statusCode').should('be.within', 200, 299);
    cy.wait('@genBiases').its('response.statusCode').should('be.within', 200, 299);

    cy.contains(/sesgos detectados en el texto/i).should('exist');
  });

  it('camino infeliz: botón deshabilitado sin texto', () => {
    cy.get('textarea').first().clear();

    cy.contains('button', /generar preguntas/i).should('be.visible').and('be.disabled');

    cy.contains(/generador de preguntas y retroalimentación/i).should('exist');
  });
});
