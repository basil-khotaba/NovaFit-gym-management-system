const mongoose = require('mongoose');

/**
 * Membership model.
 *
 * Records the fact that a specific user subscribed to a specific
 * plan, and for what period. It is the link between a User and a Plan.
 *
 * Plan  = the catalogue ("Premium costs 199/month").
 * Membership = an actual subscription ("Dana took Premium on May 1st").
 */
const membershipSchema = new mongoose.Schema(
  {
    // Which user this membership belongs to.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A membership must belong to a user'],
    },

    // Which plan the user subscribed to.
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'A membership must reference a plan'],
    },

    // When the subscription started. Defaults to "right now".
    startDate: {
      type: Date,
      default: Date.now,
    },

    // When the subscription ends. Set when the membership is created.
    endDate: {
      type: Date,
      required: [true, 'A membership must have an end date'],
    },

    // Whether the membership is currently active. Lets the admin
    // deactivate a membership without deleting its record.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Membership', membershipSchema);
