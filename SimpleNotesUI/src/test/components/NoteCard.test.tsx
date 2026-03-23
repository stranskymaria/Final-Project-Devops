import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NoteCard from '../../../components/NoteCard';
import { Note } from '../../../types';

const mockNote: Note = {
  id: 1,
  title: 'Test Note',
  content: 'This is a test note content',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

describe('NoteCard', () => {
  it('renders note title and content', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    
    render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is a test note content')).toBeInTheDocument();
  });

  it('displays formatted date', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    
    render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    
    render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const editButton = screen.getByLabelText('Edit note');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockNote);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    
    render(<NoteCard note={mockNote} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByLabelText('Delete note');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockNote.id);
  });
});