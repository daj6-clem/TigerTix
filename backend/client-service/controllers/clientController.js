// controllers/clientController.js
import { getAllEvents, purchaseTicket } from '../models/clientModel.js';

// GET /api/events
//lists events
//input: none
//output: JSON array of events or error message
const listEvents = async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
};

// POST /api/events/:id/purchase
//facilitates ticket purchase
//input: event id in URL params
//output: success message or error message
const buyTicket = async (req, res) => {
  const { id } = req.params;
  try {
    await purchaseTicket(id);
    res.json({ message: 'Ticket purchased successfully!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { listEvents, buyTicket };
