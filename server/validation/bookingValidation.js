const Joi = require('joi');

/**
 * JOI validation for booking requests.
 *
 * To book a class, the request body needs just the class id.
 * The user is taken from the JWT (req.user) — never from the body —
 * so a member cannot book on someone else's behalf.
 */

const objectId = Joi.string().hex().length(24).messages({
  'string.hex': 'Class id must be a valid id',
  'string.length': 'Class id must be a valid id',
});

const createBookingSchema = Joi.object({
  class: objectId.required().messages({
    'any.required': 'A class id is required to book',
  }),
});

module.exports = { createBookingSchema };