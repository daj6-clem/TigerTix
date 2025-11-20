

import path from 'path';
import fs from 'fs';
import os from 'os';
import sqlite3 from 'sqlite3';

// Create a temporary database file for testing
const tempDbPath = path.join(os.tmpdir(), `tigertix_test_${Date.now()}.sqlite`);
process.env.DB_PATH = tempDbPath;
console.log('Temp DB path:', tempDbPath);

// Initialize schema from init.sql
const schema = `
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  tickets INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  ticket_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
`;

let model;
beforeAll((done) => {
  const db = new sqlite3.Database(tempDbPath, (err) => {
    if (err) {
      console.error('Failed to create temp DB:', err);
      done(err);
      return;
    }
    db.exec(schema, (err2) => {
      db.close();
      if (err2) {
        console.error('Failed to initialize schema:', err2);
        done(err2);
        return;
      }
      // Confirm file exists
      console.log('Temp DB exists after init:', fs.existsSync(tempDbPath));
      // Import model after DB is ready
      import('../models/User.js').then((m) => {
        model = m;
        // Also import the shared DB connection for cleanup
        return import('../../shared-db/db.js');
      }).then((dbModule) => {
        global._testDb = dbModule.default;
        done();
      }).catch(done);
    });
  });
});

afterAll((done) => {
  // Close the shared DB connection if open, then delete the temp file
  if (global._testDb && typeof global._testDb.close === 'function') {
    global._testDb.close((err) => {
      if (err) console.error('Error closing test DB:', err);
      if (fs.existsSync(tempDbPath)) {
        try { fs.unlinkSync(tempDbPath); } catch (e) { console.error('Error deleting temp DB:', e); }
      }
      done();
    });
  } else {
    if (fs.existsSync(tempDbPath)) {
      try { fs.unlinkSync(tempDbPath); } catch (e) { console.error('Error deleting temp DB:', e); }
    }
    done();
  }
});

describe('User Model', () => {
  it('should create a user and retrieve it by username', async () => {
    const username = 'testuser_' + Date.now();
    const passHash = 'hashedpassword';
    let user;
    try {
      user = await model.createUser(username, passHash);
      expect(user).toHaveProperty('id');
    } catch (err) {
      console.error('Error from createUser:', err);
      throw err;
    }
    let found;
    try {
      found = await model.getUserByName(username);
      expect(found).toBeDefined();
      expect(found.username).toBe(username);
      expect(found.password_hash).toBe(passHash);
    } catch (err) {
      console.error('Error from getUserByName:', err);
      throw err;
    }
  });
});
    let found;
