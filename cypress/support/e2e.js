// Import commands.js using ES2015 syntax:
import './commands';

before(function () {
  const baseApi = Cypress.env('baseApi');
  cy.task('ensureE2EUsers', null, { timeout: 60000 });

  cy.request({
    method: 'POST',
    url: `${baseApi}/auth/login`,
    body: {
      email: Cypress.env('teacherEmail'),
      password: Cypress.env('teacherPass'),
    },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status !== 200) {
      throw new Error(
        `Backend/MongoDB no disponible (login → ${res.status}). ` +
          'Ejecuta: docker compose up mongo -d && pnpm seed:e2e && pnpm dev:backend'
      );
    }
  });
});
