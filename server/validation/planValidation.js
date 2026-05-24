const Joi = require('joi');

const createPlanSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Plan name is required',
    'string.min': 'Plan name must be at least 2 characters',
  }),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price cannot be negative',
  }),
  features: Joi.array().items(Joi.string()).optional(),
  featured: Joi.boolean().optional(),
});

const updatePlanSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  price: Joi.number().min(0),
  features: Joi.array().items(Joi.string()),
  featured: Joi.boolean(),
})
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });

module.exports = { createPlanSchema, updatePlanSchema };