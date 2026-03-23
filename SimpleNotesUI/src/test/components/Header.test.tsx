import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../../../components/Header';

describe('Header', () => {
  it('renders the app title', () => {
    const mockOnCreateNote = vi.fn();
    render(<Header onCreateNote={mockOnCreateNote} />);
    
    expect(screen.getByText('Gemini Notes')).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('renders the new note button', () => {
    const mockOnCreateNote = vi.fn();
    render(<Header onCreateNote={mockOnCreateNote} />);
    
    const newNoteButton = screen.getByRole('button', { name: /new note/i });
    expect(newNoteButton).toBeInTheDocument();
  });

  it('calls onCreateNote when new note button is clicked', () => {
    const mockOnCreateNote = vi.fn();
    render(<Header onCreateNote={mockOnCreateNote} />);
    
    const newNoteButton = screen.getByRole('button', { name: /new note/i });
    fireEvent.click(newNoteButton);
    
    expect(mockOnCreateNote).toHaveBeenCalledTimes(1);
  });
});