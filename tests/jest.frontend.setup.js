// tests/jest.frontend.setup.js

// Matchers extra como toBeInTheDocument()
import '@testing-library/jest-dom';

// Mock simple de ResizeObserver (lo usa Recharts)
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-ignore
global.ResizeObserver = global.ResizeObserver || ResizeObserver;