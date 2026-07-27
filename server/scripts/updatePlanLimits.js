require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

/**
 * One-off maintenance script: backfills the classLimit field on
 * existing plans (matched by name, case-insensitive) for deployments
 * seeded before classLimit was added to the Plan model.
 * Run manually with: node scripts/updatePlanLimits.js
 */
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
