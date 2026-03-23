import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';

// Mock the note service
vi.mock('../../services/noteService', () => ({
  getAllNotes: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header', () => {
    render(<App />);
    expect(screen.getByText('Gemini Notes')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    render(<App />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    const { getAllNotes } = await import('../../services/noteService');
    vi.mocked(getAllNotes).mockRejectedValue(new Error('Fetch failed'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('An Error Occurred')).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch notes/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no notes', async () => {
    const { getAllNotes } = await import('../../services/noteService');
    vi.mocked(getAllNotes).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet.')).toBeInTheDocument();
    });
  });
});