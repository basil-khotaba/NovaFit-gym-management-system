const Joi = require('joi');

/**
 * JOI validation schemas for trainer requests.
 */

// Rules for POST /api/trainers - only name is required to create a trainer.
const createTrainerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Trainer name is required',
    'string.min': 'Trainer name must be at least 2 characters',
  }),
  bio: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Bio cannot exceed 500 characters',
  }),
  specialties: Joi.array().items(Joi.string()).optional(),
  rating: Joi.number().min(0).max(5).optional().messages({
    'number.min': 'Rating cannot be below 0',
    'number.max': 'Rating cannot be above 5',
  }),
  photo: Joi.string().allow('').optional(),
});

// Rules for PUT/PATCH /api/trainers/:id - all fields optional, but at least one required.
const updateTrainerSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  bio: Joi.string().max(500).allow(''),
  specialties: Joi.array().items(Joi.string()),
  rating: Joi.number().min(0).max(5),
  photo: Joi.string().allow(''),
})
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });

module.exports = { createTrainerSchema, updateTrainerSchema };