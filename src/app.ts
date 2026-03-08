//app is the Express confguration
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import projectRoutes from './routes/project.routes';

const app = express();


//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);

app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Freelancer Mission Control API is running',
        timestamp: new Date().toISOString(),
    });
});

export default app;