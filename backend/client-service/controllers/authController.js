// controllers/authController.js
import db from '../../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export const register = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashed);

  res.json({ message: 'User registered successfully' });
};

export const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged in successfully', user: { id: user.id, username: user.username } });
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = (req, res) => {
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};
