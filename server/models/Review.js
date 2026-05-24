const mongoose = require('mongoose');

/**
 * Review model.
 *
 * Records a member's rating and comment about a trainer. Links a
 * User (the reviewer) to a Trainer (the one being reviewed).
 */
const reviewSchema = new mongoose.Schema(
  {
    // The member who wrote the review.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },

    // The trainer being reviewed.
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'A review must reference a trainer'],
    },

    // A star rating from 1 to 5.
    rating: {
      type: Number,
      required: [true, 'A rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },

    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound unique index.
 *
 * The combination of (user + trainer) must be unique — a member can
 * review a given trainer only once. They can edit that review, but
 * not create a second one for the same trainer.
 */
reviewSchema.index({ user: 1, trainer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
