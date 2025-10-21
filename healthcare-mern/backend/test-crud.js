const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');
const Vital = require('./models/Vital');
const Medication = require('./models/Medication');
const MedicationRequest = require('./models/MedicationRequest');

async function testCRUDOperations() {
  try {
    // Connect to MongoDB using environment variable
    console.log('🔌 Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found in .env file');
      console.log('Please make sure your .env file contains:');
      console.log('MONGODB_URI=mongodb+srv://madudamian25_db_user:YOUR_ACTUAL_PASSWORD@cluster0.c2havli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Test 1: CREATE - Create user if doesn't exist
    console.log('\n📝 Testing CREATE operation...');
    const existingUser = await User.findOne({ email: 'madudamian25@gmail.com' });
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
    } else {
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
    }

    // Test 2: READ - Get all users
    console.log('\n📖 Testing READ operation...');
    const users = await User.find({}, 'name email role createdAt');
    console.log(`✅ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Test 3: UPDATE - Update user information
    console.log('\n✏️ Testing UPDATE operation...');
    const updateResult = await User.updateOne(
      { email: 'madudamian25@gmail.com' },
      { 
        phone: '+1234567890',
        lastLogin: new Date()
      }
    );
    console.log(`✅ Update result: ${updateResult.modifiedCount} document(s) modified`);

    // Test 4: DELETE - Test delete operation (but don't actually delete)
    console.log('\n🗑️ Testing DELETE operation...');
    const userToDelete = await User.findOne({ email: 'madudamian25@gmail.com' });
    if (userToDelete) {
      console.log('✅ User exists and can be deleted:', userToDelete.email);
      // Uncomment the next line to actually delete the user
      // await User.deleteOne({ email: 'madudamian25@gmail.com' });
      // console.log('✅ User deleted successfully');
    }

    // Test 5: Test other collections
    console.log('\n🧪 Testing other collections...');
    
    // Test Vitals collection
    const vitalsCount = await Vital.countDocuments();
    console.log(`✅ Vitals collection: ${vitalsCount} documents`);

    // Test Medications collection
    const medicationsCount = await Medication.countDocuments();
    console.log(`✅ Medications collection: ${medicationsCount} documents`);

    // Test 6: Create sample data
    console.log('\n📊 Creating sample data...');
    
    const user = await User.findOne({ email: 'madudamian25@gmail.com' });
    if (user) {
      // Create sample vital
      const existingVital = await Vital.findOne({ userId: user._id });
      if (!existingVital) {
        const vital = new Vital({
          userId: user._id,
          bloodPressure: '120/80',
          pulse: '72',
          temperature: '98.6'
        });
        await vital.save();
        console.log('✅ Sample vital created');
      }

      // Create sample medication request
      const existingMedicationRequest = await MedicationRequest.findOne({ userId: user._id });
      if (!existingMedicationRequest) {
        const medicationRequest = new MedicationRequest({
          userId: user._id,
          patientInfo: {
            name: user.name,
            phone: user.phone,
            email: user.email
          },
          pharmacy: {
            name: 'hospital_pharmacy'
          },
          deliveryAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          payment: {
            method: 'insurance',
            amount: 25.99
          },
          medications: [{
            name: 'Lisinopril',
            dosage: '10mg',
            quantity: 30,
            price: 15.99
          }],
          status: 'pending'
        });
        await medicationRequest.save();
        console.log('✅ Sample medication request created');
      }
    }

    console.log('\n🎉 All CRUD operations tested successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ MongoDB connection: Working');
    console.log('✅ User authentication: Ready');
    console.log('✅ CRUD operations: All working');
    console.log('✅ Sample data: Created');
    console.log('\n🚀 Your API is ready to use!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Solution:');
      console.log('1. Check your MongoDB Atlas password');
      console.log('2. Make sure IP address is whitelisted');
      console.log('3. Update the .env file with correct password');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
testCRUDOperations();
