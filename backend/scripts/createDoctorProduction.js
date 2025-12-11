/**
 * Script to create doctor in production database
 * 
 * Usage:
 *   MONGODB_URI="your-production-connection-string" node createDoctorProduction.js
 * 
 * Or set in .env file and run:
 *   node createDoctorProduction.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Doctor = require('../models/Doctor');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is required!');
    console.error('\nUsage:');
    console.error('  MONGODB_URI="your-connection-string" node createDoctorProduction.js');
    console.error('\nOr set it in your .env file');
    process.exit(1);
  }
  
  // Show which database we're connecting to (without showing password)
  const dbName = mongoUri.match(/\/\/([^:]+):[^@]+@[^/]+\/([^?]+)/);
  const displayUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  console.log('🔗 Connecting to:', displayUri);
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', dbName);
    return dbName;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const createDoctor = async () => {
  try {
    console.log('\n🔄 Creating doctor user in PRODUCTION database...\n');
    console.log('⚠️  WARNING: This will modify the PRODUCTION database!');
    console.log('   Make sure MONGODB_URI points to production.\n');

    const email = 'tony@gmail.com';
    const password = 'tony123';
    const name = 'Ebuka Tony';
    const role = 'doctor';
    const specialty = 'General Practice';

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      console.log(`⚠️  User already exists: ${email}`);
      console.log(`   Updating to doctor role...`);
      
      user.role = role;
      user.name = name;
      user.specialty = specialty;
      
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.markModified('password');
      
      if (!user.anonymousId) {
        user.anonymousId = `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      await user.save();
      console.log(`✅ Updated user: ${email} to doctor role`);
    } else {
      console.log(`   Creating new doctor user...`);
      
      const hashedPassword = await bcrypt.hash(password, 12);
      const anonymousId = `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser = new User({
        name: name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role,
        specialty: specialty,
        isActive: true,
        anonymousId: anonymousId
      });
      
      await newUser.save();
      console.log(`✅ Created doctor user: ${email}`);
      user = newUser;
    }

    // Create or update Doctor model entry
    let doctor = await Doctor.findOne({ email: normalizedEmail });
    
    if (doctor) {
      console.log(`⚠️  Doctor entry already exists, updating...`);
      doctor.name = `Dr. ${name}`;
      doctor.fullName = `Dr. ${name}`;
      doctor.specialty = specialty;
      doctor.specialization = specialty;
      doctor.userId = user._id;
      doctor.email = normalizedEmail;
      doctor.hospital = `${specialty} Clinic`;
      doctor.contact = user.phone || '+1-555-0000';
      doctor.phoneNumber = user.phone || '+1-555-0000';
      doctor.isActive = true;
      doctor.available = true;
      doctor.isAvailable = true;
      doctor.chatAvailable = true;
      doctor.rating = doctor.rating || 4.5;
      doctor.consultationFee = doctor.consultationFee || 100;
      if (!doctor.availableDays || doctor.availableDays.length === 0) {
        doctor.availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      }
      if (!doctor.availableTimes || doctor.availableTimes.length === 0) {
        doctor.availableTimes = ['09:00-17:00'];
      }
      await doctor.save();
      console.log(`✅ Updated Doctor model entry: ${doctor.name}`);
    } else {
      const newDoctor = new Doctor({
        name: `Dr. ${name}`,
        fullName: `Dr. ${name}`,
        specialty: specialty,
        specialization: specialty,
        userId: user._id,
        email: normalizedEmail,
        hospital: `${specialty} Clinic`,
        contact: user.phone || '+1-555-0000',
        phoneNumber: user.phone || '+1-555-0000',
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 5,
        rating: 4.5,
        consultationFee: 100,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimes: ['09:00-17:00'],
        profileImage: null
      });
      
      await newDoctor.save();
      console.log(`✅ Created Doctor model entry: ${newDoctor.name}`);
    }

    // Verify
    const verifyDoctor = await Doctor.findOne({ email: normalizedEmail });
    const verifyUser = await User.findOne({ email: normalizedEmail });
    
    console.log('\n✅ Doctor user setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ${role}`);
    console.log(`   Name:     ${verifyUser.name}`);
    console.log(`   Specialty: ${verifyUser.specialty}`);
    console.log(`   User ID:  ${verifyUser._id}`);
    console.log(`   Doctor ID: ${verifyDoctor._id}`);
    
    // Test query
    const availableDoctors = await Doctor.find({
      $or: [
        { isActive: true, available: { $ne: false } },
        { isActive: true, isAvailable: { $ne: false } },
        { isActive: true }
      ]
    }).countDocuments();
    
    console.log(`\n📊 Total available doctors in database: ${availableDoctors}`);
    const tonyInList = await Doctor.findOne({ 
      email: normalizedEmail,
      isActive: true,
      available: { $ne: false }
    });
    
    if (tonyInList) {
      console.log('✅ Doctor appears in available doctors query!');
    } else {
      console.log('⚠️  Doctor might not appear in available doctors query');
    }

  } catch (error) {
    console.error('❌ Failed to create doctor:', error);
    if (error.code === 11000) {
      console.error('\n💡 Duplicate key error - doctor or user might already exist');
      console.error('   Try running the script again - it will update existing entries');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(() => {
    createDoctor();
  });
}

module.exports = { createDoctor };

