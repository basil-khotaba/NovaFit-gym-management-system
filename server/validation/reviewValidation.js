const Joi = require('joi');

const objectId = Joi.string().hex().length(24).messages({
  'string.hex': 'Trainer id must be a valid id',
  'string.length': 'Trainer id must be a valid id',
});

const createReviewSchema = Joi.object({
  trainer: objectId.required().messages({
    'any.required': 'A trainer id is required',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot be more than 5',
    'any.required': 'A rating is required',
  }),
  comment: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Comment cannot exceed 500 characters',
  }),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().max(500).allow(''),
})
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });

module.exports = { createReviewSchema, updateReviewSchema };