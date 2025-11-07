const { getAllEvents, purchaseTicket } = require('../models/clientModel');

describe('clientModel', () => {
  test('getAllEvents should return an array', async () => {
    const events = await getAllEvents();
    expect(Array.isArray(events)).toBe(true);
  });

  test('purchaseTicket should decrement ticket count or throw error if no tickets left', async () => {
    const events = await getAllEvents();
    if (events.length === 0) return;

    const event = events[0];
    const initialTickets = event.tickets;

    if (initialTickets > 0) {
      await purchaseTicket(event.id);
      const updatedEvents = await getAllEvents();
      const updatedEvent = updatedEvents.find(e => e.id === event.id);
      expect(updatedEvent.tickets).toBe(initialTickets - 1);
    } else {
      await expect(purchaseTicket(event.id)).rejects.toThrow('No tickets left');
    }
  });
});
