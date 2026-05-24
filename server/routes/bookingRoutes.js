const express = require('express');
const router = express.Router();

const {
  getMyBookings,
  getAllBookings,
  createBooking,
  cancelBooking,
} = require('../controllers/bookingController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createBookingSchema } = require('../validation/bookingValidation');

/**
 * Booking routes — mounted at /api/bookings in app.js.
 *
 * Every route requires the user to be logged in (protect).
 * Members book/cancel/view their own bookings. Only the admin
 * overview adds restrictTo('admin').
 *
 * Note: '/my' must be declared BEFORE any '/:id' route, otherwise
 * Express would treat the word "my" as an :id value.
 */

// The logged-in member's own bookings.
router.get('/my', protect, getMyBookings);

// Admin overview of every booking.
router.get('/', protect, restrictTo('admin'), getAllBookings);

// Book a class.
router.post('/', protect, validate(createBookingSchema), createBooking);

// Cancel one of your own bookings.
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;