/// <reference types="cypress" />

describe('Flujo del estudiante — ruta de aprendizaje con IA', () => {
  const mockQuestions = [
    { questionText: '¿Cuál es la idea principal del texto?', type: 'main_idea', order: 1 },
    { questionText: '¿Qué dato literal menciona el autor?', type: 'literal', order: 2 },
    { questionText: '¿Qué puedes inferir del párrafo?', type: 'inferential', order: 3 },
    { questionText: '¿Qué término clave aparece?', type: 'vocabulary', order: 4 },
    { questionText: '¿Cuál es la postura del autor?', type: 'critical', order: 5 },
  ];

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.stubStudentActivityAI();
  });

  it('camino feliz: ve actividad por área, genera preguntas, guarda borrador y entrega', () => {
    cy.createActivityForStudent({
      area: 'Comunicación',
      topic: 'IA en educación',
    }).then((activity) => {
      cy.asStudent();
      cy.visit('/student/activities');

      cy.contains('h1', /mis actividades/i).should('exist');
      cy.contains(/organiza tus lecturas por área/i).should('exist');
      cy.contains(activity.title, { timeout: 10000 }).should('exist');
      cy.contains(/comunicación/i).should('exist');

      cy.contains('a', /^iniciar$/i).click();

      cy.get('h1').contains(activity.title).should('exist');
      cy.contains(/lectura asignada/i).should('exist');

      cy.contains('button', /generar preguntas/i).click();
      cy.wait('@genQuestions');

      cy.contains(/preguntas generadas por ia/i).should('exist');
      cy.get('textarea[placeholder*="Escribe tu respuesta"]')
        .first()
        .type('La IA complementa al docente en el aula.');

      cy.contains('button', /guardar borrador/i).click();
      cy.contains(/borrador guardado/i, { timeout: 8000 }).should('exist');

      cy.contains('button', /enviar actividad/i).click();
      cy.wait('@submitActivity');

      cy.contains(/actividad entregada/i, { timeout: 8000 }).should('exist');
      cy.contains(/mapa de mejora lectora/i).should('exist');
    });
  });

  it('autosave: conserva respuesta al navegar fuera y volver', () => {
    cy.createActivityForStudent().then((activity) => {
      const respuesta = 'Respuesta parcial guardada automáticamente.';

      cy.asStudent();
      cy.visit(`/student/activities/${activity._id}`);

      cy.contains('button', /generar preguntas/i).click();
      cy.wait('@genQuestions');

      cy.intercept('POST', '**/student/activities/*/autosave').as('autosave');
      cy.get('textarea[placeholder*="Escribe tu respuesta"]')
        .first()
        .clear()
        .type(respuesta)
        .blur();

      cy.wait('@autosave', { timeout: 12000 }).its('response.statusCode').should('eq', 200);

      cy.visit('/student/practice');
      cy.contains(/práctica con ia/i).should('exist');

      cy.intercept('GET', `**/student/activities/${activity._id}`, {
        statusCode: 200,
        body: {
          _id: activity._id,
          title: activity.title,
          area: 'Comunicación',
          topic: 'Comprensión lectora E2E',
          text: 'La inteligencia artificial está transformando la educación.',
          instructions: '',
          progressPercent: 45,
          status: 'draft',
          displayStatus: 'en_progreso',
          questionsGenerated: true,
          questions: mockQuestions,
          questionAnswers: [
            { questionIndex: 0, answer: respuesta, feedback: '', isCorrect: '' },
            { questionIndex: 1, answer: '', feedback: '', isCorrect: '' },
            { questionIndex: 2, answer: '', feedback: '', isCorrect: '' },
            { questionIndex: 3, answer: '', feedback: '', isCorrect: '' },
            { questionIndex: 4, answer: '', feedback: '', isCorrect: '' },
          ],
          aiAnalysis: { mainIdea: 'La IA transforma la educación' },
        },
      });

      cy.visit(`/student/activities/${activity._id}`);
      cy.get('textarea[placeholder*="Escribe tu respuesta"]')
        .first()
        .should('have.value', respuesta);
    });
  });
});
