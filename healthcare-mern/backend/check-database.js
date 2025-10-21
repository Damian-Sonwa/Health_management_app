const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabaseAndUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const uri = process.env.MONGODB_URI;
    console.log('MongoDB URI:', uri);
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get database name from connection
    const dbName = mongoose.connection.db.databaseName;
    console.log(`\n📊 Database Name: ${dbName}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Check users collection specifically
    const usersCollection = mongoose.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Total users in 'users' collection: ${userCount}`);
    
    // Get all users with their creation dates
    const users = await usersCollection.find({}, {
      projection: { name: 1, email: 1, createdAt: 1, _id: 1 }
    }).sort({ createdAt: -1 }).toArray();
    
    console.log('\n📋 All users (newest first):');
    users.forEach((user, index) => {
      const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown';
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - Created: ${createdDate}`);
    });
    
    // Check if there are any users in other collections
    console.log('\n🔍 Checking for users in other collections...');
    for (const collection of collections) {
      if (collection.name !== 'users') {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        if (count > 0) {
          console.log(`  - ${collection.name}: ${count} documents`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDatabaseAndUsers();
