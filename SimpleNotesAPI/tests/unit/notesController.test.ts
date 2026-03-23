
import { Request, Response } from 'express';
// FIX: Import Jest globals to resolve TypeScript errors for test functions.
import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import * as notesController from '../../src/controllers/notesController';

// Mock the database service at the top level
jest.mock('../../src/services/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    execute: jest.fn(),
    getConnection: jest.fn(),
    end: jest.fn(),
  },
}));

import pool from '../../src/services/db';
const mockedPool = pool as jest.Mocked<typeof pool>;

describe('Notes Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }) as any,
      send: jest.fn().mockReturnThis() as any,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up any potential hanging references
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('getAllNotes', () => {
    it('should return all notes and a 200 status', async () => {
      const mockNotes = [
        { id: 1, title: 'Note 1', content: 'Content 1' },
        { id: 2, title: 'Note 2', content: 'Content 2' },
      ];
      (mockedPool.query as jest.MockedFunction<any>).mockResolvedValue([mockNotes]);

      await notesController.getAllNotes(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockNotes);
      expect(responseObject).toEqual(mockNotes);
    });

    it('should return a 500 status on database error', async () => {
        (mockedPool.query as jest.MockedFunction<any>).mockRejectedValue(new Error('DB Error'));
  
        await notesController.getAllNotes(mockRequest as Request, mockResponse as Response);
  
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('createNote', () => {
    it('should create a note and return it with a 201 status', async () => {
        mockRequest.body = { title: 'New Note', content: 'New Content' };
        const insertId = 123;
        const newNote = { id: insertId, title: 'New Note', content: 'New Content' };

        (mockedPool.query as jest.MockedFunction<any>)
            .mockResolvedValueOnce([{ insertId }]) // First call for INSERT
            .mockResolvedValueOnce([[newNote]]);      // Second call for SELECT

        await notesController.createNote(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newNote);
    });

    it('should return 400 if title is missing', async () => {
        mockRequest.body = { content: 'Some content' };

        await notesController.createNote(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Title and content are required' });
    });
  });

  describe('deleteNote', () => {
    it('should return 204 if note is deleted successfully', async () => {
      mockRequest.params = { id: '1' };
      (mockedPool.query as jest.MockedFunction<any>).mockResolvedValue([{ affectedRows: 1 }]);

      await notesController.deleteNote(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 if note to delete is not found', async () => {
      mockRequest.params = { id: '999' };
      (mockedPool.query as jest.MockedFunction<any>).mockResolvedValue([{ affectedRows: 0 }]);

      await notesController.deleteNote(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Note not found' });
    });
  });
});