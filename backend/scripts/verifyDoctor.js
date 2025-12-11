const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const verifyDoctor = async () => {
  try {
    const email = 'tony@gmail.com';
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔍 Verifying doctor entry...\n');
    
    // Check User
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      console.log('✅ User found:');
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Specialty: ${user.specialty}`);
      console.log(`   isActive: ${user.isActive}`);
    } else {
      console.log('❌ User not found!');
      return;
    }
    
    // Check Doctor
    let doctor = await Doctor.findOne({ email: normalizedEmail });
    if (!doctor) {
      console.log('\n⚠️  Doctor model entry not found!');
      console.log('   Creating Doctor entry...');
      
      doctor = new Doctor({
        name: user.name,
        fullName: user.name,
        specialty: user.specialty || 'General Practice',
        specialization: user.specialty || 'General Practice',
        userId: user._id,
        email: normalizedEmail,
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 5,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimes: ['09:00-17:00']
      });
      
      await doctor.save();
      console.log('✅ Doctor entry created!');
    } else {
      console.log('\n✅ Doctor entry found:');
      console.log(`   ID: ${doctor._id}`);
      console.log(`   Name: ${doctor.name}`);
      console.log(`   Email: ${doctor.email}`);
      console.log(`   Specialty: ${doctor.specialty}`);
      console.log(`   isActive: ${doctor.isActive}`);
      console.log(`   available: ${doctor.available}`);
      console.log(`   isAvailable: ${doctor.isAvailable}`);
      console.log(`   userId: ${doctor.userId}`);
      
      // Update if needed
      let updated = false;
      if (doctor.userId?.toString() !== user._id.toString()) {
        doctor.userId = user._id;
        updated = true;
      }
      if (doctor.isActive !== true) {
        doctor.isActive = true;
        updated = true;
      }
      if (doctor.available !== true) {
        doctor.available = true;
        updated = true;
      }
      if (doctor.isAvailable !== true) {
        doctor.isAvailable = true;
        updated = true;
      }
      if (doctor.name !== user.name) {
        doctor.name = user.name;
        doctor.fullName = user.name;
        updated = true;
      }
      
      if (updated) {
        await doctor.save();
        console.log('\n✅ Doctor entry updated!');
      }
    }
    
    // Verify it appears in available doctors query
    console.log('\n🔍 Testing available doctors query...');
    const availableDoctors = await Doctor.find({
      $or: [
        { isActive: true, available: { $ne: false } },
        { isActive: true, isAvailable: { $ne: false } },
        { isActive: true }
      ]
    })
    .select('_id name specialty email isActive available isAvailable')
    .sort({ name: 1 })
    .lean();
    
    console.log(`📋 Found ${availableDoctors.length} available doctors`);
    const foundDoctor = availableDoctors.find(d => d.email === normalizedEmail);
    if (foundDoctor) {
      console.log('✅ Doctor appears in available doctors list!');
      console.log(`   Name: ${foundDoctor.name}`);
      console.log(`   Specialty: ${foundDoctor.specialty}`);
    } else {
      console.log('❌ Doctor does NOT appear in available doctors list!');
      console.log('   This is the problem - the query is not matching the doctor.');
    }
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(() => {
    verifyDoctor();
  });
}

module.exports = { verifyDoctor };

