// models/clientModel.js
import db from '../../shared-db/database.sqlite';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("DB path (from db.js):", path.resolve(__dirname, '../../shared-db/database.sqlite'));
console.log("DB exists?", fs.existsSync(path.resolve(__dirname, '../../shared-db/database.sqlite')));

export default db;


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

export { getAllEvents, purchaseTicket };
