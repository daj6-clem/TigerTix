const { listEvents, buyTicket } = require('../controllers/clientController');
const httpMocks = require('node-mocks-http');
const { getAllEvents } = require('../models/clientModel');

describe('clientController', () => {
  test('listEvents returns JSON array', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await listEvents(req, res);
    const data = res._getJSONData();
    expect(Array.isArray(data)).toBe(true);
  });

  test('buyTicket returns success or error JSON', async () => {
    const events = await getAllEvents();
    if (events.length === 0) return;

    const event = events[0];
    const req = httpMocks.createRequest({ params: { id: event.id } });
    const res = httpMocks.createResponse();

    await buyTicket(req, res);
    const data = res._getJSONData();
    expect(data).toHaveProperty('message');
  });
});
