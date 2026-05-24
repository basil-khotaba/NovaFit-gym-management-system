const mongoose = require('mongoose');

/**
 * Booking model.
 *
 * Records that a member booked a place in a class. This collection
 * is the link between Users and Classes.
 *
 * Because bookings live here (and not as an array on the Class), each
 * booking can carry its own status and timestamp.
 */
const bookingSchema = new mongoose.Schema(
  {
    // The member who made the booking.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A booking must belong to a user'],
    },

    // The class that was booked.
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'A booking must reference a class'],
    },

    // The booking's current state.
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },

    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound unique index.
 *
 * This tells MongoDB that the COMBINATION of (user + class) must be
 * unique — the same user cannot have two booking documents for the
 * same class. It blocks double-booking at the database level, even
 * if a bug in the controller ever tried to allow it.
 */
bookingSchema.index({ user: 1, class: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
