
import { API_BASE_URL } from '../constants';
import { Note, NewNote, UpdateNote } from '../types';

const handleResponse = async <T,>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getAllNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_BASE_URL}/notes`);
  return handleResponse<Note[]>(response);
};

export const createNote = async (note: NewNote): Promise<Note> => {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  return handleResponse<Note>(response);
};

export const updateNote = async (id: number, note: UpdateNote): Promise<Note> => {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  return handleResponse<Note>(response);
};

export const deleteNote = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
};
   