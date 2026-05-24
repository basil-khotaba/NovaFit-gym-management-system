const mongoose = require('mongoose');

/**
 * Class model.
 *
 * Represents a gym class/session, e.g. "Power Lifting" on Mon 7:00am.
 *
 * Design note: a class has members who book it, but we do NOT store
 * an enrolledUsers array here. Bookings live in their own Booking
 * collection. To find a class's members, query the Booking model.
 */
const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      maxlength: [100, 'Class name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    // enum keeps the category to the four tabs shown in the UI mockup.
    category: {
      type: String,
      enum: ['Strength', 'Cardio', 'Yoga', 'HIIT'],
      required: [true, 'Class category is required'],
    },

    durationMinutes: {
      type: Number,
      required: [true, 'Class duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },

    // Kept as simple text ("Mon 7:00am") to match the project scope.
    schedule: {
      type: String,
      required: [true, 'Class schedule is required'],
      trim: true,
    },

    // Maximum number of members who can book this class.
    capacity: {
      type: Number,
      required: [true, 'Class capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },

    // File path of the class image, uploaded via Multer.
    image: {
      type: String,
      default: '',
    },

    // REQUIRED reference: every class must belong to a trainer.
    // Stores the _id of a Trainer document.
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'A class must have a trainer'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Class', classSchema);
