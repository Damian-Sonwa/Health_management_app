const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Vital = require('./models/Vital');
const Medication = require('./models/Medication');
const Device = require('./models/Device');

dotenv.config();

async function seed() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    // 2. Clear existing collections (optional)
    await User.deleteMany({});
    await Vital.deleteMany({});
    await Medication.deleteMany({});
    await Device.deleteMany({});

    console.log('🗑️ Cleared existing collections');

    // 3. Create sample users
    const users = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1-555-0101',
        profile: {
          dateOfBirth: new Date('1985-03-15'),
          gender: 'female',
          bloodType: 'O+',
          allergies: ['Penicillin'],
          emergencyContact: {
            name: 'John Johnson',
            phone: '+1-555-0102',
            relationship: 'Spouse'
          },
          profilePicture: 'https://i.pravatar.cc/150?img=1'
        }
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1-555-0201',
        profile: {
          dateOfBirth: new Date('1990-07-22'),
          gender: 'male',
          bloodType: 'A-',
          allergies: ['Shellfish'],
          emergencyContact: {
            name: 'Mary Smith',
            phone: '+1-555-0202',
            relationship: 'Sister'
          },
          profilePicture: 'https://i.pravatar.cc/150?img=2'
        }
      },
      {
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1-555-0301',
        profile: {
          dateOfBirth: new Date('1978-11-08'),
          gender: 'female',
          bloodType: 'B+',
          allergies: ['Peanuts'],
          emergencyContact: {
            name: 'David Davis',
            phone: '+1-555-0302',
            relationship: 'Husband'
          },
          profilePicture: 'https://i.pravatar.cc/150?img=3'
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Sample users created:', createdUsers.length);

    // 4. Create sample vitals for each user
    const vitals = [];
    createdUsers.forEach(user => {
      vitals.push(
        { 
          userId: user._id, 
          bloodPressure: '120/80', 
          pulse: '72', 
          temperature: '36.7',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        { 
          userId: user._id, 
          bloodPressure: '130/85', 
          pulse: '75', 
          temperature: '37.0',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        { 
          userId: user._id, 
          bloodPressure: '118/78', 
          pulse: '68', 
          temperature: '36.5',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      );
    });
    await Vital.insertMany(vitals);
    console.log('✅ Sample vitals created:', vitals.length);

    // 5. Create sample medications for each user
    const medications = [];
    createdUsers.forEach(user => {
      medications.push(
        {
          userId: user._id,
          prescriptionFile: 'prescription_001.pdf',
          paymentReceipt: 'receipt_001.png',
          deliveryAddress: '123 Main Street, Anytown, CA 90210',
          status: 'pending',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
          userId: user._id,
          prescriptionFile: 'prescription_002.pdf',
          paymentReceipt: 'receipt_002.png',
          deliveryAddress: '456 Elm Street, Somewhere, NY 10001',
          status: 'delivered',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        }
      );
    });
    await Medication.insertMany(medications);
    console.log('✅ Sample medications created:', medications.length);

    // 6. Create sample devices for each user
    const devices = [];
    createdUsers.forEach(user => {
      devices.push(
        { 
          userId: user._id, 
          deviceType: 'Heart Rate Monitor', 
          reading: '72 bpm',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        { 
          userId: user._id, 
          deviceType: 'Blood Pressure Monitor', 
          reading: '120/80 mmHg',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
        }
      );
    });
    await Device.insertMany(devices);
    console.log('✅ Sample devices created:', devices.length);

    console.log('\n🎉 All sample data inserted successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📊 Vitals: ${vitals.length}`);
    console.log(`💊 Medications: ${medications.length}`);
    console.log(`📱 Devices: ${devices.length}`);

    console.log('\n🔐 Sample Login Credentials:');
    console.log('📧 alice@example.com | 🔑 password123');
    console.log('📧 bob@example.com | 🔑 password123');
    console.log('📧 carol@example.com | 🔑 password123');

    // Disconnect
    await mongoose.disconnect();
    console.log('🛑 Disconnected from MongoDB');

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();