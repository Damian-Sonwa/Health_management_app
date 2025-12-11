/**
 * Script to fix appointments that have missing or incorrect doctorId
 * 
 * This script will:
 * 1. Find appointments with missing doctorId
 * 2. Try to match them to doctors by doctorName
 * 3. Update the doctorId field to the doctor's User ID
 * 
 * Usage:
 *   MONGODB_URI="your-connection-string" node fixAppointmentDoctorIds.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required!');
  process.exit(1);
}

const displayUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log('🔗 Connecting to:', displayUri);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', dbName);
    console.log('\n⚠️  WARNING: This will modify the PRODUCTION database!\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const fixAppointments = async () => {
  try {
    // Find all appointments
    const allAppointments = await Appointment.find({}).lean();
    console.log(`📊 Total appointments in database: ${allAppointments.length}\n`);
    
    // Find appointments with missing or null doctorId
    const appointmentsNeedingFix = allAppointments.filter(apt => 
      !apt.doctorId || apt.doctorId === null
    );
    
    console.log(`🔍 Appointments with missing doctorId: ${appointmentsNeedingFix.length}\n`);
    
    if (appointmentsNeedingFix.length === 0) {
      console.log('✅ All appointments have doctorId set!');
      
      // Still check if doctorId matches correctly
      const doctorUser = await User.findOne({ email: 'tony@gmail.com' });
      if (doctorUser) {
        const doctorAppointments = await Appointment.find({ 
          doctorId: doctorUser._id 
        }).lean();
        console.log(`\n📋 Appointments for Dr. Ebuka Tony: ${doctorAppointments.length}`);
        if (doctorAppointments.length > 0) {
          console.log('\n✅ Doctor has appointments!');
          doctorAppointments.forEach(apt => {
            console.log(`   - ${apt.doctorName} - ${apt.appointmentDate} - ${apt.status}`);
          });
        }
      }
      return;
    }
    
    // Fix each appointment
    let fixed = 0;
    let failed = 0;
    
    for (const apt of appointmentsNeedingFix) {
      try {
        console.log(`\n🔧 Fixing appointment: ${apt._id}`);
        console.log(`   - Doctor Name: ${apt.doctorName}`);
        console.log(`   - Patient: ${apt.userId}`);
        console.log(`   - Status: ${apt.status}`);
        
        // Try to find doctor by name
        let doctor = null;
        if (apt.doctorName) {
          // Try exact match first
          doctor = await Doctor.findOne({ 
            name: apt.doctorName 
          });
          
          // Try with "Dr." prefix
          if (!doctor && apt.doctorName.includes('Dr.')) {
            doctor = await Doctor.findOne({ 
              name: apt.doctorName.replace('Dr.', '').trim() 
            });
          }
          
          // Try without "Dr." prefix
          if (!doctor && !apt.doctorName.includes('Dr.')) {
            doctor = await Doctor.findOne({ 
              name: `Dr. ${apt.doctorName}` 
            });
          }
          
          // Try partial match
          if (!doctor) {
            const nameParts = apt.doctorName.replace('Dr.', '').trim().split(' ');
            if (nameParts.length >= 2) {
              doctor = await Doctor.findOne({
                $or: [
                  { name: { $regex: nameParts[0], $options: 'i' } },
                  { name: { $regex: nameParts[nameParts.length - 1], $options: 'i' } }
                ]
              });
            }
          }
        }
        
        if (doctor && doctor.userId) {
          // Update appointment with doctor's User ID
          await Appointment.updateOne(
            { _id: apt._id },
            { $set: { doctorId: doctor.userId } }
          );
          console.log(`   ✅ Fixed! Set doctorId to: ${doctor.userId}`);
          fixed++;
        } else {
          console.log(`   ⚠️  Could not find matching doctor for: ${apt.doctorName}`);
          failed++;
        }
      } catch (error) {
        console.error(`   ❌ Error fixing appointment ${apt._id}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixed} appointments`);
    if (failed > 0) {
      console.log(`⚠️  Failed to fix ${failed} appointments`);
    }
    
    // Verify for Dr. Ebuka Tony
    const doctorUser = await User.findOne({ email: 'tony@gmail.com' });
    if (doctorUser) {
      const doctorAppointments = await Appointment.find({ 
        doctorId: doctorUser._id 
      }).lean();
      console.log(`\n📋 Appointments for Dr. Ebuka Tony after fix: ${doctorAppointments.length}`);
      if (doctorAppointments.length > 0) {
        doctorAppointments.forEach(apt => {
          console.log(`   - ${apt.doctorName} - ${new Date(apt.appointmentDate).toLocaleDateString()} - ${apt.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(() => {
    fixAppointments();
  });
}

module.exports = { fixAppointments };


