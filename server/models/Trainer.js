const mongoose = require('mongoose');

/**
 * Trainer model.
 *
 * Represents a gym trainer. Trainers are *data* managed by the admin —
 * they are NOT user accounts and do not log in.
 *
 * Design note: a trainer "has" classes, but we do NOT store a
 * classes array here. Instead, the Class model stores which trainer
 * it belongs to, and we read a trainer's classes back using a
 * "virtual" (see below). This keeps the relationship in ONE place
 * so the two sides can never fall out of sync.
 */
const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true,
    },

    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },

    // A trainer can have several specialties, e.g. ["Strength", "HIIT"].
    specialties: {
      type: [String],
      default: [],
    },

    // File path of the trainer's photo, uploaded later via Multer.
    photo: {
      type: String,
      default: '',
    },

    rating: {
      type: Number,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot be above 5'],
      default: 0,
    },
  },
  {
    timestamps: true,
    // These two options make virtual fields show up when a document
    // is converted to JSON (sent in an API response) or a plain object.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field: "classes".
 *
 * A virtual is a field that is NOT stored in the database — it is
 * computed on demand. This one lets you do trainer.populate('classes')
 * to fetch every Class whose "trainer" field points to this trainer.
 *
 *   localField:  the field on THIS model (the trainer's own _id)
 *   foreignField: the field on the Class model that points back here
 */
trainerSchema.virtual('classes', {
  ref: 'Class',
  localField: '_id',
  foreignField: 'trainer',
});

module.exports = mongoose.model('Trainer', trainerSchema);
