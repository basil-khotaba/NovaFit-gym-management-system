require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

/**
 * One-off seed script: creates the three membership plans (Starter,
 * Premium, Elite) or updates them in place if they already exist.
 * Run manually with: node scripts/seedPlans.js
 */
const plans = [
  {
    name: 'Starter',
    price: 29,
    classLimit: 1,
    featured: false,
    features: ['1 class per month', 'Access to gym floor', 'Locker room access'],
  },
  {
    name: 'Premium',
    price: 59,
    classLimit: 5,
    featured: true,
    features: ['5 classes per month', 'Access to gym floor', 'Locker room access', 'Nutrition guide'],
  },
  {
    name: 'Elite',
    price: 99,
    classLimit: null,
    featured: false,
    features: ['Unlimited classes', 'Access to gym floor', 'Locker room access', 'Nutrition guide', 'Personal trainer session'],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const data of plans) {
    const existing = await Plan.findOne({ name: data.name });
    if (existing) {
      // Plan already exists - overwrite its fields instead of duplicating it.
      await Plan.findByIdAndUpdate(existing._id, data);
      console.log(`Updated: ${data.name} → classLimit: ${data.classLimit ?? 'unlimited'}`);
    } else {
      await Plan.create(data);
      console.log(`Created: ${data.name} → classLimit: ${data.classLimit ?? 'unlimited'}`);
    }
  }

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
