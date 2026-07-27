const Joi = require('joi');

/**
 * JOI validation schemas for class requests.
 */

// MongoDB ObjectId used to reference the trainer assigned to a class.
const objectId = Joi.string().hex().length(24).messages({
  'string.hex': 'Trainer id must be a valid id',
  'string.length': 'Trainer id must be a valid id',
});

// Rules for POST /api/classes - all fields required to create a new class.
const createClassSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Class name is required',
    'string.min': 'Class name must be at least 2 characters',
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  category: Joi.string()
    .valid('Strength', 'Cardio', 'Yoga', 'HIIT')
    .required()
    .messages({
      'any.only': 'Category must be one of: Strength, Cardio, Yoga, HIIT',
      'string.empty': 'Category is required',
    }),
  durationMinutes: Joi.number().integer().min(1).required().messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 1 minute',
  }),
  schedule: Joi.string().required().messages({
    'string.empty': 'Schedule is required',
  }),
  capacity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Capacity must be a number',
    'number.min': 'Capacity must be at least 1',
  }),
  trainer: objectId.required().messages({
    'any.required': 'A class must have a trainer',
  }),
});

// Rules for PUT/PATCH /api/classes/:id - all fields optional, but at least one required.
const updateClassSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500).allow(''),
  category: Joi.string().valid('Strength', 'Cardio', 'Yoga', 'HIIT'),
  durationMinutes: Joi.number().integer().min(1),
  schedule: Joi.string(),
  capacity: Joi.number().integer().min(1),
  trainer: objectId,
  image: Joi.string().allow(''),
})
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });

module.exports = { createClassSchema, updateClassSchema };