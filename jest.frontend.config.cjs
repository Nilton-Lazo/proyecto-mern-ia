/** jest.frontend.config.cjs */
const path = require('path');

// Resuelve la CARPETA del paquete desde el node_modules del frontend
const resolvePkgDirFromFrontend = (pkg) => {
  // localiza package.json del paquete, luego quita 'package.json' para obtener la carpeta
  const pkgJsonPath = require.resolve(`${pkg}/package.json`, {
    paths: [path.resolve(__dirname, 'src/frontend')],
  });
  return path.dirname(pkgJsonPath);
};

// 👇 NUEVO: resuelve la ENTRADA del paquete (no la carpeta)
const resolvePkgEntryFromFrontend = (pkg) =>
  require.resolve(pkg, { paths: [path.resolve(__dirname, 'src/frontend')] });

const reactDir   = resolvePkgDirFromFrontend('react');
const reactDomDir= resolvePkgDirFromFrontend('react-dom');
const rrDir      = resolvePkgDirFromFrontend('react-router');

// 👇 ENTRADAS (lo importante)
const rrEntry    = resolvePkgEntryFromFrontend('react-router');
const rrdEntry   = resolvePkgEntryFromFrontend('react-router-dom');

module.exports = {
  displayName: 'frontend',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/tests/frontend'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],

  transform: {
    '^.+\\.(mjs|cjs|js|jsx|ts|tsx)$': [
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

  // Permite transpilar ESM de react-router v7
  transformIgnorePatterns: ['/node_modules/(?!((\\.pnpm/)?(react-router|react-router-dom)(@|/)))'],

  // 🔑 Forzamos a que TODAS estas libs salgan del node_modules del frontend
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/frontend/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|svg)$': '<rootDir>/tests/frontend/__mocks__/fileMock.js',
    '^recharts$': '<rootDir>/tests/frontend/__mocks__/rechartsMock.tsx',

    // react / react-dom puede seguir al directorio
    '^react$': reactDir,
    '^react/(.*)$': `${reactDir}/$1`,
    '^react-dom$': reactDomDir,
    '^react-dom/(.*)$': `${reactDomDir}/$1`,

    // ⬇️ CLAVE: Paquetes de router -> ENTRADA del paquete
    '^react-router$': rrEntry,
    '^react-router/(.*)$': `${rrDir}/$1`,
    '^react-router-dom$': rrdEntry,
  },

  // Prioriza el node_modules del frontend y luego el del root
  moduleDirectories: ['<rootDir>/src/frontend/node_modules', 'node_modules'],

  collectCoverageFrom: [
    'src/frontend/src/**/*.{ts,tsx}',
    '!src/frontend/src/main.tsx',
    '!src/frontend/src/vite-env.d.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/frontend',
  coverageReporters: ['text', 'html'],
};
