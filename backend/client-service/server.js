// client-service/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import clientRoutes from './routes/clientRoutes.js';
import llmRoutes from './routes/llmRoutes.js';
import authRoutes from './routes/authRoutes.js';

import fs from 'fs';
import path from 'path';

const app = express();

const dbPath = path.resolve(__dirname, "../shared-db/database.sqlite");

app.use(cors( {
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api', clientRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => console.log(`Client service running at http://localhost:${PORT}`));

app.get("/debug-db", (req, res) => {
    const exists = fs.existsSync(dbPath);
    res.json({
        dbPath,
        exists,
        files: exists ? fs.readdirSync(path.dirname(dbPath)) : []
    });
});
