const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('../models/Doctor');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const updateDoctorName = async () => {
  try {
    const email = 'tony@gmail.com';
    const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() });
    
    if (!doctor) {
      console.log('❌ Doctor not found!');
      return;
    }
    
    console.log('📋 Current doctor name:', doctor.name);
    
    // Update name to include "Dr." prefix for consistency
    if (!doctor.name.startsWith('Dr.')) {
      doctor.name = `Dr. ${doctor.name}`;
      doctor.fullName = doctor.name;
      await doctor.save();
      console.log('✅ Updated doctor name to:', doctor.name);
    } else {
      console.log('✅ Doctor name already has "Dr." prefix');
    }
    
    console.log('\n✅ Update complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(() => {
    updateDoctorName();
  });
}

module.exports = { updateDoctorName };

