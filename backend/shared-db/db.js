//db.js
const Database = require('better-sqlite3');
const path = require('path');

// Point to SQLlite file
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Optional: turn on foreign keys for safety
db.exec('PRAGMA foreign_keys = ON;');

module.exports = db;