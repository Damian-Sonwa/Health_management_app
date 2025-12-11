const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const fixDoctorEntry = async () => {
  try {
    const email = 'tony@gmail.com';
    const normalizedEmail = email.toLowerCase().trim();
    
    // Get user first
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('🔍 Finding doctor entry...');
    let doctor = await Doctor.findOne({ email: normalizedEmail });
    
    if (!doctor) {
      console.log('⚠️  Doctor entry not found, creating new one...');
      doctor = new Doctor({});
    }
    
    // Update to match seeded doctors structure exactly
    doctor.name = 'Dr. Ebuka Tony';
    doctor.fullName = 'Dr. Ebuka Tony';
    doctor.specialty = 'General Practice';
    doctor.specialization = 'General Practice'; // Ensure both are set
    doctor.email = normalizedEmail;
    doctor.userId = user._id;
    doctor.hospital = 'General Practice Clinic';
    doctor.contact = user.phone || '+1-555-0000';
    doctor.phoneNumber = user.phone || '+1-555-0000';
    doctor.isActive = true;
    doctor.available = true;
    doctor.isAvailable = true;
    doctor.chatAvailable = true;
    doctor.experience = 5;
    doctor.rating = 4.5; // Add rating like other doctors
    doctor.consultationFee = 100; // Add consultation fee
    doctor.availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    doctor.availableTimes = ['09:00-17:00'];
    doctor.profileImage = null; // Explicitly set
    
    await doctor.save();
    console.log('✅ Doctor entry updated/created successfully!');
    console.log('\n📋 Doctor details:');
    console.log(`   Name: ${doctor.name}`);
    console.log(`   Specialty: ${doctor.specialty}`);
    console.log(`   Specialization: ${doctor.specialization}`);
    console.log(`   Email: ${doctor.email}`);
    console.log(`   isActive: ${doctor.isActive}`);
    console.log(`   available: ${doctor.available}`);
    console.log(`   isAvailable: ${doctor.isAvailable}`);
    console.log(`   Rating: ${doctor.rating}`);
    console.log(`   Consultation Fee: ${doctor.consultationFee}`);
    
    // Verify it appears in the query
    console.log('\n🔍 Verifying doctor appears in available query...');
    const availableDoctors = await Doctor.find({
      $or: [
        { isActive: true, available: { $ne: false } },
        { isActive: true, isAvailable: { $ne: false } },
        { isActive: true }
      ]
    })
    .select('_id name specialty email isActive available')
    .sort({ name: 1 })
    .lean();
    
    const found = availableDoctors.find(d => d.email === normalizedEmail);
    if (found) {
      console.log(`✅ Doctor found in query! Position: ${availableDoctors.findIndex(d => d.email === normalizedEmail) + 1} of ${availableDoctors.length}`);
    } else {
      console.log('❌ Doctor NOT found in query!');
    }
    
    console.log('\n✅ Fix complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(() => {
    fixDoctorEntry();
  });
}

module.exports = { fixDoctorEntry };

