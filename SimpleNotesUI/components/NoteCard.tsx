
import React from 'react';
import { Note } from '../types';
import { EditIcon, TrashIcon } from './Icons';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-200">
      <div className="p-5 flex-grow">
        <h3 className="text-xl font-bold text-on-surface mb-2 break-words">{note.title}</h3>
        <p className="text-on-surface-secondary text-base whitespace-pre-wrap break-words flex-grow">{note.content}</p>
      </div>
      <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Updated: {formatDate(note.updated_at)}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-gray-500 hover:text-brand-primary hover:bg-brand-light rounded-full transition-colors duration-200"
            aria-label="Edit note"
          >
            <EditIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200"
            aria-label="Delete note"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
   