// tests/bookingController.test.js
const path = require('path');
process.env.TEST_DB = path.resolve(__dirname, '../../shared-db/database_test.sqlite')

const httpMocks = require('node-mocks-http');
const {prepareBooking, confirmBooking, setPendingBooking} = require('../controllers/bookingController');

test('check database tables', async () => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(process.env.TEST_DB);

  const rows = await new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  console.log("Tables in DB:", rows.map(r => r.name));

  await new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

test('prepareBooking returns 400 if fields are missing', () => {
  setPendingBooking(null);


  const request = httpMocks.createRequest({
    method: 'POST',
    body: { tickets: 2 },
  });

  const response = httpMocks.createResponse();

  prepareBooking(request, response);

  const data = response._getJSONData();
  expect(response.statusCode).toBe(400);
  expect(data).toHaveProperty('error');
});

test('confirmBooking returns 400 if no pendingBooking', async () => {
  setPendingBooking(null);
  
  const request = httpMocks.createRequest({
    method: 'POST',
    body: { event: 'Jazz Night', tickets: 2 },
  });
  const response = httpMocks.createResponse();

  await confirmBooking(request, response);

  const data = response._getJSONData();
  expect(data).toHaveProperty('error');
  expect(data.error).toMatch(/No pending booking/);
});

test('prepareBooking sets pendingBooking and returns JSON', () => {
  setPendingBooking(null);

  const request = httpMocks.createRequest({
    method: 'POST',
    body: { eventId: 1, tickets: 2, eventName: 'Jazz Night'},
  });
  const response = httpMocks.createResponse();

  prepareBooking(request, response);

  const data = response._getJSONData();
  expect(response.statusCode).toBe(200);
  expect(data).toHaveProperty('pendingBooking');
  expect(data.pendingBooking).toEqual({ id: 1, name: 'Jazz Night', tickets: 2});
});

test('confirmBooking works if pendingBooking matches request', async () => {
  setPendingBooking({ id: 1, tickets: 2, eventName: 'Jazz Night' });

  const request = httpMocks.createRequest({
    method: 'POST',
    body: { eventId: 1, tickets: 2, eventName: 'Jazz Night' },
  });
  const response = httpMocks.createResponse();

  return new Promise((resolve) => {
    response.json = (data) => {
      response._json = data;
      resolve();
    };

    confirmBooking(request, response);
  }).then(() => {
    
  const data = response._json;
  expect(data).toHaveProperty('message');
  expect(data.message).toMatch(/Booking confirmed for Jazz Night/);

  });
});
