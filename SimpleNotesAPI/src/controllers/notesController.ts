
import { Request, Response } from 'express';
import pool from '../services/db';
import { Note } from '../models/note';
import { ResultSetHeader } from 'mysql2';

export const getAllNotes = async (req: Request, res: Response): Promise<Response> => {
    try {
        const [rows] = await pool.query<Note[]>('SELECT * FROM notes ORDER BY updated_at DESC');
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getNoteById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query<Note[]>('SELECT * FROM notes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error(`Error fetching note ${id}:`, error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createNote = async (req: Request, res: Response): Promise<Response> => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO notes (title, content) VALUES (?, ?)',
            [title, content]
        );
        const newNoteId = result.insertId;
        const [newNote] = await pool.query<Note[]>('SELECT * FROM notes WHERE id = ?', [newNoteId]);
        
        return res.status(201).json(newNote[0]);
    } catch (error) {
        console.error('Error creating note:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateNote = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title && !content) {
        return res.status(400).json({ message: 'At least title or content must be provided' });
    }

    try {
        const [existingNote] = await pool.query<Note[]>('SELECT * FROM notes WHERE id = ?', [id]);
        if (existingNote.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const newTitle = title || existingNote[0].title;
        const newContent = content || existingNote[0].content;

        await pool.query(
            'UPDATE notes SET title = ?, content = ? WHERE id = ?',
            [newTitle, newContent, id]
        );

        const [updatedNote] = await pool.query<Note[]>('SELECT * FROM notes WHERE id = ?', [id]);
        return res.status(200).json(updatedNote[0]);
    } catch (error) {
        console.error(`Error updating note ${id}:`, error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteNote = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM notes WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }
        return res.status(204).send(); // No Content
    } catch (error) {
        console.error(`Error deleting note ${id}:`, error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
