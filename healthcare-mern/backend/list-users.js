const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function listAllUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: ${dbName}\n`);
    
    const User = mongoose.connection.db.collection('users');
    const users = await User.find({}, { projection: { name: 1, email: 1, password: 1 } }).toArray();
    
    console.log(`👥 Total users: ${users.length}\n`);
    console.log('📋 All users:\n');
    
    for (const user of users) {
      console.log(`${user.name} (${user.email})`);
      console.log(`   Password hash: ${user.password.substring(0, 30)}...`);
      
      // Test password
      const isValid = await bcrypt.compare('Godofjustice@001', user.password);
      console.log(`   Password "Godofjustice@001": ${isValid ? '✅ VALID' : '❌ INVALID'}\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

listAllUsers();
