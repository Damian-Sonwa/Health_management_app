const mongoose = require('mongoose');
require('dotenv').config();

async function forceUserMigration() {
  try {
    console.log('🔄 Starting user migration...');
    
    // Connect to MongoDB without specifying a database
    const baseUri = 'mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(baseUri);
    console.log('✅ Connected to MongoDB Atlas');
    
    const client = mongoose.connection.getClient();
    const testDb = client.db('test');
    const healthifyDb = client.db('healthify_tracker');
    
    console.log('\n📊 Migrating users from "test" to "healthify_tracker"...');
    
    const testUsers = testDb.collection('users');
    const healthifyUsers = healthifyDb.collection('users');
    
    // Get all users from test database
    const usersToMigrate = await testUsers.find({}).toArray();
    console.log(`\n👥 Found ${usersToMigrate.length} users in "test" database`);
    
    // Get existing users in healthify_tracker
    const existingUsers = await healthifyUsers.find({}).toArray();
    const existingEmails = new Set(existingUsers.map(u => u.email));
    console.log(`👥 Found ${existingUsers.length} existing users in "healthify_tracker" database`);
    
    // Filter out users that already exist
    const newUsers = usersToMigrate.filter(user => !existingEmails.has(user.email));
    console.log(`\n➕ ${newUsers.length} new users to migrate`);
    
    if (newUsers.length > 0) {
      await healthifyUsers.insertMany(newUsers);
      console.log(`✅ Successfully migrated ${newUsers.length} users`);
      
      console.log('\n📋 Newly migrated users:');
      newUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
      });
    } else {
      console.log('ℹ️  No new users to migrate');
    }
    
    // Show all users in healthify_tracker
    const allHealthifyUsers = await healthifyUsers.find({}, {
      projection: { name: 1, email: 1, createdAt: 1 }
    }).sort({ createdAt: -1 }).toArray();
    
    console.log(`\n👥 Total users in "healthify_tracker" database: ${allHealthifyUsers.length}`);
    console.log('\n📋 All users (newest first):');
    allHealthifyUsers.forEach((user, index) => {
      const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown';
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - Created: ${createdDate}`);
    });
    
    console.log('\n🎉 Migration completed!');
    console.log('\n💡 Your database "healthify_tracker" is now ready to use!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

forceUserMigration();
