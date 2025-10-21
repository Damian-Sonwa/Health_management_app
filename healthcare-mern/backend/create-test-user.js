const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB');
    
    const User = mongoose.connection.db.collection('users');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const user = {
      name: 'Test User',
      email: 'test@test.com',
      password: hashedPassword,
      createdAt: new Date()
    };
    
    const result = await User.insertOne(user);
    console.log(' User created:', user.email);
    await mongoose.disconnect();
  } catch (error) {
    console.error(' Error:', error.message);
  }
}

createUser();
