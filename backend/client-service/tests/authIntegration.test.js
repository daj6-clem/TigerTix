import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';
import * as User from '../models/User.js';
import jwt from 'jsonwebtoken';

jest.mock('../models/User.js');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

describe('Auth Integration', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/auth/me', () => {
    it('should return current user if token is valid', async () => {
      const token = jwt.sign({ id: 1, username: 'user' }, JWT_SECRET, { expiresIn: '30m' });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`]);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('username', 'user');
    });
    it('should return 401 if no token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['token=invalidtoken']);
      expect(res.statusCode).toBe(401);
    });
  });
});
