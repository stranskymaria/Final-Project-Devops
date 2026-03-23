import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAllNotes, createNote, updateNote, deleteNote } from '../../../services/noteService';
import { Note, NewNote, UpdateNote } from '../../../types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock constants
vi.mock('../../../constants', () => ({
  API_BASE_URL: 'http://localhost:8000',
}));

describe('noteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAllNotes', () => {
    it('fetches all notes successfully', async () => {
      const mockNotes: Note[] = [
        {
          id: 1,
          title: 'Test Note',
          content: 'Test content',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockNotes),
      });

      const result = await getAllNotes();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/notes');
      expect(result).toEqual(mockNotes);
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValueOnce({ message: 'Server error' }),
      });

      await expect(getAllNotes()).rejects.toThrow('Server error');
    });
  });

  describe('createNote', () => {
    it('creates a note successfully', async () => {
      const newNote: NewNote = {
        title: 'New Note',
        content: 'New content',
      };

      const createdNote: Note = {
        id: 1,
        title: 'New Note',
        content: 'New content',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(createdNote),
      });

      const result = await createNote(newNote);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });
      expect(result).toEqual(createdNote);
    });
  });

  describe('updateNote', () => {
    it('updates a note successfully', async () => {
      const updateData: UpdateNote = {
        title: 'Updated Note',
        content: 'Updated content',
      };

      const updatedNote: Note = {
        id: 1,
        title: 'Updated Note',
        content: 'Updated content',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T01:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(updatedNote),
      });

      const result = await updateNote(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/notes/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(updatedNote);
    });
  });

  describe('deleteNote', () => {
    it('deletes a note successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await deleteNote(1);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/notes/1', {
        method: 'DELETE',
      });
    });

    it('throws error when delete fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValueOnce({ message: 'Note not found' }),
      });

      await expect(deleteNote(1)).rejects.toThrow('Note not found');
    });
  });
});