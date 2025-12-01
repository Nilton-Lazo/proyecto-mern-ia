// jest.backend.config.cjs
module.exports = {
    testEnvironment: 'node',
    // dónde viven los tests de backend (luego crearemos los nuevos aquí)
    roots: ['<rootDir>/tests/backend'],

    // aquí va tu setup actual
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],

    // opcional: qué archivos medir en coverage
    collectCoverageFrom: [
    'src/backend/**/*.js',
    '!**/node_modules/**',
    ],
};