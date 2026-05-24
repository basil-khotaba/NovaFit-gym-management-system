const mongoose = require('mongoose');

/**
 * Plan model.
 *
 * Represents the *types* of membership a gym offers — for example
 * Basic, Premium, and VIP. This is the catalogue. It does NOT record
 * which user bought which plan; that is the Membership model's job.
 */
const planSchema = new mongoose.Schema(
  {
    // The plan's name. "unique: true" means no two plans can share
    // a name — you can't have two "Premium" plans.
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true, // removes accidental spaces at the start/end
    },

    // Monthly price. "min: 0" rejects negative prices.
    price: {
      type: Number,
      required: [true, 'Plan price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // The list of feature lines shown on the plan card in the UI.
    // [String] means "an array of strings".
    features: {
      type: [String],
      default: [],
    },

    // Marks the "Most popular" plan that gets highlighted in the UI.
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically adds two date fields to every document:
    // createdAt (when it was made) and updatedAt (when last changed).
    timestamps: true,
  }
);

// Turn the schema (the blueprint) into a Model (the usable object).
// Mongoose will create a collection called "plans" in MongoDB.
module.exports = mongoose.model('Plan', planSchema);
