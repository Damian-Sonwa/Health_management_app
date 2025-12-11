const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Import User model
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Connect to MongoDB
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

// Create doctor user
const createDoctor = async () => {
  try {
    console.log('🔄 Creating doctor user...\n');

    const email = 'tony@gmail.com';
    const password = 'tony123';
    const name = 'Ebuka Tony';
    const role = 'doctor';
    const specialty = 'General Practice';

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      console.log(`⚠️  User already exists: ${email}`);
      console.log(`   Updating to doctor role...`);
      
      // Update existing user
      user.role = role;
      user.name = name;
      user.specialty = specialty;
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.markModified('password');
      
      await user.save();
      console.log(`✅ Updated user: ${email} to doctor role`);
      console.log(`   Password updated`);
    } else {
      console.log(`   Creating new doctor user...`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Generate unique anonymousId - ensure it's truly unique
      let anonymousId = `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Check if anonymousId already exists, generate new one if needed
      let existingUserWithId = await User.findOne({ anonymousId: anonymousId });
      let attempts = 0;
      while (existingUserWithId && attempts < 10) {
        anonymousId = `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        existingUserWithId = await User.findOne({ anonymousId: anonymousId });
        attempts++;
      }
      
      // Create new user
      try {
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
      } catch (saveError) {
        // If still fails, try to find and update existing user with null anonymousId
        if (saveError.code === 11000 && saveError.keyPattern?.anonymousId) {
          console.log(`   Found duplicate anonymousId, trying to update existing null user...`);
          const nullUser = await User.findOne({ anonymousId: null });
          if (nullUser) {
            nullUser.anonymousId = anonymousId;
            nullUser.email = normalizedEmail;
            nullUser.name = name;
            nullUser.password = hashedPassword;
            nullUser.role = role;
            nullUser.specialty = specialty;
            nullUser.isActive = true;
            await nullUser.save();
            console.log(`✅ Updated existing user with null anonymousId: ${email}`);
            user = nullUser;
          } else {
            throw saveError;
          }
        } else {
          throw saveError;
        }
      }
    }

    // Create or update Doctor model entry
    try {
      let doctor = await Doctor.findOne({ email: normalizedEmail });
      
      if (doctor) {
        // Update existing doctor - ensure all fields match seeded structure
        doctor.name = name.startsWith('Dr.') ? name : `Dr. ${name}`;
        doctor.fullName = name.startsWith('Dr.') ? name : `Dr. ${name}`;
        doctor.specialty = specialty;
        doctor.specialization = specialty; // Ensure both are set
        doctor.userId = user._id;
        doctor.email = normalizedEmail;
        doctor.hospital = doctor.hospital || `${specialty} Clinic`;
        doctor.contact = doctor.contact || user.phone || '+1-555-0000';
        doctor.phoneNumber = doctor.phoneNumber || user.phone || '+1-555-0000';
        doctor.isActive = true;
        doctor.available = true;
        doctor.isAvailable = true;
        doctor.chatAvailable = true;
        doctor.rating = doctor.rating || 4.5; // Add rating if missing
        doctor.consultationFee = doctor.consultationFee || 100; // Add fee if missing
        if (!doctor.availableDays || doctor.availableDays.length === 0) {
          doctor.availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        }
        if (!doctor.availableTimes || doctor.availableTimes.length === 0) {
          doctor.availableTimes = ['09:00-17:00'];
        }
        await doctor.save();
        console.log(`✅ Updated Doctor model entry: ${doctor.name}`);
      } else {
        // Create new doctor entry - match structure of seeded doctors
        const newDoctor = new Doctor({
          name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
          fullName: name.startsWith('Dr.') ? name : `Dr. ${name}`,
          specialty: specialty,
          specialization: specialty, // Ensure both specialty and specialization are set
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
          rating: 4.5, // Add rating like other doctors
          consultationFee: 100, // Add consultation fee
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTimes: ['09:00-17:00'],
          profileImage: null // Explicitly set
        });
        
        await newDoctor.save();
        console.log(`✅ Created Doctor model entry: ${newDoctor.name}`);
      }
    } catch (doctorError) {
      console.log(`   ℹ️  Doctor model entry creation skipped: ${doctorError.message}`);
    }

    console.log('\n✅ Doctor user setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ${role}`);
    console.log(`   Name:     ${name}`);
    console.log(`   Specialty: ${specialty}`);
    console.log(`   User ID:  ${user._id}`);

  } catch (error) {
    console.error('❌ Failed to create doctor:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if executed directly
if (require.main === module) {
  connectDB().then(() => {
    createDoctor();
  });
}

module.exports = { createDoctor };

