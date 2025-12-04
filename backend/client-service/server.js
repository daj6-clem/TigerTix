// server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import llmRoutes from './routes/llmRoutes.js';

const app = express();

// Allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL, // main frontend
  /\.vercel\.app$/           // any Vercel preview
];

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS only for API routes
app.use('/api', cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server/Postman
    if (allowedOrigins.some(o => (o instanceof RegExp ? o.test(origin) : o === origin))) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true
}));

// Optional: preflight for auth routes
app.options('/api/auth/login', cors({ origin: allowedOrigins, credentials: true }));
app.options('/api/auth/register', cors({ origin: allowedOrigins, credentials: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', clientRoutes);
app.use('/api/llm', llmRoutes);

// Error handler
app.use((err, req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Backend running at http://0.0.0.0:${PORT}`)
);
