require('dotenv').config();
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');
const Class = require('../models/Class');

/**
 * One-off maintenance script: assigns newly-added image/photo files
 * (already uploaded to /uploads) to the classes and trainer that
 * were seeded without media. Matches records by name.
 * Run manually with: node scripts/assignNewMedia.js
 */
async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const classImages = [
    { name: 'Breathwork & Mobility', image: '/uploads/class-breathwork-mobility.png' },
    { name: 'CrossFit WOD',          image: '/uploads/class-crossfit-wod.png' },
    { name: 'Functional Strength',   image: '/uploads/class-functional-strength.png' },
    { name: 'Marathon Prep',         image: '/uploads/class-marathon-prep.png' },
    { name: 'Morning Yoga Flow',     image: '/uploads/class-morning-yoga-flow.png' },
    { name: 'Spin & Burn',           image: '/uploads/class-spin-burn.png' },
  ];

  for (const { name, image } of classImages) {
    const result = await Class.findOneAndUpdate({ name }, { image }, { new: true });
    console.log(result ? `✓ Class: ${name}` : `✗ Not found: ${name}`);
  }

  const trainer = await Trainer.findOneAndUpdate(
    { name: 'Dani Torres' },
    { photo: '/uploads/trainer-dani.png' },
    { new: true }
  );
  console.log(trainer ? `✓ Trainer: Dani Torres` : `✗ Not found: Dani Torres`);

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
