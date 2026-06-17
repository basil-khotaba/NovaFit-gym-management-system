require('dotenv').config();
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');

const trainers = [
  {
    name: 'Alex Carter',
    bio: 'Certified strength and conditioning coach with 8 years of experience helping athletes and everyday gym-goers reach their peak performance.',
    specialties: ['Strength Training', 'Powerlifting', 'Conditioning'],
    photo: '/uploads/trainer-alex.png',
    rating: 4.9,
  },
  {
    name: 'Maya Patel',
    bio: 'Former professional dancer turned HIIT and yoga instructor. Maya brings energy, precision, and mindfulness to every session.',
    specialties: ['HIIT', 'Yoga', 'Flexibility'],
    photo: '/uploads/trainer-maya.png',
    rating: 4.8,
  },
  {
    name: 'Jordan Lee',
    bio: 'Nutrition-focused personal trainer passionate about sustainable fat loss and building healthy habits that last a lifetime.',
    specialties: ['Weight Loss', 'Nutrition', 'Cardio'],
    photo: '/uploads/trainer-jake.png',
    rating: 4.7,
  },
  {
    name: 'Sofia Romero',
    bio: 'Pilates and core specialist with a background in physical therapy. Perfect for rehabilitation and injury prevention.',
    specialties: ['Pilates', 'Core Training', 'Rehabilitation'],
    photo: '/uploads/trainer-sarah.png',
    rating: 4.8,
  },
  {
    name: 'Marcus Webb',
    bio: 'Former MMA fighter and certified CrossFit coach. Marcus pushes you past your limits with functional training that builds real-world strength.',
    specialties: ['CrossFit', 'Functional Training', 'MMA Conditioning'],
    photo: '/uploads/trainer-jake.png',
    rating: 4.9,
  },
  {
    name: 'Lena Fischer',
    bio: 'Sports science graduate and endurance athlete. Lena specialises in running technique, VO2 max improvement, and marathon preparation.',
    specialties: ['Endurance', 'Running', 'Cardio'],
    photo: '/uploads/trainer-sarah.png',
    rating: 4.7,
  },
  {
    name: 'Dani Torres',
    bio: 'Certified yoga therapist and meditation guide. Dani combines breathwork, mindfulness, and movement to reduce stress and improve mobility.',
    specialties: ['Yoga', 'Meditation', 'Mobility'],
    photo: '/uploads/trainer-maya.png',
    rating: 4.8,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const data of trainers) {
    const existing = await Trainer.findOne({ name: data.name });
    if (existing) {
      console.log(`Already exists: ${data.name}`);
    } else {
      await Trainer.create(data);
      console.log(`Created: ${data.name}`);
    }
  }

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
