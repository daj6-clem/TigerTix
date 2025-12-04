// models/clientModel.js
import db from '../../shared-db/db.js'


//gets all events
//input: none
//output: promise that resolves to array of events
const getAllEvents = () => {
  return db.prepare('SELECT * FROM events').all();
};

// Purchase a ticket (decrement available tickets)
//input: ticket id
//output: promise that resolves if successful, rejects if no tickets left
const purchaseTicket = (id) => {
  const stmt = db.prepare(`
    UPDATE events
    SET tickets = tickets - 1
    WHERE id = ? AND tickets > 0
  `);

  const info = stmt.run(id);

  if (info.changes === 0) {
    throw new Error('No tickets left or event not found');
  }

  return info;
};

export { getAllEvents, purchaseTicket };
