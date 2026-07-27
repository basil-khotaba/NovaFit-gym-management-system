require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

/**
 * One-off maintenance script: sets photo/image paths on an older set
 * of trainers and classes by name, using the raw collections directly
 * (bypasses Mongoose models/validation since this is a quick data fix).
 * Run manually with: node scripts/setImages.js
 */
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;

  const trainers = [
    { name: 'Alex Rodriguez', photo: '/uploads/trainer-alex.png' },
    { name: 'Sarah Chen',     photo: '/uploads/trainer-sarah.png' },
    { name: 'Maya Patel',     photo: '/uploads/trainer-maya.png' },
    { name: 'Jake Williams',  photo: '/uploads/trainer-jake.png' },
  ];
  for (const t of trainers) {
    const r = await db.collection('trainers').updateOne({ name: t.name }, { $set: { photo: t.photo } });
    console.log('Trainer', t.name, r.modifiedCount ? 'updated' : 'not found');
  }

  const classes = [
    { name: 'Morning Cardio Blast',  image: '/uploads/class-cardio-burn.png' },
    { name: 'Cycling Sprint',        image: '/uploads/class-endurance-run.png' },
    { name: 'HIIT Inferno',          image: '/uploads/class-hiit-circuit.png' },
    { name: 'Tabata Circuit',        image: '/uploads/class-metabolic.png' },
    { name: 'Olympic Weightlifting', image: '/uploads/class-olympic-lifting.png' },
    { name: 'Power Lifting',         image: '/uploads/class-powerlifting.png' },
    { name: 'Morning Flow Yoga',     image: '/uploads/class-vinyasa-flow.png' },
    { name: 'Power Yoga',            image: '/uploads/class-yin-restore.png' },
  ];
  for (const c of classes) {
    const r = await db.collection('classes').updateOne({ name: c.name }, { $set: { image: c.image } });
    console.log('Class', c.name, r.modifiedCount ? 'updated' : 'not found');
  }

  await mongoose.disconnect();
  console.log('Done');
}).catch(e => { console.error(e.message); process.exit(1); });
