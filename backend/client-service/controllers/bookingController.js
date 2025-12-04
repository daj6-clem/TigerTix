// controllers/bookingController.js
import db from '../../shared-db/db.js';

console.log("BookingController loaded!");

try {
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
  console.log("Tables in DB:", rows.map(r => r.name));
} catch (err) {
  console.error("Error reading tables:", err);
}

export default db;



let pendingBooking = null;

// Step 1: Prepare a booking
export const prepareBooking = (req, res) => {
  const { eventName, tickets } = req.body;

  if (!eventName || !tickets) {
    return res.status(400).json({ error: "Missing event name or ticket count." });
  }

  // Step 1: Lookup event by name
  const event = db.prepare("SELECT id, tickets FROM events WHERE name = ?").get(eventName);

  if (!event) {
    return res.status(404).json({ error: `Event not found: ${eventName}` });
  }

  const ticketCount = parseInt(tickets, 10);
  if (isNaN(ticketCount) || ticketCount <= 0) {
    return res.status(400).json({ error: "Invalid ticket count." });
  }

  if (event.tickets < ticketCount) {
    return res.status(400).json({
      error: `Not enough tickets available. Only ${event.tickets} ticket(s) remaining.`,
    });
  }

  pendingBooking = {
    id: event.id,
    name: eventName,
    tickets: ticketCount,
  };

  return res.json({
    message: `Preparing to book ${ticketCount} ticket(s) for ${eventName}. Please confirm to proceed.`,
    pendingBooking,
  });
};



// Step 2: Confirm a booking
export const confirmBooking = (req, res) => {
  try {
    console.log("Hit /confirm-booking route", req.body);

    const { eventId, eventName, tickets } = req.body;

    if (!pendingBooking || pendingBooking.id !== eventId) {
      return res.status(400).json({ error: "No pending booking found or mismatch." });
    }

    const ticketCount = parseInt(tickets, 10);
    if (isNaN(ticketCount) || ticketCount <= 0) {
      return res.status(400).json({ error: "Invalid ticket count." });
    }

    // Step 1: Check available tickets
    const row = db.prepare("SELECT tickets FROM events WHERE id = ?").get(eventId);
    if (!row) return res.status(404).json({ error: "Event not found." });
    if (row.tickets < ticketCount) {
      return res.status(400).json({
        error: `Not enough tickets available. Only ${row.tickets} ticket(s) remaining.`,
      });
    }

    // Step 2: Insert booking
    db.prepare("INSERT INTO bookings (event_name, ticket_count) VALUES (?, ?)")
      .run(eventName, ticketCount);

    // Step 3: Decrement tickets
    db.prepare("UPDATE events SET tickets = tickets - ? WHERE id = ?")
      .run(ticketCount, eventId);

    console.log(`Booking confirmed for ${eventName}, tickets remaining updated.`);
    pendingBooking = null;

    return res.json({
      message: `Booking confirmed for ${eventName} (${ticketCount} tickets).`,
    });

  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ error: err.message });
  }
};


// Helper function for testing- will set bookings to null.
export const setPendingBooking = (booking) => {
  pendingBooking = booking;
};
