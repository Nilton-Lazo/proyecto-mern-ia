/** @type {import('jest').Config} */
module.exports = {
  displayName: 'integration-frontend',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/integration/frontend/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/tests/support/jest.frontend.setup.js'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.jest.frontend.json',
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^\\.\\./config/env$': '<rootDir>/tests/support/env.jest.ts',
  },
  collectCoverageFrom: [
    'src/frontend/src/pages/student/**/*.{ts,tsx}',
    'src/frontend/src/services/**/*.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/integration-frontend',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
};
