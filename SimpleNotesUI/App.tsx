
import React, { useState, useEffect, useCallback } from 'react';
import { Note, NewNote, UpdateNote } from './types';
import { getAllNotes, createNote, updateNote, deleteNote } from './services/noteService';
import Header from './components/Header';
import NoteList from './components/NoteList';
import Modal from './components/Modal';
import NoteForm from './components/NoteForm';
import Spinner from './components/Spinner';

const appDisplayVersion = __APP_DISPLAY_VERSION__;
const deployColor = __APP_DEPLOY_COLOR__;

const deployBadgeStyles: Record<string, string> = {
  staging: 'border-amber-200 bg-amber-100 text-amber-800',
  blue: 'border-blue-200 bg-blue-100 text-blue-800',
  green: 'border-green-200 bg-green-100 text-green-800',
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedNotes = await getAllNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      setError('Failed to fetch notes. Please make sure the backend server is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      } catch (err) {
        setError('Failed to delete note.');
        console.error(err);
      }
    }
  };

  const handleSaveNote = async (noteData: NewNote | UpdateNote) => {
    try {
      if (editingNote) {
        const updatedNote = await updateNote(editingNote.id, noteData as UpdateNote);
        setNotes(prevNotes => prevNotes.map(n => n.id === editingNote.id ? updatedNote : n));
      } else {
        const newNote = await createNote(noteData as NewNote);
        setNotes(prevNotes => [newNote, ...prevNotes]);
      }
      setIsModalOpen(false);
      setEditingNote(null);
    } catch (err) {
      setError('Failed to save note.');
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const hasDeployColor = deployColor === 'staging' || deployColor === 'blue' || deployColor === 'green';
  const deployBadgeClassName = hasDeployColor
    ? deployBadgeStyles[deployColor]
    : 'border-slate-200 bg-slate-100 text-slate-600';
  const deployLabel = hasDeployColor ? deployColor : 'local';

  return (
    <div className="min-h-screen font-sans text-on-surface flex flex-col">
      <Header onCreateNote={handleCreateNote} />
      <main className="container mx-auto px-4 py-8 flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
          </div>
        ) : (
          <NoteList notes={notes} onEdit={handleEditNote} onDelete={handleDeleteNote} />
        )}
      </main>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <NoteForm
          onSave={handleSaveNote}
          onCancel={handleCloseModal}
          initialData={editingNote}
        />
      </Modal>
      <footer className="border-t border-slate-200 bg-slate-50/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-slate-500">
          <span className="font-medium text-slate-700">Gemini Notes</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>UI v{appDisplayVersion}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${deployBadgeClassName}`}>
            {deployLabel}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
   
