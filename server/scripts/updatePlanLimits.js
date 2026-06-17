require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

async function updateLimits() {
  await mongoose.connect(process.env.MONGO_URI);

  const updates = [
    { name: /starter/i, classLimit: 1 },
    { name: /premium/i, classLimit: 5 },
    { name: /elite/i, classLimit: null },
  ];

  for (const { name, classLimit } of updates) {
    const result = await Plan.findOneAndUpdate(
      { name },
      { classLimit },
      { new: true }
    );
    if (result) {
      console.log(`${result.name}: classLimit → ${classLimit ?? 'unlimited'}`);
    } else {
      console.log(`No plan matched: ${name}`);
    }
  }

  await mongoose.disconnect();
}

updateLimits().catch(err => { console.error(err); process.exit(1); });
