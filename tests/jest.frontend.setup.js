// tests/jest.frontend.setup.js

// Matchers extra como toBeInTheDocument()
require('@testing-library/jest-dom');

// Polyfill de TextEncoder/TextDecoder (lo necesitan algunas libs como react-router)
const { TextEncoder, TextDecoder } = require('util');

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

// Mock simple de ResizeObserver (lo usa Recharts)
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = global.ResizeObserver || ResizeObserver;

globalThis.importMetaEnv = {
  VITE_API_URL: "http://localhost:3000"
};

globalThis.importMeta = { env: globalThis.importMetaEnv };
