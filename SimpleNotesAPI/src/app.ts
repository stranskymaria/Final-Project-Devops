
import express from 'express';
import cors from 'cors';
import notesRouter from './routes/notes';
import healthRouter from './routes/health';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swaggerDef';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', notesRouter);
app.use('/api', healthRouter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Notes API is running...');
});


export default app;
