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

// Mock de IntersectionObserver (scroll reveal en landing/auth)
class IntersectionObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe(el) {
    this.cb([{ isIntersecting: true, target: el }]);
  }
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = global.IntersectionObserver || IntersectionObserver;

globalThis.importMetaEnv = {
  VITE_API_URL: "http://localhost:3000"
};

globalThis.importMeta = { env: globalThis.importMetaEnv };
