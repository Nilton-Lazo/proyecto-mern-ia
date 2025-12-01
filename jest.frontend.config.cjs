/** @type {import('jest').Config} */
module.exports = {
  // 👉 preset pensado para ESM
  preset: 'ts-jest/presets/default-esm',

  testEnvironment: 'jsdom',
  rootDir: '.',

  // Solo tests de frontend
  testMatch: ['<rootDir>/tests/frontend/**/*.test.tsx'],

  // Setup para jest-dom, ResizeObserver, etc.
  setupFilesAfterEnv: ['<rootDir>/tests/jest.frontend.setup.js'],

  // Tratamos .ts y .tsx como módulos ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // ts-jest en modo ESM con nuestro tsconfig
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.jest.frontend.json',
        diagnostics: false // opcional: no frenar por warnings de TS
      }
    ]
  },

  // Mapeo típico recomendado por ts-jest para ESM
  moduleNameMapper: {
    // Corrige imports relativos que terminan en .js
    '^(\\.{1,2}/.*)\\.js$': '$1',

    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',

    '^\\.\\./config/env$': '<rootDir>/tests/frontend/env.jest.ts'
  }
};