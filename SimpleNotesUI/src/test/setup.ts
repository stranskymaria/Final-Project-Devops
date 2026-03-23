import '@testing-library/jest-dom';

// Mock window.confirm for tests
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
});

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});