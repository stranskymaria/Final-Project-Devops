
import request from 'supertest';
// FIX: Import Jest globals to resolve TypeScript errors for test functions.
import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
// FIX: Import 'process' to provide type definitions for process.exit.
import process from 'process';
import app from '../../src/app';
import pool from '../../src/services/db';

describe('Notes API Integration Tests', () => {
  let noteId: number;

  beforeAll(async () => {
    // Ensure the connection pool is up before tests
    try {
      await pool.query('SELECT 1');
    } catch (error) {
      console.error('Could not connect to test database for integration tests.', error);
      process.exit(1);
    }
  });

  beforeEach(async () => {
    // Clean the notes table before each test
    await pool.query('DELETE FROM notes');
    // Seed one note for tests that need an existing note
    const [result]: any = await pool.query(
      "INSERT INTO notes (title, content) VALUES ('Test Note', 'This is a test note.')"
    );
    noteId = result.insertId;
  });

  afterAll(async () => {
    // Clean up after all tests are done
    await pool.query('DELETE FROM notes');
    await pool.end();
  });

  describe('POST /api/notes', () => {
    it('should create a new note and return 201', async () => {
      const newNote = {
        title: 'My New Note',
        content: 'Content for my new note.',
      };
      const response = await request(app)
        .post('/api/notes')
        .send(newNote);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newNote.title);
      expect(response.body.content).toBe(newNote.content);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ content: 'Some content' });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/notes', () => {
    it('should return a list of notes and status 200', async () => {
      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Test Note');
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should return a single note and status 200', async () => {
      const response = await request(app).get(`/api/notes/${noteId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(noteId);
      expect(response.body.title).toBe('Test Note');
    });

    it('should return 404 for a non-existent note', async () => {
      const response = await request(app).get('/api/notes/9999');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note and return 200', async () => {
      const updatedData = {
        title: 'Updated Title',
        content: 'Updated content.',
      };
      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.content).toBe(updatedData.content);
    });

    it('should return 404 when updating a non-existent note', async () => {
        const response = await request(app)
          .put('/api/notes/9999')
          .send({ title: 'Non-existent' });
        expect(response.status).toBe(404);
      });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note and return 204', async () => {
      const response = await request(app).delete(`/api/notes/${noteId}`);
      expect(response.status).toBe(204);

      // Verify it's actually gone
      const getResponse = await request(app).get(`/api/notes/${noteId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent note', async () => {
      const response = await request(app).delete('/api/notes/9999');
      expect(response.status).toBe(404);
    });
  });
});