/**
 * Script to seed doctors in PRODUCTION database
 * 
 * Usage:
 *   MONGODB_URI="your-production-connection-string" node seedDoctorsProduction.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required!');
  console.error('\nUsage:');
  console.error('  MONGODB_URI="your-connection-string" node seedDoctorsProduction.js');
  process.exit(1);
}

// Show which database we're connecting to (without showing password)
const displayUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log('🔗 Connecting to:', displayUri);

async function seedDoctors() {
  try {
    await mongoose.connect(MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', dbName);
    console.log('\n⚠️  WARNING: This will modify the PRODUCTION database!\n');

    // Check existing doctors
    const existingCount = await Doctor.countDocuments();
    console.log(`📋 Found ${existingCount} existing doctors in database\n`);

    // Sample doctors data
    const sampleDoctors = [
      {
        name: 'Dr. Ada Lovelace',
        fullName: 'Dr. Ada Lovelace',
        specialty: 'Cardiology',
        specialization: 'Cardiology',
        email: 'ada@example.com',
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 15,
        rating: 4.9,
        consultationFee: 200,
        hospital: 'Tech Medical Center',
        phoneNumber: '+1-555-0201',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTimes: ['09:00-12:00', '14:00-17:00']
      },
      {
        name: 'Dr. John Doe',
        fullName: 'Dr. John Doe',
        specialty: 'Neurology',
        specialization: 'Neurology',
        email: 'john@example.com',
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 12,
        rating: 4.8,
        consultationFee: 250,
        hospital: 'Brain Health Institute',
        phoneNumber: '+1-555-0202',
        availableDays: ['Tuesday', 'Thursday'],
        availableTimes: ['10:00-13:00', '14:00-18:00']
      },
      {
        name: 'Dr. Grace Hopper',
        fullName: 'Dr. Grace Hopper',
        specialty: 'Pediatrics',
        specialization: 'Pediatrics',
        email: 'grace@example.com',
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 18,
        rating: 4.9,
        consultationFee: 180,
        hospital: 'Children\'s Care Hospital',
        phoneNumber: '+1-555-0203',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimes: ['08:00-17:00']
      },
      {
        name: 'Dr. Sarah Johnson',
        fullName: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        hospital: 'City General Hospital',
        contact: '+1-555-0101',
        email: 'sarah.johnson@hospital.com',
        phoneNumber: '+1-555-0101',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTimes: ['09:00-12:00', '14:00-17:00'],
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 10,
        rating: 4.8,
        consultationFee: 150,
        profileImage: null
      },
      {
        name: 'Dr. Michael Chen',
        specialty: 'Pediatrics',
        hospital: 'Children\'s Medical Center',
        contact: '+1-555-0102',
        email: 'michael.chen@hospital.com',
        phoneNumber: '+1-555-0102',
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        availableTimes: ['10:00-13:00', '15:00-18:00'],
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 8,
        rating: 4.9,
        consultationFee: 120,
        profileImage: null
      },
      {
        name: 'Dr. Emily Rodriguez',
        specialty: 'Dermatology',
        hospital: 'Skin Care Clinic',
        contact: '+1-555-0103',
        email: 'emily.rodriguez@hospital.com',
        phoneNumber: '+1-555-0103',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimes: ['08:00-17:00'],
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 12,
        rating: 4.7,
        consultationFee: 180,
        profileImage: null
      },
      {
        name: 'Dr. James Wilson',
        specialty: 'Orthopedics',
        hospital: 'Bone & Joint Center',
        contact: '+1-555-0104',
        email: 'james.wilson@hospital.com',
        phoneNumber: '+1-555-0104',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTimes: ['08:00-12:00', '13:00-17:00'],
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 15,
        rating: 4.9,
        consultationFee: 200,
        profileImage: null
      },
      {
        name: 'Dr. Lisa Anderson',
        specialty: 'Neurology',
        hospital: 'Brain & Spine Institute',
        contact: '+1-555-0105',
        email: 'lisa.anderson@hospital.com',
        phoneNumber: '+1-555-0105',
        availableDays: ['Tuesday', 'Thursday'],
        availableTimes: ['09:00-13:00', '14:00-18:00'],
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 18,
        rating: 4.8,
        consultationFee: 250,
        profileImage: null
      },
      {
        name: 'Dr. Robert Martinez',
        specialty: 'General Practice',
        hospital: 'Family Health Clinic',
        contact: '+1-555-0106',
        email: 'robert.martinez@hospital.com',
        phoneNumber: '+1-555-0106',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimes: ['08:00-17:00'],
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 20,
        rating: 4.6,
        consultationFee: 100,
        profileImage: null
      },
      {
        name: 'Dr. Jennifer Lee',
        specialty: 'Psychiatry',
        hospital: 'Mental Health Center',
        contact: '+1-555-0107',
        email: 'jennifer.lee@hospital.com',
        phoneNumber: '+1-555-0107',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTimes: ['10:00-14:00', '15:00-19:00'],
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 14,
        rating: 4.9,
        consultationFee: 220,
        profileImage: null
      },
      {
        name: 'Dr. David Thompson',
        specialty: 'Oncology',
        hospital: 'Cancer Treatment Center',
        contact: '+1-555-0108',
        email: 'david.thompson@hospital.com',
        phoneNumber: '+1-555-0108',
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        availableTimes: ['09:00-13:00'],
        isActive: true,
        available: true,
        isAvailable: true,
        chatAvailable: true,
        experience: 22,
        rating: 5.0,
        consultationFee: 300,
        profileImage: null
      }
    ];

    // Insert or update doctors
    const insertedDoctors = [];
    for (const doctorData of sampleDoctors) {
      // Check if doctor already exists
      let existingDoctor = await Doctor.findOne({ email: doctorData.email });
      
      if (existingDoctor) {
        // Update existing doctor
        Object.assign(existingDoctor, doctorData);
        if (!existingDoctor.specialization) {
          existingDoctor.specialization = existingDoctor.specialty;
        }
        if (!existingDoctor.fullName) {
          existingDoctor.fullName = existingDoctor.name;
        }
        await existingDoctor.save();
        insertedDoctors.push(existingDoctor);
        console.log(`   ✅ Updated: ${existingDoctor.name} (${existingDoctor.specialty})`);
      } else {
        // Create new doctor
        const doctor = new Doctor({
          ...doctorData,
          specialization: doctorData.specialization || doctorData.specialty,
          fullName: doctorData.fullName || doctorData.name
        });
        await doctor.save();
        insertedDoctors.push(doctor);
        console.log(`   ✅ Created: ${doctor.name} (${doctor.specialty})`);
      }
    }
    
    console.log(`\n✅ Successfully processed ${insertedDoctors.length} doctors`);
    
    // Verify count
    const finalCount = await Doctor.countDocuments();
    console.log(`📊 Total doctors in database now: ${finalCount}`);
    
    // Verify available query
    const availableCount = await Doctor.find({
      $or: [
        { isActive: true, available: { $ne: false } },
        { isActive: true, isAvailable: { $ne: false } },
        { isActive: true }
      ]
    }).countDocuments();
    
    console.log(`📋 Available doctors (matching query): ${availableCount}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDoctors();
}

module.exports = seedDoctors;


