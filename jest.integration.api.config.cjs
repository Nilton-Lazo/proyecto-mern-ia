/** @type {import('jest').Config} */
module.exports = {
  displayName: 'integration-api',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration/api'],
  setupFilesAfterEnv: ['<rootDir>/tests/support/jest.setup.js'],
  collectCoverageFrom: [
    'src/backend/routes/**/*.js',
    'src/backend/middlewares/**/*.js',
    '!src/backend/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/coverage/integration-api',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
};
