// cypress/support/commands.js

Cypress.Commands.add('apiLoginAndSetStorage', (email, password) => {
  const baseApi = Cypress.env('baseApi');

  return cy.request('POST', `${baseApi}/auth/login`, {
    email,
    password,
  }).then((res) => {
    expect(res.status).to.eq(200);
    const { token, user } = res.body;

    window.localStorage.setItem('token', token);
    window.localStorage.setItem('user', JSON.stringify(user));

    return user;
  });
});

// Versión simple, sin validate complicado
Cypress.Commands.add('asTeacher', () => {
  const email = Cypress.env('teacherEmail');
  const password = Cypress.env('teacherPass');
  const baseApi = Cypress.env('baseApi');

  cy.session(
    ['teacher', email],
    () => {
      cy.visit('/');              // mismo origen
      cy.apiLoginAndSetStorage(email, password);
    }
  );
});

Cypress.Commands.add('asStudent', () => {
  const email = Cypress.env('studentEmail');
  const password = Cypress.env('studentPass');

  cy.session(
    ['student', email],
    () => {
      cy.visit('/');
      cy.apiLoginAndSetStorage(email, password);
    }
  );
});