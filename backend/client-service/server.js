import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import clientRoutes from './routes/clientRoutes.js';
import llmRoutes from './routes/llmRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Allowed origins (main frontend + Vercel previews)
const allowedOrigins = [
    process.env.FRONTEND_URL, // main frontend
    /\.vercel\.app$/           // any Vercel preview
];

// Global CORS middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow Postman/server
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (allowedOrigins.some(o => o instanceof RegExp && o.test(origin))) return callback(null, true);

        return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true, // important for cookies
}));

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(process.cwd(), 'client')));
app.use('/api', clientRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/auth', authRoutes);

app.get('/*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
});

app.use((err, req, res, next) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, '0.0.0.0', () =>
    console.log(`Client service running at http://0.0.0.0:${PORT}`)
);
