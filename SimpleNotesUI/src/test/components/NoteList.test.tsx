import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoteList from '../../../components/NoteList';
import { Note } from '../../../types';

const mockNotes: Note[] = [
  {
    id: 1,
    title: 'First Note',
    content: 'First note content',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Second Note',
    content: 'Second note content',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  },
];

describe('NoteList', () => {
  it('renders empty state when no notes', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    
    render(<NoteList notes={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('No notes yet.')).toBeInTheDocument();
    expect(screen.getByText('Click "New Note" to get started!')).toBeInTheDocument();
  });

  it('renders note cards when notes exist', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    
    render(<NoteList notes={mockNotes} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
    expect(screen.getByText('First note content')).toBeInTheDocument();
    expect(screen.getByText('Second note content')).toBeInTheDocument();
  });

  it('renders correct number of note cards', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    
    render(<NoteList notes={mockNotes} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const editButtons = screen.getAllByLabelText('Edit note');
    expect(editButtons).toHaveLength(2);
  });
});