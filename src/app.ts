//app is the Express confguration
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import projectRoutes from './routes/project.routes';
import phaseRoutes from './routes/phase.routes';
import documentRoutes from './routes/document.routes';
import errorHandler from './middleware/errorHandler';

const app = express();


//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/phases', phaseRoutes);
app.use('/api/projects/:projectId/documents', documentRoutes);

app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Freelancer Mission Control API is running',
        timestamp: new Date().toISOString(),
    });
});

app.use(errorHandler);

export default app;