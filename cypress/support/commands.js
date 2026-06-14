// cypress/support/commands.js

function normalizeUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? raw._id ?? '',
    email: raw.email ?? '',
    nombres: raw.nombres ?? '',
    role: raw.role ?? 'student',
  };
}

Cypress.Commands.add('apiLoginAndSetStorage', (email, password) => {
  const baseApi = Cypress.env('baseApi');

  return cy
    .request('POST', `${baseApi}/auth/login`, { email, password })
    .then((res) => {
      expect(res.status).to.eq(200);
      const { token, user } = res.body;
      const normalized = normalizeUser(user);

      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(normalized));

      return normalized;
    });
});

Cypress.Commands.add('asTeacher', () => {
  const email = Cypress.env('teacherEmail');
  const password = Cypress.env('teacherPass');

  cy.session(['teacher', email], () => {
    cy.visit('/');
    cy.apiLoginAndSetStorage(email, password);
  });
});

Cypress.Commands.add('asStudent', () => {
  const email = Cypress.env('studentEmail');
  const password = Cypress.env('studentPass');

  cy.session(['student', email], () => {
    cy.visit('/');
    cy.apiLoginAndSetStorage(email, password);
  });
});

/** Crea actividad vía API con área y tema (requiere backend real). */
Cypress.Commands.add('createActivityForStudent', (overrides = {}) => {
  const baseApi = Cypress.env('baseApi');
  const studentEmail = Cypress.env('studentEmail');

  return cy
    .request('POST', `${baseApi}/auth/login`, {
      email: Cypress.env('teacherEmail'),
      password: Cypress.env('teacherPass'),
    })
    .then((resLogin) => {
      expect(resLogin.status).to.eq(200);
      const { token } = resLogin.body;

      return cy
        .request({
          method: 'GET',
          url: `${baseApi}/teacher/students`,
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((resStu) => {
          expect(resStu.status).to.eq(200);
          const students = resStu.body.students || resStu.body;
          expect(students).to.be.an('array').and.not.be.empty;

          const target =
            students.find((s) => s.email === studentEmail) || students[0];
          const title = overrides.title || `Actividad E2E Cypress ${Date.now()}`;

          return cy
            .request({
              method: 'POST',
              url: `${baseApi}/teacher/activities`,
              headers: { Authorization: `Bearer ${token}` },
              body: {
                title,
                area: overrides.area || 'Comunicación',
                topic: overrides.topic || 'Comprensión lectora E2E',
                instructions:
                  overrides.instructions ||
                  'Lee el texto y responde las preguntas generadas por IA.',
                text:
                  overrides.text ||
                  'La inteligencia artificial está transformando la manera en que aprendemos y enseñamos en las aulas.',
                dueAt: overrides.dueAt ?? null,
                assignees: [target._id],
                sourceType: 'text',
              },
            })
            .then((resAct) => {
              expect(resAct.status).to.be.oneOf([200, 201]);
              const body = resAct.body || {};
              const activityId = body.activityId || body._id;
              expect(activityId).to.exist;
              return { _id: activityId, title, area: overrides.area || 'Comunicación' };
            });
        });
    });
});

/** Intercepta endpoints de IA del flujo estudiante para pruebas estables sin Ollama. */
Cypress.Commands.add('stubStudentActivityAI', () => {
  const mockQuestions = [
    { questionText: '¿Cuál es la idea principal del texto?', type: 'main_idea', order: 1 },
    { questionText: '¿Qué dato literal menciona el autor?', type: 'literal', order: 2 },
    { questionText: '¿Qué puedes inferir del párrafo?', type: 'inferential', order: 3 },
    { questionText: '¿Qué término clave aparece?', type: 'vocabulary', order: 4 },
    { questionText: '¿Cuál es la postura del autor?', type: 'critical', order: 5 },
  ];

  cy.intercept('POST', '**/student/activities/*/analyze', {
    statusCode: 200,
    body: {
      ok: true,
      aiAnalysis: {
        mainIdea: 'La IA transforma la educación',
        keywords: ['IA', 'educación', 'aprendizaje'],
        difficulty: 'medio',
        readingTip: 'Subraya ideas principales.',
      },
    },
  }).as('analyze');

  cy.intercept('POST', '**/student/activities/*/generate-questions', {
    statusCode: 200,
    body: {
      ok: true,
      questions: mockQuestions,
      aiAnalysis: {
        mainIdea: 'La IA transforma la educación',
        keywords: ['IA', 'educación'],
        difficulty: 'medio',
      },
      progressPercent: 25,
    },
  }).as('genQuestions');

  cy.intercept('POST', '**/student/activities/*/submit', (req) => {
    const answers = req.body?.answers || [];
    req.reply({
      statusCode: 200,
      body: {
        ok: true,
        status: 'submitted',
        score: 82,
        skillScores: {
          literal: 80,
          inferential: 70,
          critical: 65,
          vocabulary: 75,
          main_idea: 88,
        },
        skillRecommendations: [
          { skill: 'main_idea', label: 'Idea principal', level: 'alto', message: 'Buen dominio de idea principal.' },
        ],
        feedbackSummary: 'Buen trabajo en la comprensión del texto.',
        recommendation: 'Refuerza inferencias en lecturas más extensas.',
        motivation: '¡Sigue así!',
        questionAnswers: answers.map((a, i) => ({
          ...a,
          feedback: 'Respuesta evaluada correctamente.',
          isCorrect: 'correcta',
        })),
      },
    });
  }).as('submitActivity');
});
