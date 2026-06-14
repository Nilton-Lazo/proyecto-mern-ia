/** @type {import('jest').Config} */
module.exports = {
  displayName: 'unit-backend',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit/backend'],
  setupFilesAfterEnv: ['<rootDir>/tests/support/jest.setup.js'],
  collectCoverageFrom: [
    'src/backend/**/*.js',
    '!src/backend/node_modules/**',
    '!src/backend/index.js',
  ],
  coverageDirectory: '<rootDir>/coverage/unit-backend',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
};
