require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * One-time script: create or promote the admin account used to
 * manage this deployment. Run it once (e.g. via a temporary Render
 * start command), then remove the temporary start command again.
 */
const EMAIL = 'khotababasil@gmail.com';
const PASSWORD = 'REDACTED-rotated-password';
const NAME = 'Basil Khotaba';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne({ email: EMAIL });
  if (user) {
    user.role = 'admin';
    await user.save();
    console.log(`Promoted existing user to admin: ${EMAIL}`);
  } else {
    user = await User.create({
      name: NAME,
      email: EMAIL,
      password: PASSWORD,
      role: 'admin',
    });
    console.log(`Created new admin user: ${EMAIL}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
