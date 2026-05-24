const jwt = require('jsonwebtoken');

/**
 * Creates a signed JWT (JSON Web Token) for a user.
 *
 * The token's payload contains the user's id and role. It is signed
 * with JWT_SECRET so the server can later verify the token was
 * genuinely issued by us and was not tampered with.
 *
 * @param {object} user - a user document (must have _id and role)
 * @returns {string} the signed JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    // Payload — the data stored inside the token.
    { userId: user._id, role: user.role },
    // Secret key — kept in .env, never in code.
    process.env.JWT_SECRET,
    // Options — how long the token stays valid.
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
