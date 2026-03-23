# Testing Documentation

This project uses **Vitest** for testing along with **React Testing Library** for component testing.

## Setup

The testing setup includes:
- **Vitest**: Fast unit test framework that works seamlessly with Vite
- **React Testing Library**: For testing React components
- **Jest DOM**: Additional matchers for DOM testing
- **User Event**: For simulating user interactions

## Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test -- --watch
```

## Test Structure

Tests are organized in the `src/test/` directory:

```
src/test/
├── setup.ts                 # Test setup and global configuration
├── App.test.tsx             # Main App component tests
├── components/              # Component tests
│   ├── Header.test.tsx
│   ├── NoteCard.test.tsx
│   ├── NoteList.test.tsx
│   └── Spinner.test.tsx
└── services/                # Service layer tests
    └── noteService.test.ts
```

## Test Coverage

The test suite covers:

### Components
- **Header**: Renders correctly and handles user interactions
- **NoteCard**: Displays note data and handles edit/delete actions
- **NoteList**: Shows notes or empty state appropriately
- **Spinner**: Renders loading indicator

### Services
- **noteService**: API calls for CRUD operations with proper error handling

### Main App
- **App**: Loading states, error handling, and overall integration

## Writing Tests

### Component Testing Example
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Service Testing Example
```ts
import { describe, it, expect, vi } from 'vitest';
import { myService } from './myService';

// Mock fetch or external dependencies
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('myService', () => {
  it('handles API calls correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ data: 'test' }),
    });

    const result = await myService();
    expect(result).toEqual({ data: 'test' });
  });
});
```

## Installation Requirements

Before running tests, install dependencies:

```bash
npm install
```

The following testing dependencies are included:
- `vitest`: Test framework
- `@testing-library/react`: React component testing utilities
- `@testing-library/jest-dom`: Additional DOM matchers
- `@testing-library/user-event`: User interaction simulation
- `@vitest/ui`: Test UI interface
- `@vitest/coverage-v8`: Coverage reporting
- `jsdom`: DOM environment for tests