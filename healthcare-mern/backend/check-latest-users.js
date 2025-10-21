require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('\n📊 COMPLETE DATABASE ANALYSIS:\n');
    
    // Get total count
    const total = await User.countDocuments();
    console.log(`Total users: ${total}\n`);
    
    // Check for specific users from logs
    console.log('🔍 Looking for users from backend logs:\n');
    
    const chisom = await User.findOne({ email: 'soma@gmail.com' });
    const joseph = await User.findOne({ email: 'richmany@gmail.com' });
    const uduma = await User.findOne({ email: 'solma@gmail.com' });
    
    console.log('1. Chisom Odinga (soma@gmail.com):');
    console.log(chisom ? `   ✅ FOUND - Name: "${chisom.name}"` : '   ❌ NOT FOUND');
    
    console.log('\n2. joseph Rich (richmany@gmail.com):');
    console.log(joseph ? `   ✅ FOUND - Name: "${joseph.name}"` : '   ❌ NOT FOUND');
    
    console.log('\n3. Uduma Nkechi (solma@gmail.com):');
    console.log(uduma ? `   ✅ FOUND - Name: "${uduma.name}"` : '   ❌ NOT FOUND');
    
    // Get ALL users sorted by newest
    console.log('\n\n📋 ALL USERS (sorted by newest first):\n');
    const allUsers = await User.find({})
      .sort({ createdAt: -1 })
      .select('name email createdAt');
    
    allUsers.forEach((user, index) => {
      const nameDisplay = user.name || '[NO NAME]';
      const timeAgo = getTimeAgo(user.createdAt);
      console.log(`${index + 1}. "${nameDisplay}" (${user.email})`);
      console.log(`   Created: ${user.createdAt} (${timeAgo})\n`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

