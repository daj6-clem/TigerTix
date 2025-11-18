const express = require('express');
const router = express.Router();

const clientController = require('../controllers/clientController');
const bookingController = require('../controllers/bookingController');
const {verifyToken} = require('../middleware/authMiddleware');

// Client routes
router.get('/events', clientController.listEvents);
router.post('/events/:id/purchase', verifyToken, clientController.buyTicket);

// Booking routes
router.post('/prepare-booking', verifyToken, bookingController.prepareBooking);
router.post('/confirm-booking', verifyToken, bookingController.confirmBooking);

module.exports = router;
