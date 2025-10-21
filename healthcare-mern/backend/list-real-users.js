const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB\n');
    
    const User = mongoose.connection.db.collection('users');
    const users = await User.find({}, { projection: { name: 1, email: 1, createdAt: 1 } }).toArray();
    
    console.log(' Users in healthify_tracker database:\n');
    users.forEach((user, index) => {
      console.log(${index + 1}. Name: );
      console.log(   Email: );
      console.log(   Created: \n);
    });
    
    console.log(Total users: );
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listUsers();
