
import React from 'react';
import { PlusIcon } from './Icons';

interface HeaderProps {
  onCreateNote: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateNote }) => {
  return (
    <header className="bg-surface shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📝</span>
          <h1 className="text-2xl font-bold text-brand-dark">
            Gemini Notes
          </h1>
        </div>
        <button
          onClick={onCreateNote}
          className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-300"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
   