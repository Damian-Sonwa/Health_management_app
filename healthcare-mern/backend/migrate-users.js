require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function migrateUsers() {
  try {
    console.log('\n🔄 USER MIGRATION TOOL\n');
    console.log('This will copy users from "test" database to "healthify_tracker"\n');
    
    // Connect to test database
    console.log('📊 Connecting to "test" database...');
    const testConnection = await mongoose.createConnection(process.env.MONGODB_URI, {
      dbName: 'test'
    });
    console.log('✅ Connected to test\n');
    
    // Get User model for test db
    const TestUser = testConnection.model('User', User.schema);
    
    // Find all users in test (including password field which is normally hidden)
    const testUsers = await TestUser.find({}).select('+password');
    console.log(`📋 Found ${testUsers.length} users in "test" database:\n`);
    testUsers.forEach((u, i) => {
      console.log(`   ${i+1}. ${u.name} (${u.email})`);
    });
    
    // Connect to healthify_tracker
    console.log('\n📊 Connecting to "healthify_tracker" database...');
    const healthifyConnection = await mongoose.createConnection(process.env.MONGODB_URI, {
      dbName: 'healthify_tracker'
    });
    console.log('✅ Connected to healthify_tracker\n');
    
    // Get User model for healthify_tracker db
    const HealthifyUser = healthifyConnection.model('User', User.schema);
    
    // Check existing users in healthify_tracker
    const existingUsers = await HealthifyUser.find({});
    console.log(`📊 Currently ${existingUsers.length} users in "healthify_tracker"\n`);
    
    // Migrate
    console.log('🔄 Starting migration...\n');
    let migrated = 0;
    let skipped = 0;
    
    for (const user of testUsers) {
      // Check if email already exists in healthify_tracker
      const existing = await HealthifyUser.findOne({ email: user.email });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${user.email} (already exists)`);
        skipped++;
      } else {
        // Copy user to healthify_tracker
        const newUser = new HealthifyUser({
          _id: user._id,
          name: user.name,
          email: user.email,
          password: user.password, // Already hashed
          phone: user.phone,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          profile: user.profile,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
        
        await newUser.save();
        console.log(`✅ Migrated: ${user.email}`);
        migrated++;
      }
    }
    
    console.log(`\n📊 MIGRATION COMPLETE:`);
    console.log(`   ✅ Migrated: ${migrated} users`);
    console.log(`   ⏭️  Skipped: ${skipped} users (duplicates)`);
    console.log(`   📊 Total in healthify_tracker: ${existingUsers.length + migrated}\n`);
    
    // Close connections
    await testConnection.close();
    await healthifyConnection.close();
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

// Ask for confirmation
console.log('\n⚠️  WARNING: This will copy users from "test" to "healthify_tracker"');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
  migrateUsers();
}, 5000);
