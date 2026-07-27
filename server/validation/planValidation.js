const Joi = require('joi');

/**
 * JOI validation schemas for membership plan requests.
 */

// Max classes a member on this plan can book per month. null = unlimited.
const classLimitSchema = Joi.number().integer().min(1).allow(null).messages({
  'number.base': 'Class limit must be a number',
  'number.min': 'Class limit must be at least 1',
});

// Rules for POST /api/plans - name and price are required to create a plan.
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
  classLimit: classLimitSchema.optional(),
});

// Rules for PUT/PATCH /api/plans/:id - all fields optional, but at least one required.
const updatePlanSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  price: Joi.number().min(0),
  features: Joi.array().items(Joi.string()),
  featured: Joi.boolean(),
  classLimit: classLimitSchema,
})
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });

module.exports = { createPlanSchema, updatePlanSchema };