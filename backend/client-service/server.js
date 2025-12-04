import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import clientRoutes from './routes/clientRoutes.js';
import llmRoutes from './routes/llmRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Allowed origins (dynamic)
const allowedOrigins = [
  process.env.FRONTEND_URL, // main frontend
  /\.vercel\.app$/           // any Vercel preview
];

// Apply CORS globally
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-side / Postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (allowedOrigins.some(o => o instanceof RegExp && o.test(origin))) return callback(null, true);

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', clientRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/auth', authRoutes);

app.get('/*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, '0.0.0.0', () => console.log(`Client service running at http://0.0.0.0:${PORT}`));
