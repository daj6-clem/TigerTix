import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import * as User from '../models/User.js';
import jwt from 'jsonwebtoken';

jest.mock('../models/User.js');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Controller', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      User.getUserByName.mockResolvedValue(null);
      User.createUser.mockResolvedValue({ id: 1 });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', password: 'pass' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered');
    });
    it('should not register if user exists', async () => {
      User.getUserByName.mockResolvedValue({ id: 2 });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'existing', password: 'pass' });
      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const hash = await import('bcryptjs').then(b => b.hash('pass', 10));
      User.getUserByName.mockResolvedValue({ id: 1, username: 'user', password_hash: hash });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'user', password: 'pass' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Logged in successfully.');
    });
    it('should not login with wrong password', async () => {
      const hash = await import('bcryptjs').then(b => b.hash('pass', 10));
      User.getUserByName.mockResolvedValue({ id: 1, username: 'user', password_hash: hash });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'user', password: 'wrong' });
      expect(res.statusCode).toBe(400);
    });
    it('should not login if user not found', async () => {
      User.getUserByName.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nouser', password: 'pass' });
      expect(res.statusCode).toBe(400);
    });
  });
});
