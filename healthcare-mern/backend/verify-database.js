// Clear require cache
delete require.cache[require.resolve('dotenv')];

const mongoose = require('mongoose');
require('dotenv').config({ override: true });

async function verifyDatabase() {
  try {
    console.log('🔌 Verifying database connection...');
    const uri = process.env.MONGODB_URI;
    console.log('MongoDB URI from .env:', uri);
    
    if (uri.includes('/healthify_tracker')) {
      console.log('✅ URI contains "healthify_tracker"!');
    } else {
      console.log('❌ URI does NOT contain "healthify_tracker"!');
    }
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`\n📊 Current Database: ${dbName}`);
    
    if (dbName === 'healthify_tracker') {
      console.log('✅ SUCCESS! Using healthify_tracker database');
    } else {
      console.log(`❌ ERROR! Still using ${dbName} database`);
    }
    
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`\n👥 Total users: ${usersCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyDatabase();
