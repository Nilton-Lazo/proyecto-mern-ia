/// <reference types="cypress" />

describe('Flujo del estudiante con una actividad real', () => {
  const baseApi = Cypress.env('baseApi');
  const studentEmail = Cypress.env('studentEmail');

  // --- Helper para crear actividad para el alumno real ---
  const createActivityForStudent = () => {
    // 1) Login como teacher para conseguir token
    return cy
      .request('POST', `${baseApi}/auth/login`, {
        email: Cypress.env('teacherEmail'),
        password: Cypress.env('teacherPass'),
      })
      .then((resLogin) => {
        expect(resLogin.status, 'status login teacher').to.eq(200);
        const { token } = resLogin.body;
        expect(token, 'token de teacher').to.exist;

        // 2) Obtener lista de estudiantes
        return cy
          .request({
            method: 'GET',
            url: `${baseApi}/teacher/students`,
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((resStu) => {
            expect(resStu.status, 'status GET /teacher/students').to.eq(200);
            const students = resStu.body.students || resStu.body;

            expect(
              students,
              'lista de estudiantes'
            ).to.be.an('array').and.not.be.empty;

            // Buscamos el alumno por email; si no está, usamos el primero
            const target =
              students.find((s) => s.email === studentEmail) || students[0];

            expect(
              target,
              `estudiante para email ${studentEmail} (o primero de la lista)`
            ).to.exist;

            const studentId = target._id;

            // 3) Crear actividad para ese alumno
            const title = `Actividad E2E Cypress ${Date.now()}`;

            return cy
              .request({
                method: 'POST',
                url: `${baseApi}/teacher/activities`,
                headers: { Authorization: `Bearer ${token}` },
                body: {
                  title,
                  instructions:
                    'Lee el texto y responde con tu opinión personal.',
                  text:
                    'La inteligencia artificial está transformando la manera en que aprendemos y enseñamos.',
                  dueAt: null,
                  assignees: [studentId],
                },
              })
              .then((resAct) => {
                expect(
                  resAct.status,
                  'status POST /teacher/activities'
                ).to.be.oneOf([200, 201]);

                // El backend devuelve { ok, activityId } (según tu error anterior)
                const body = resAct.body || {};
                const activityId =
                  body.activityId || body._id || body.activity?._id;

                expect(activityId, 'activityId devuelto por el POST').to.exist;

                // No necesitamos pedirla por id; construimos un objeto
                // con lo que nos importa para el test.
                return {
                  _id: activityId,
                  title,
                };
              });
          });
      });
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('camino feliz: student ve la actividad, guarda borrador y la entrega', () => {
    // 1) Creamos la actividad por API
    createActivityForStudent().then((activity) => {
      // 2) Login como student (usa tu custom command real)
      cy.asStudent();

      // 3) Ir a Mis actividades
      cy.visit('/student/activities');

      // 4) La actividad recién creada debe estar listada
      cy.contains(activity.title, { timeout: 10000 }).should('exist');

      // 5) Entrar al detalle
      cy.contains(activity.title).click();

      // 6) Página de detalle
      cy.contains(activity.title).should('exist');
      cy.contains(/tu respuesta/i).should('exist');

      // 7) Escribir respuesta
      const respuesta =
        'Creo que la IA puede complementar al docente, pero no reemplazarlo.';
      cy.get('textarea').clear().type(respuesta);

      // 8) Guardar borrador
      cy.contains(/guardar borrador/i).click();
      cy.contains(/borrador guardado/i, { timeout: 5000 }).should('exist');

      // 9) Enviar actividad
      cy.contains(/enviar actividad/i).click();
      cy.contains(/entregada/i, { timeout: 5000 }).should('exist');
      cy.contains(/progreso:\s*100%/i).should('exist');
    });
  });
});