// client-service/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import clientRoutes from './routes/clientRoutes.js';
import llmRoutes from './routes/llmRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors( {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api', clientRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 6001;
app.listen(PORT, '0.0.0.0', () => console.log(`Client service running at http://0.0.0.0:${PORT}`));
