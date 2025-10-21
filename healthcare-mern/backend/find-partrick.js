require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function findPartrick() {
  try {
    console.log('🔍 Searching for Partrick Okondu...\n');
    
    // Check test database
    console.log('📊 Checking "test" database...');
    const testConn = await mongoose.createConnection(process.env.MONGODB_URI, { dbName: 'test' });
    const TestUser = testConn.model('User', User.schema);
    const testPartrick = await TestUser.findOne({ email: 'okondu@gmail.com' });
    
    if (testPartrick) {
      console.log('   ✅ FOUND in test database!');
      console.log(`   Name: ${testPartrick.name}`);
      console.log(`   Email: ${testPartrick.email}`);
      console.log(`   Created: ${testPartrick.createdAt}\n`);
    } else {
      console.log('   ❌ Not in test database\n');
    }
    
    // Check healthify_tracker
    console.log('📊 Checking "healthify_tracker" database...');
    const healthConn = await mongoose.createConnection(process.env.MONGODB_URI, { dbName: 'healthify_tracker' });
    const HealthUser = healthConn.model('User', User.schema);
    const healthPartrick = await HealthUser.findOne({ email: 'okondu@gmail.com' });
    
    if (healthPartrick) {
      console.log('   ✅ FOUND in healthify_tracker!');
      console.log(`   Name: ${healthPartrick.name}`);
      console.log(`   Email: ${healthPartrick.email}`);
      console.log(`   Created: ${healthPartrick.createdAt}\n`);
    } else {
      console.log('   ❌ Not in healthify_tracker\n');
    }
    
    // Summary
    console.log('📋 SUMMARY:');
    if (testPartrick && !healthPartrick) {
      console.log('   ⚠️  User is in "test" but NOT in "healthify_tracker"');
      console.log('   📌 This happened because old backend was running');
      console.log('   ✅ Solution: Migrate user or re-register with NEW backend\n');
    } else if (healthPartrick) {
      console.log('   ✅ User is in healthify_tracker - All good!\n');
    } else {
      console.log('   ❌ User not found in either database\n');
    }
    
    await testConn.close();
    await healthConn.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

findPartrick();

