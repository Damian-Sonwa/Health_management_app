const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('../models/Doctor');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_management';

async function testDoctors() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const doctors = await Doctor.find({
      isActive: true,
      available: { $ne: false }
    })
    .select('_id name specialty profileImage isActive available')
    .sort({ name: 1 })
    .lean();

    console.log(`\n📋 Found ${doctors.length} available doctors:\n`);
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} (${doctor.specialty})`);
      console.log(`   ID: ${doctor._id}`);
      console.log(`   isActive: ${doctor.isActive}, available: ${doctor.available}`);
      console.log('');
    });

    if (doctors.length === 0) {
      console.log('⚠️  No doctors found! Run seedDoctors.js to seed doctors.');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDoctors();

