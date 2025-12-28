const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET /api/bookings-memory - Get all bookings
router.get('/', bookingController.getAllBookings.bind(bookingController));

// GET /api/bookings-memory/:id - Get booking by ID
router.get('/:id', bookingController.getBookingById.bind(bookingController));

// GET /api/bookings-memory/traveler/:travelerId - Get bookings for a traveler
router.get('/traveler/:travelerId', bookingController.getTravelerBookings.bind(bookingController));

// PATCH /api/bookings-memory/:id/status - Update booking status
router.patch('/:id/status', bookingController.updateBookingStatus.bind(bookingController));

module.exports = router;
