require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('\n🔍 Searching for Recently Created Users:\n');
    
    // Find the users we just saw being created
    const chisom = await User.findOne({ email: 'soma@gmail.com' });
    const joseph = await User.findOne({ email: 'richmany@gmail.com' });
    
    console.log('📧 soma@gmail.com:');
    if (chisom) {
      console.log(`   ✅ FOUND - Name: ${chisom.name}`);
      console.log(`   📅 Created: ${chisom.createdAt}`);
      console.log(`   🆔 ID: ${chisom._id}`);
    } else {
      console.log('   ❌ NOT FOUND');
    }
    
    console.log('\n📧 richmany@gmail.com:');
    if (joseph) {
      console.log(`   ✅ FOUND - Name: ${joseph.name}`);
      console.log(`   📅 Created: ${joseph.createdAt}`);
      console.log(`   🆔 ID: ${joseph._id}`);
    } else {
      console.log('   ❌ NOT FOUND');
    }
    
    // Get total count
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total Users in Database: ${totalUsers}\n`);
    
    // Show all users sorted by creation date
    console.log('📋 All Users (sorted by newest first):\n');
    const allUsers = await User.find({}).sort({ createdAt: -1 }).select('name email createdAt');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.createdAt}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

