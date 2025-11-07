const { insertEvent } = require('../models/adminModel');

/* Creating an event
Putting name, date, and tickets in the body of a POST creats an event
If name or date are missing, then you get an error
Default ticket amount is 100
Throws an error if it fails
*/
async function createEvent(req, res) {
  try {
    const { name, date, tickets } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }

    const event = await insertEvent(name, date, tickets || 100);
    res.status(201).json({
      message: 'Event created successfully!',
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

module.exports = { createEvent };
