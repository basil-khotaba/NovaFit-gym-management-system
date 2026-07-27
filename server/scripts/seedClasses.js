require('dotenv').config();
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');
const Class = require('../models/Class');

/**
 * One-off seed script: creates the demo class schedule and assigns
 * each class to its trainer. Requires seedTrainers.js to have been
 * run first, since it looks trainers up by name.
 * Run manually with: node scripts/seedClasses.js
 */
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Look up trainers by name so classes can be linked to their _id.
  const [alex, maya, jordan, sofia, marcus, lena, dani] = await Promise.all([
    Trainer.findOne({ name: 'Alex Carter' }),
    Trainer.findOne({ name: 'Maya Patel' }),
    Trainer.findOne({ name: 'Jordan Lee' }),
    Trainer.findOne({ name: 'Sofia Romero' }),
    Trainer.findOne({ name: 'Marcus Webb' }),
    Trainer.findOne({ name: 'Lena Fischer' }),
    Trainer.findOne({ name: 'Dani Torres' }),
  ]);

  const classes = [
    {
      name: 'Powerlifting Fundamentals',
      description: 'Master the squat, bench press, and deadlift with perfect form. Suitable for all levels.',
      category: 'Strength',
      durationMinutes: 60,
      schedule: 'Mon & Wed 7:00am',
      capacity: 12,
      image: '/uploads/class-powerlifting.png',
      trainer: alex._id,
    },
    {
      name: 'Olympic Lifting',
      description: 'Learn the snatch and clean & jerk. Build explosive power and full-body coordination.',
      category: 'Strength',
      durationMinutes: 60,
      schedule: 'Tue & Thu 6:00am',
      capacity: 10,
      image: '/uploads/class-olympic-lifting.png',
      trainer: alex._id,
    },
    {
      name: 'HIIT Circuit',
      description: 'High-intensity interval training designed to torch calories and boost your metabolism.',
      category: 'HIIT',
      durationMinutes: 45,
      schedule: 'Mon, Wed & Fri 6:00pm',
      capacity: 20,
      image: '/uploads/class-hiit-circuit.png',
      trainer: maya._id,
    },
    {
      name: 'Metabolic Blast',
      description: 'A full-body metabolic conditioning workout combining weights and cardio intervals.',
      category: 'HIIT',
      durationMinutes: 45,
      schedule: 'Tue & Sat 9:00am',
      capacity: 15,
      image: '/uploads/class-metabolic.png',
      trainer: maya._id,
    },
    {
      name: 'Cardio Burn',
      description: 'High-energy cardio session focused on endurance, fat loss, and heart health.',
      category: 'Cardio',
      durationMinutes: 50,
      schedule: 'Mon, Wed & Fri 7:00am',
      capacity: 25,
      image: '/uploads/class-cardio-burn.png',
      trainer: jordan._id,
    },
    {
      name: 'Endurance Run',
      description: 'Treadmill-based interval running class for all fitness levels. Build your engine.',
      category: 'Cardio',
      durationMinutes: 40,
      schedule: 'Tue & Thu 7:30am',
      capacity: 20,
      image: '/uploads/class-endurance-run.png',
      trainer: jordan._id,
    },
    {
      name: 'Vinyasa Flow',
      description: 'A dynamic yoga class linking breath to movement. Great for flexibility and stress relief.',
      category: 'Yoga',
      durationMinutes: 60,
      schedule: 'Mon, Wed & Fri 8:00am',
      capacity: 18,
      image: '/uploads/class-vinyasa-flow.png',
      trainer: sofia._id,
    },
    {
      name: 'Yin & Restore',
      description: 'Slow, deep stretching yoga targeting connective tissue. Perfect for recovery days.',
      category: 'Yoga',
      durationMinutes: 75,
      schedule: 'Sun 10:00am',
      capacity: 18,
      image: '/uploads/class-yin-restore.png',
      trainer: sofia._id,
    },
    {
      name: 'CrossFit WOD',
      description: 'Workout of the Day — functional movements performed at high intensity. Every session is different, always brutal, always rewarding.',
      category: 'HIIT',
      durationMinutes: 60,
      schedule: 'Mon, Wed & Fri 5:30am',
      capacity: 16,
      image: '/uploads/class-hiit-circuit.png',
      trainer: marcus._id,
    },
    {
      name: 'Functional Strength',
      description: 'Real-world strength built through kettlebells, sleds, and bodyweight movements. Train to move better, not just look better.',
      category: 'Strength',
      durationMinutes: 55,
      schedule: 'Tue & Thu 7:00pm',
      capacity: 14,
      image: '/uploads/class-powerlifting.png',
      trainer: marcus._id,
    },
    {
      name: 'Marathon Prep',
      description: 'Structured running training for 5K, 10K, and marathon runners. Improve pace, form, and race-day strategy.',
      category: 'Cardio',
      durationMinutes: 60,
      schedule: 'Sat & Sun 7:00am',
      capacity: 20,
      image: '/uploads/class-endurance-run.png',
      trainer: lena._id,
    },
    {
      name: 'Spin & Burn',
      description: 'High-energy indoor cycling class set to pumping music. Burn up to 600 calories in one session.',
      category: 'Cardio',
      durationMinutes: 45,
      schedule: 'Tue, Thu & Sat 6:30am',
      capacity: 22,
      image: '/uploads/class-cardio-burn.png',
      trainer: lena._id,
    },
    {
      name: 'Morning Yoga Flow',
      description: 'Energise your day with a sunrise yoga session. Sun salutations, standing poses, and a calming savasana to start fresh.',
      category: 'Yoga',
      durationMinutes: 50,
      schedule: 'Mon, Wed & Fri 6:30am',
      capacity: 20,
      image: '/uploads/class-vinyasa-flow.png',
      trainer: dani._id,
    },
    {
      name: 'Breathwork & Mobility',
      description: 'Guided breathwork combined with deep mobility drills. Reduces stress, improves posture, and speeds up recovery.',
      category: 'Yoga',
      durationMinutes: 45,
      schedule: 'Wed & Fri 7:00pm',
      capacity: 15,
      image: '/uploads/class-yin-restore.png',
      trainer: dani._id,
    },
  ];

  for (const data of classes) {
    const existing = await Class.findOne({ name: data.name });
    if (existing) {
      console.log(`Already exists: ${data.name}`);
    } else {
      await Class.create(data);
      console.log(`Created: ${data.name}`);
    }
  }

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
