require('dotenv').config();
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');
const Class = require('../models/Class');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const newTrainers = ['Marcus Webb', 'Lena Fischer', 'Dani Torres'];
  const newClasses = ['CrossFit WOD', 'Functional Strength', 'Marathon Prep', 'Spin & Burn', 'Morning Yoga Flow', 'Breathwork & Mobility'];

  for (const name of newTrainers) {
    await Trainer.findOneAndUpdate({ name }, { photo: '' });
    console.log(`Cleared photo: ${name}`);
  }

  for (const name of newClasses) {
    await Class.findOneAndUpdate({ name }, { image: '' });
    console.log(`Cleared image: ${name}`);
  }

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
