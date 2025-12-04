// controllers/authController.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const users = []; // simple in-memory store for demo

export const register = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing fields" });
  if (users.find(u => u.username === username)) return res.status(400).json({ message: "User exists" });

  users.push({ username, password });
  res.status(201).json({ message: "User registered" });
};

export const login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,           // true in production
    sameSite: 'none',       // allow cross-origin cookies
    maxAge: 3600000
  });

  res.json({ message: "Logged in", username });
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ message: "Logged out" });
};

export const getCurrentUser = (req, res) => {
  res.json({ username: req.user.username });
};
