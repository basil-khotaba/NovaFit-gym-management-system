require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * One-time script: create or promote the admin account used to
 * manage this deployment. Run it once (e.g. via a temporary Render
 * start command), then remove the temporary start command again.
 *
 * Reads credentials from env vars so nothing sensitive is committed —
 * set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME before running.
 */
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const NAME = process.env.ADMIN_NAME || 'Admin';

async function run() {
  if (!EMAIL || !PASSWORD) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running this script.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne({ email: EMAIL });
  if (user) {
    user.role = 'admin';
    user.password = PASSWORD;
    await user.save();
    console.log(`Promoted existing user to admin and reset password: ${EMAIL}`);
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
