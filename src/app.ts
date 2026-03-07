//app is the Express confguration
import express from 'express';
import cors from 'cors';

const app = express();


//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Freelancer Mission Control API is running',
        timestamp: new Date().toISOString(),
    });
});

export default app;