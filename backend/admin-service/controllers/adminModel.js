const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database with schema
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    tickets INTEGER DEFAULT 100
  )`);
});

// Insert a new event
//input: name (string), date (string), tickets (integer, default 100)
//output: promise that resolves to the inserted event object
function insertEvent(name, date, tickets = 100) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO events (name, date, tickets) VALUES (?, ?, ?)`,
      [name, date, tickets],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, date, tickets });
      }
    );
  });
}

module.exports = { insertEvent };

