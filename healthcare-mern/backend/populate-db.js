const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Vital = require('./models/Vital');
const Medication = require('./models/Medication');
const Appointment = require('./models/Appointment');

async function populateDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data (optional)
    console.log('\n🧹 Clearing existing data...');
    await User.deleteMany({});
    await Vital.deleteMany({});
    await Medication.deleteMany({});
    await Appointment.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('\n👥 Creating users...');
    const users = [
      {
        name: 'Madu Damian',
        email: 'madudamian25@gmail.com',
        password: await bcrypt.hash('Godofjustice@001', 10),
        phone: '+1234567890',
        role: 'patient'
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@healthcare.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1234567891',
        role: 'doctor'
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@healthcare.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1234567892',
        role: 'doctor'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create vitals for the patient
    console.log('\n💓 Creating vital readings...');
    const patient = createdUsers.find(u => u.email === 'madudamian25@gmail.com');
    const vitals = [
      {
        userId: patient._id,
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        notes: 'Normal reading',
        recordedAt: new Date()
      },
      {
        userId: patient._id,
        type: 'heart_rate',
        value: '72',
        unit: 'bpm',
        notes: 'Resting heart rate',
        recordedAt: new Date(Date.now() - 86400000)
      },
      {
        userId: patient._id,
        type: 'temperature',
        value: '98.6',
        unit: '°F',
        notes: 'Normal body temperature',
        recordedAt: new Date(Date.now() - 172800000)
      },
      {
        userId: patient._id,
        type: 'weight',
        value: '70',
        unit: 'kg',
        notes: 'Morning weight',
        recordedAt: new Date(Date.now() - 259200000)
      }
    ];

    await Vital.insertMany(vitals);
    console.log(`✅ Created ${vitals.length} vital readings`);

    // Create medications
    console.log('\n💊 Creating medications...');
    const medications = [
      {
        userId: patient._id,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: new Date(),
        notes: 'For blood pressure management'
      },
      {
        userId: patient._id,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: new Date(),
        notes: 'For diabetes management'
      },
      {
        userId: patient._id,
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        startDate: new Date(),
        notes: 'Low dose aspirin for heart health'
      }
    ];

    await Medication.insertMany(medications);
    console.log(`✅ Created ${medications.length} medications`);

    // Create appointments
    console.log('\n📅 Creating appointments...');
    const appointments = [
      {
        userId: patient._id,
        doctorId: createdUsers.find(u => u.email === 'sarah.johnson@healthcare.com')._id,
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: '10:00 AM',
        type: 'consultation',
        status: 'scheduled',
        notes: 'Follow-up appointment'
      },
      {
        userId: patient._id,
        doctorId: createdUsers.find(u => u.email === 'michael.chen@healthcare.com')._id,
        date: new Date(Date.now() + 172800000), // Day after tomorrow
        time: '2:30 PM',
        type: 'checkup',
        status: 'scheduled',
        notes: 'Regular checkup'
      }
    ];

    await Appointment.insertMany(appointments);
    console.log(`✅ Created ${appointments.length} appointments`);

    // Display summary
    console.log('\n📊 Database Population Summary:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`💓 Vitals: ${await Vital.countDocuments()}`);
    console.log(`💊 Medications: ${await Medication.countDocuments()}`);
    console.log(`📅 Appointments: ${await Appointment.countDocuments()}`);

    console.log('\n🎉 Database populated successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Patient: madudamian25@gmail.com / Godofjustice@001');
    console.log('Doctor: sarah.johnson@healthcare.com / password123');
    console.log('Doctor: michael.chen@healthcare.com / password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
populateDatabase();
