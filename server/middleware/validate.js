/**
 * validate — a reusable validation middleware factory.
 *
 * You give it a JOI schema, and it returns a middleware function
 * that checks req.body against that schema. This lets every route
 * validate its input without repeating code.
 *
 * Usage in a route file:
 *   router.post('/register', validate(registerSchema), register);
 *
 * @param {import('joi').ObjectSchema} schema - the JOI schema to check against
 * @returns {Function} an Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // collect ALL errors, not just the first one
      stripUnknown: true, // drop any fields not defined in the schema
    });

    if (error) {
      // Turn JOI's error details into a simple list of messages.
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace the body with the cleaned, validated value.
    req.body = value;
    next();
  };
};

module.exports = validate;
