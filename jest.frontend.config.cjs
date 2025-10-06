/** jest.frontend.config.cjs */
module.exports = {
  displayName: 'frontend',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/tests/frontend'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],

  transform: {
    '^.+\\.(t|j)sx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
        plugins: [
          ['babel-plugin-transform-vite-meta-env', { VITE_API_URL: 'http://localhost:4000' }],
          ['babel-plugin-transform-import-meta', { module: 'CommonJS' }],
        ],
      },
    ],
  },

  // Deja que Jest transpile ESM de RRv7
  transformIgnorePatterns: ['/node_modules/(?!(react-router|react-router-dom)/)'],

  // MUY IMPORTANTE: forzar una ÚNICA copia (la del root)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/frontend/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|svg)$': '<rootDir>/tests/frontend/__mocks__/fileMock.js',
    '^recharts$': '<rootDir>/tests/frontend/__mocks__/rechartsMock.tsx',

    // <-- TODAS desde src/frontend/node_modules
    '^react$': '<rootDir>/src/frontend/node_modules/react',
    '^react/(.*)$': '<rootDir>/src/frontend/node_modules/react/$1',
    '^react-dom$': '<rootDir>/src/frontend/node_modules/react-dom',
    '^react-dom/(.*)$': '<rootDir>/src/frontend/node_modules/react-dom/$1',
    '^react-router$': '<rootDir>/src/frontend/node_modules/react-router',
    '^react-router/(.*)$': '<rootDir>/src/frontend/node_modules/react-router/$1',
    '^react-router-dom$': '<rootDir>/src/frontend/node_modules/react-router-dom',
    '^react-router-dom/(.*)$':
        '<rootDir>/src/frontend/node_modules/react-router-dom/$1',
  },

  // Ayuda al resolver a mirar también el node_modules del frontend si hace falta
  moduleDirectories: ['node_modules', '<rootDir>/src/frontend/node_modules'],
  transformIgnorePatterns: ['/node_modules/(?!(react-router|react-router-dom)/)'],

  collectCoverageFrom: [
    'src/frontend/src/**/*.{ts,tsx}',
    '!src/frontend/src/main.tsx',
    '!src/frontend/src/vite-env.d.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/frontend',
  coverageReporters: ['text', 'html'],
};