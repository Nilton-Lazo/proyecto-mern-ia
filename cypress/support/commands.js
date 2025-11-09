// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Helpers para simular login sin backend real
// Login real contra tu API y setear storage como hace tu AuthContext
Cypress.Commands.add('apiLoginAndSetStorage', (email, password) => {
  const baseApi = Cypress.env('baseApi');

  return cy.request('POST', `${baseApi}/auth/login`, {
    email,
    password,
  }).then((res) => {
    expect(res.status).to.eq(200);
    const { token, user } = res.body;

    // Inyectamos en localStorage tal como lo hace tu AuthContext
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('user', JSON.stringify(user));

    return user;
  });
});

// Crea/recupera sesión cacheada por rol (o por email)
Cypress.Commands.add('sessionLogin', (roleOrEmail) => {
  const email = roleOrEmail.includes('@')
    ? roleOrEmail
    : roleOrEmail === 'teacher'
      ? Cypress.env('teacherEmail')
      : Cypress.env('studentEmail');

  const password =
    roleOrEmail === 'teacher'
      ? Cypress.env('teacherPass')
      : roleOrEmail === 'student'
        ? Cypress.env('studentPass')
        : (roleOrEmail.includes('@') ? Cypress.env('teacherPass') : null);

  // Si pasaste email explícito y es de alumno, ajusta aquí
  const pw = password || Cypress.env('studentPass');

  cy.session(
    ['auth', email],
    () => {
      cy.visit('/'); // abre el origen para poder tocar localStorage
      cy.apiLoginAndSetStorage(email, pw).then(() => {
        // valida que quedó seteado
        expect(window.localStorage.getItem('token')).to.exist;
        expect(window.localStorage.getItem('user')).to.exist;
      });
    },
    {
      validate: () => {
        // valida que la sesión sigue viva
        expect(window.localStorage.getItem('token')).to.exist;
        expect(window.localStorage.getItem('user')).to.exist;
      },
    }
  );
});

// helpers azucarados
Cypress.Commands.add('asTeacher', () => cy.sessionLogin('teacher'));
Cypress.Commands.add('asStudent', () => cy.sessionLogin('student'));