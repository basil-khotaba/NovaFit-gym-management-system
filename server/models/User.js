const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User model.
 *
 * Represents an account that can log in — either a "member" (a gym
 * customer) or the "admin". The password is automatically hashed
 * before saving, so a plain-text password is never stored.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true, // stores the email in lowercase, so casing never matters
      trim: true,
      // A regular expression: the value must look like an email address.
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      // "select: false" hides this field from query results by default.
      // Even if you accidentally send a user object to the client,
      // the (hashed) password will not be included.
      select: false,
    },

    // enum restricts the value to this exact list. Anything else is rejected.
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },

    // A reference to a Plan document. "ObjectId" + "ref: 'Plan'" means
    // this field stores the _id of a Plan, creating a relationship.
    // It is null until the member chooses a plan.
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      default: null,
    },

    // File path of the user's profile image, uploaded via Multer.
    profileImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook.
 *
 * This function runs automatically EVERY time a user document is
 * saved, just before it is written to the database. We use it to
 * hash the password so plain text is never stored.
 *
 * "this" refers to the user document being saved.
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it was changed (or is brand new).
  // Without this check, editing a user's name would re-hash the
  // already-hashed password and break their login.
  if (!this.isModified('password')) return next();

  // bcrypt.hash turns the plain password into a scrambled hash.
  // 12 is the "salt rounds" — higher = slower = harder to brute-force.
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/**
 * Instance method: comparePassword.
 *
 * Added to every user document. During login we call
 * user.comparePassword(typedPassword) — bcrypt re-hashes the typed
 * password and checks it against the stored hash. Returns true/false.
 *
 * You cannot "decrypt" a bcrypt hash; comparing is the only way.
 *
 * @param {string} candidatePassword - the plain-text password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
