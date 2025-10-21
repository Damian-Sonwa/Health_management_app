const mongoose = require('mongoose');
require('dotenv').config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to healthify_tracker database\n');
    
    const User = mongoose.connection.db.collection('users');
    const users = await User.find({}).toArray();
    
    console.log('Users in your database:\n');
    users.forEach((user, index) => {
      console.log((index + 1) + '. ' + user.name);
      console.log('   Email: ' + user.email);
      console.log('');
    });
    
    console.log('Total users: ' + users.length);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listUsers();
