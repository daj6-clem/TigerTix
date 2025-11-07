// tests/bookingController.test.js
const httpMocks = require('node-mocks-http');

// Mock sqlite3 to avoid real DB operations
jest.mock('sqlite3', () => {
  const mDb = {
    serialize: jest.fn((fn) => fn()),
    run: jest.fn((...args) => {
      const cb = args[args.length - 1];
      if (typeof cb === 'function') setImmediate(() => cb(null));
    }),
    prepare: jest.fn(() => ({
      run: jest.fn((...args) => {
        const cb = args[args.length - 1];
        if (typeof cb === 'function') setImmediate(() => cb(null));
      }),
      finalize: jest.fn(),
    })),
  };
  return { verbose: jest.fn(() => ({ Database: jest.fn(() => mDb) })) };
});

describe('bookingController', () => {
  let bookingController;

  beforeEach(() => {
    jest.resetModules();
    bookingController = require('../controllers/bookingController');
    // Reset pendingBooking before each test
    if (bookingController.__setPendingBooking) {
      bookingController.__setPendingBooking(null);
    }
  });

  test('prepareBooking sets pendingBooking and returns JSON', () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { event: 'Jazz Night', tickets: 2 },
    });
    const res = httpMocks.createResponse();

    bookingController.prepareBooking(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('pendingBooking');
    expect(data.pendingBooking).toEqual({ event: 'Jazz Night', tickets: 2 });
  });

  test('prepareBooking returns 400 if fields are missing', () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { tickets: 2 }, // missing event
    });
    const res = httpMocks.createResponse();

    bookingController.prepareBooking(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(400);
    expect(data).toHaveProperty('error');
  });

  test('confirmBooking works if pendingBooking matches request', async () => {
    // Set pendingBooking via helper
    bookingController.__setPendingBooking({ event: 'Jazz Night', tickets: 2 });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { event: 'Jazz Night', tickets: 2 },
    });
    const res = httpMocks.createResponse();

    await new Promise((resolve) => {
      res.json = (data) => {
        res._json = data;
        resolve();
      };
      bookingController.confirmBooking(req, res);
    });

    const data = res._json;
    expect(data).toHaveProperty('message');
    expect(data.message).toMatch(/Booking confirmed for Jazz Night/);
  });

  test('confirmBooking returns 400 if no pendingBooking', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { event: 'Jazz Night', tickets: 2 },
    });
    const res = httpMocks.createResponse();

    await new Promise((resolve) => {
      res.json = (data) => {
        res._json = data;
        resolve();
      };
      bookingController.confirmBooking(req, res);
    });

    const data = res._json;
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/No pending booking/);
  });
});
