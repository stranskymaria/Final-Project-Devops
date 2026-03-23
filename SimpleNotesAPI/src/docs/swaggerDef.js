
// Using .js for this file makes it slightly cleaner to define the swagger options
const swaggerJSDoc = require('swagger-jsdoc');
const packageJson = require('../../package.json');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Note Taking API',
    version: packageJson.version,
    description: 'A simple REST API for creating, reading, updating, and deleting notes.',
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Notes',
      description: 'Notes management endpoints'
    },
    {
      name: 'Health',
      description: 'Health check endpoints'
    }
  ],
  components: {
    schemas: {
      Note: {
        type: 'object',
        required: ['id', 'title', 'content', 'created_at', 'updated_at'],
        properties: {
          id: {
            type: 'integer',
            description: 'The auto-generated ID of the note.',
            example: 1,
          },
          title: {
            type: 'string',
            description: 'The title of the note.',
            example: 'My First Note',
          },
          content: {
            type: 'string',
            description: 'The content of the note.',
            example: 'This is the content of my first note.',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'The timestamp when the note was created.',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'The timestamp when the note was last updated.',
          },
        },
      },
      NewNote: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: {
            type: 'string',
            description: 'The title of the note.',
            example: 'A New Adventure',
          },
          content: {
            type: 'string',
            description: 'The content for the new note.',
            example: 'It was a dark and stormy night...',
          },
        },
      },
      UpdateNote: {
         type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The new title for the note.',
            example: 'An Updated Adventure',
          },
          content: {
            type: 'string',
            description: 'The new content for the note.',
            example: 'The storm has passed.',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: ['./src/routes/*.ts'],
};

module.exports = swaggerJSDoc(options);
