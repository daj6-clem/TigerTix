console.log("BookingController loaded!");

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Shared database path (same as in clientModel.js)
const dbPath = path.resolve(__dirname, "../../shared-db/database.sqlite");
console.log("Database path being used:", dbPath);

//const db = new sqlite3.Database(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB open error:", err);
  else {
    console.log("Connected to DB at:", dbPath);
    db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, rows) => {
      if (err) console.error("Error reading tables:", err);
      else console.log("Tables in DB:", rows.map(r => r.name));
    });
  }
});

let pendingBooking = null;

// Step 1: Prepare a booking
exports.prepareBooking = (req, res) => {
  const { eventId, tickets, eventName } = req.body;

  // Validate input
  if (!eventId || !tickets || !eventName) {
    return res.status(400).json({ error: "Missing event ID, name, or ticket count." });
  }

  // Store the pending booking (temporary; for single-user flow)
  pendingBooking = { id: eventId, name: eventName, tickets };

  // Respond to the client
  return res.json({
    message: `Preparing to book ${tickets} ticket(s) for ${eventName}. Please confirm to proceed.`,
    pendingBooking,
  });
};


// Step 2: Confirm a booking
exports.confirmBooking = (req, res) => {
  console.log("Hit /confirm-booking route", req.body);

  const { eventId, eventName, tickets } = req.body;

  if (!pendingBooking || pendingBooking.id !== eventId) {
    return res.status(400).json({ error: "No pending booking found or mismatch." });
  }

  const ticketCount = parseInt(tickets, 10);
  if (isNaN(ticketCount) || ticketCount <= 0) {
    return res.status(400).json({ error: "Invalid ticket count." });
  }

  db.serialize(() => {
    // Step 1: Check available tickets
    db.get("SELECT tickets FROM events WHERE id = ?", [eventId], (err, row) => {
      if (err) {
        console.error("DB error checking tickets:", err);
        return res.status(500).json({ error: "Database error." });
      }

      if (!row) {
        return res.status(404).json({ error: "Event not found." });
      }

      if (row.tickets < ticketCount) {
        return res.status(400).json({
          error: `Not enough tickets available. Only ${row.tickets} ticket(s) remaining.`,
        });
      }

      // Step 2: Insert booking
      const stmt = db.prepare(
        "INSERT INTO bookings (event_name, ticket_count) VALUES (?, ?)"
      );
      stmt.run(eventName, ticketCount, function(err) {
        if (err) {
          console.error("Insert error:", err);
          return res.status(500).json({ error: "Booking insert failed.", details: err.message });
        }

        // Step 3: Decrement tickets in events table
        db.run(
          "UPDATE events SET tickets = tickets - ? WHERE id = ?",
          [ticketCount, eventId],
          function(err) {
            if (err) {
              console.error("Error decrementing tickets:", err);
              return res.status(500).json({ error: "Failed to update ticket count." });
            }

            console.log(`Booking confirmed for ${eventName}, tickets remaining updated.`);
            pendingBooking = null;

            return res.json({
              message: `Booking confirmed for ${eventName} (${ticketCount} tickets).`,
            });
          }
        );
      });
      stmt.finalize();
    });
  });
};

// Helper function for testing- will set bookings to null.
exports.setPendingBooking = (booking) => {
  pendingBooking = booking;
};
