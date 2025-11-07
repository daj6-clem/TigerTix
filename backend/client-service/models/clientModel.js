// models/clientModel.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Shared database path
const dbPath = path.resolve(__dirname, '../../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath);

//gets all events
//input: none
//output: promise that resolves to array of events
const getAllEvents = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Purchase a ticket (decrement available tickets)
//input: ticket id
//output: promise that resolves if successful, rejects if no tickets left
const purchaseTicket = (id) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE events
       SET tickets = tickets - 1
       WHERE id = ? AND tickets > 0`,
      [id],
      function (err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('No tickets left or event not found'));
        else resolve();
      }
    );
  });
};

module.exports = { getAllEvents, purchaseTicket };
