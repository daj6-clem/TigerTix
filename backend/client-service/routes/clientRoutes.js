const express = require('express');
const router = express.Router();

const clientController = require('../controllers/clientController');
const bookingController = require('../controllers/bookingController');

// Client routes
router.get('/events', clientController.listEvents);
router.post('/events/:id/purchase', clientController.buyTicket);

// Booking routes
router.post('/prepare-booking', bookingController.prepareBooking);
router.post('/confirm-booking', bookingController.confirmBooking);

module.exports = router;
