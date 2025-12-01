/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: '.',

  // Solo tests de frontend
  testMatch: ['<rootDir>/tests/frontend/**/*.test.tsx'],

  // Setup para jest-dom, ResizeObserver, etc.
  setupFilesAfterEnv: ['<rootDir>/tests/jest.frontend.setup.js'],

  // IMPORTANTe: sólo transformamos .ts / .tsx con ts-jest
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.frontend.json'
      }
    ]
  },

  // Para evitar doble React (usa el React del frontend)
  moduleNameMapper: {
    '^react$': '<rootDir>/src/frontend/node_modules/react',
    '^react-dom$': '<rootDir>/src/frontend/node_modules/react-dom'
  }
};