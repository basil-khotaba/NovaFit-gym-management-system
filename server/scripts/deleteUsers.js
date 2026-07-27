require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Membership = require('../models/Membership');

/**
 * One-off cleanup script: permanently deletes the hard-coded list of
 * test/demo user accounts below along with their memberships.
 * Run manually with: node scripts/deleteUsers.js
 */
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const emails = ['moste@gmail.com', 'ahmad@gmail.com', 'karam@gmail.com', 'jobran@gmail.com'];
  const users = await User.find({ email: { $in: emails } });
  const ids = users.map(u => u._id);
  await Membership.deleteMany({ user: { $in: ids } });
  await User.deleteMany({ email: { $in: emails } });
  console.log('Deleted', users.length, 'users and their memberships');
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
