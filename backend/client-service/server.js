import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import clientRoutes from './routes/clientRoutes.js';
import llmRoutes from './routes/llmRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Allow your production frontend + Vercel previews dynamically
const allowedOrigins = [
  process.env.FRONTEND_URL, // your main frontend
  /\.vercel\.app$/           // regex to allow any Vercel preview deploy
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    // exact match
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // regex match
    if (allowedOrigins.some(o => o instanceof RegExp && o.test(origin))) return callback(null, true);

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
}));

// Handle preflight requests
app.options('*', cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', clientRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 6001;
app.listen(PORT, '0.0.0.0', () => console.log(`Client service running at http://0.0.0.0:${PORT}`));
