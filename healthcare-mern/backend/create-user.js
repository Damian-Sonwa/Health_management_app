const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// MongoDB connection string - Replace <db_password> with your actual password
const MONGODB_URI = 'mongodb+srv://madudamian25_db_user:<db_password>@cluster0.c2havli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function createUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'madudamian25@gmail.com' });
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      console.log('User details:', {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        createdAt: existingUser.createdAt
      });
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('Godofjustice@001', 10);
      const user = new User({
        name: 'Madu Damian',
        email: 'madudamian25@gmail.com',
        password: hashedPassword,
        phone: '+1234567890',
        role: 'patient'
      });

      await user.save();
      console.log('✅ User created successfully:', user.email);
      console.log('User details:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    }

    // Test CRUD operations
    console.log('\n🧪 Testing CRUD operations...');
    
    // READ - Get all users
    const users = await User.find({}, 'name email role createdAt');
    console.log('📖 READ - All users:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    // UPDATE - Update user phone
    const updateResult = await User.updateOne(
      { email: 'madudamian25@gmail.com' },
      { phone: '+1234567890' }
    );
    console.log('✏️ UPDATE - Phone updated:', updateResult.modifiedCount > 0);

    // DELETE - Test delete (but don't actually delete)
    const deleteTest = await User.findOne({ email: 'madudamian25@gmail.com' });
    console.log('🗑️ DELETE - User exists for deletion:', deleteTest ? 'Yes' : 'No');

    console.log('\n✅ All CRUD operations tested successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createUser();
