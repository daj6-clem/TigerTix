import express from 'express';
import {listEvents, buyTicket} from '../controllers/clientController.js';
import {prepareBooking, confirmBooking} from '../controllers/bookingController.js';
import {verifyToken} from '../middleware/authMiddleware.js';

const router = express.Router();

// Client routes
router.get('/events', listEvents);
router.post('/events/:id/purchase', verifyToken, buyTicket);

// Booking routes
router.post('/prepare-booking', verifyToken, prepareBooking);
router.post('/confirm-booking', verifyToken, confirmBooking);

export default router;