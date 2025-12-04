//db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point to SQLlite file
const dbPath = path.join(__dirname, 'database.sqlite');
console.log("DB path being used:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Failed to connect to DB:', err);
    else console.log('Connected to SQLite DB at:', dbPath);
});

// Optional: turn on foreign keys for safety
db.exec('PRAGMA foreign_keys = ON;');

export default db;