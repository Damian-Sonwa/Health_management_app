require('dotenv').config();
const mongoose = require('mongoose');
const Caregiver = require('../models/Caregiver');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanCaregivers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all user IDs
    const users = await User.find({}, '_id email');
    const validUserIds = users.map(u => u._id.toString());
    
    console.log(`📊 Found ${users.length} users in database`);
    console.log(`👥 Valid user IDs: ${validUserIds.join(', ')}\n`);

    // Find all caregivers
    const allCaregivers = await Caregiver.find({});
    console.log(`🔍 Total caregivers in database: ${allCaregivers.length}\n`);

    // Find caregivers with invalid userIds (demo/orphaned caregivers)
    const invalidCaregivers = allCaregivers.filter(cg => 
      !validUserIds.includes(cg.userId.toString())
    );

    if (invalidCaregivers.length === 0) {
      console.log('✅ No demo or orphaned caregivers found!');
    } else {
      console.log(`❌ Found ${invalidCaregivers.length} demo/orphaned caregivers:`);
      invalidCaregivers.forEach(cg => {
        console.log(`   - ${cg.name} (${cg.relationship}) - UserId: ${cg.userId}`);
      });

      console.log('\n🗑️  Deleting demo/orphaned caregivers...');
      const result = await Caregiver.deleteMany({
        userId: { $nin: validUserIds.map(id => new mongoose.Types.ObjectId(id)) }
      });

      console.log(`✅ Deleted ${result.deletedCount} demo/orphaned caregivers\n`);
    }

    // Show remaining caregivers per user
    console.log('📋 Caregivers per user after cleanup:');
    for (const user of users) {
      const count = await Caregiver.countDocuments({ 
        userId: user._id,
        isActive: true 
      });
      console.log(`   ${user.email}: ${count} caregivers`);
    }

    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

cleanCaregivers();

