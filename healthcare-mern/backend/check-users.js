require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('\n📊 Latest Users in Database:\n');
    const users = await User.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`Total users: ${users.length}\n`);
    users.forEach(u => {
      console.log(`  ✅ ${u.name} (${u.email})`);
      console.log(`     Created: ${u.createdAt}`);
      console.log('');
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

