import '@testing-library/jest-dom';

// ResizeObserver que usa Recharts
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
(global as any).ResizeObserver = ResizeObserver;

// Mock muy simple de scrollTo si algún gráfico lo usa
window.scrollTo = window.scrollTo || (() => {});
