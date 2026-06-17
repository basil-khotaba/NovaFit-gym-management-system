require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Membership = require('../models/Membership');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const starterPlan = await Plan.findOne({ name: 'Starter' });

  const users = [
    {
      _id: new mongoose.Types.ObjectId('6a2a658cefff054822ec2c38'),
      name: 'mostafa shlsh',
      email: 'moste@gmail.com',
      password: '$2a$12$nFjYq6m2P961pG.VTeiG1.fAIAa1S1.68/2pcpWXGp12.dWlKcfMW',
      role: 'member',
      membership: null,
      profileImage: '',
    },
    {
      _id: new mongoose.Types.ObjectId('6a2a66e6efff054822ec2c85'),
      name: 'ahmad awawdi',
      email: 'ahmad@gmail.com',
      password: '$2a$12$0JDn3j/UY5eMykzgrhVaX.bOtXBtPhPXMH1QpqylQcIXpJadMwGZO',
      role: 'member',
      membership: null,
      profileImage: '',
    },
    {
      _id: new mongoose.Types.ObjectId('6a2a67bdefff054822ec2cd4'),
      name: 'karam',
      email: 'karam@gmail.com',
      password: '$2a$12$nFz1.ScotXdcehzw0VOhnOEo1.fQ9SwrDAnbhYLvJqVRJd5Lt7Nia',
      role: 'member',
      membership: null,
      profileImage: '',
    },
    {
      _id: new mongoose.Types.ObjectId('6a2d58a354398e9b5fa14e24'),
      name: 'jobran',
      email: 'jobran@gmail.com',
      password: '$2a$12$hyd1nH1hcpNurj4rj.0TNOkLbxO1GAULxDk5pm3ftkT24.GaIAqTO',
      role: 'member',
      membership: null,
      profileImage: '',
    },
  ];

  for (const data of users) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      console.log(`Already exists: ${data.name}`);
      continue;
    }

    // Insert via raw collection to bypass the pre-save password-hashing hook
    // (passwords are already bcrypt-hashed from the source database)
    await User.collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const user = await User.findOne({ email: data.email });

    // Give each user an active Starter membership
    if (starterPlan) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      const membership = await Membership.create({
        user: user._id,
        plan: starterPlan._id,
        startDate: new Date(),
        endDate,
        isActive: true,
      });
      await User.findByIdAndUpdate(user._id, { membership: membership._id });
    }

    console.log(`Created: ${data.name}`);
  }

  const count = await User.countDocuments({ role: 'member' });
  console.log(`\nTotal members in DB: ${count}`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
