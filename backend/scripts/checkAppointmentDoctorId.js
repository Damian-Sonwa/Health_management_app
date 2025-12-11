const mongoose = require('mongoose');
require('dotenv').config();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const checkAppointments = async () => {
  try {
    const doctorEmail = 'tony@gmail.com';
    const doctorUser = await User.findOne({ email: doctorEmail });
    
    if (!doctorUser) {
      console.log('❌ Doctor user not found!');
      return;
    }
    
    console.log(`\n🔍 Checking appointments for doctor: ${doctorUser.name} (${doctorUser._id})\n`);
    
    // Get all appointments
    const allAppointments = await Appointment.find({})
      .select('_id doctorId doctorName userId patientId status appointmentDate')
      .lean();
    
    console.log(`📊 Total appointments in database: ${allAppointments.length}\n`);
    
    allAppointments.forEach((apt, i) => {
      console.log(`${i + 1}. Appointment ${apt._id}`);
      console.log(`   - doctorId: ${apt.doctorId || 'NULL/MISSING'}`);
      console.log(`   - doctorName: ${apt.doctorName || 'N/A'}`);
      console.log(`   - userId (patient): ${apt.userId || 'N/A'}`);
      console.log(`   - patientId: ${apt.patientId || 'N/A'}`);
      console.log(`   - status: ${apt.status || 'N/A'}`);
      console.log(`   - date: ${apt.appointmentDate || 'N/A'}`);
      
      // Check if this should match the doctor
      const matchesDoctor = apt.doctorId && apt.doctorId.toString() === doctorUser._id.toString();
      console.log(`   - Matches doctor query: ${matchesDoctor ? 'YES ✅' : 'NO ❌'}`);
      console.log('');
    });
    
    // Check doctor query
    const doctorRecord = await Doctor.findOne({ userId: doctorUser._id });
    let query = {};
    
    if (doctorRecord) {
      query = { 
        $or: [
          { doctorId: doctorUser._id },
          { doctorId: doctorRecord._id }
        ]
      };
    } else {
      query = { doctorId: doctorUser._id };
    }
    
    console.log(`\n🔍 Query for doctor:`, JSON.stringify(query, null, 2));
    
    const doctorAppointments = await Appointment.find(query).lean();
    console.log(`\n📋 Appointments matching doctor query: ${doctorAppointments.length}`);
    
    if (doctorAppointments.length === 0 && allAppointments.length > 0) {
      console.log('\n⚠️  PROBLEM FOUND:');
      console.log('   There are appointments in the database, but none match the doctor query!');
      console.log('   This means appointments were created without doctorId set correctly.');
      console.log('\n💡 Solution:');
      console.log('   Update existing appointments to set doctorId to the doctor\'s User ID');
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
    checkAppointments();
  });
}

module.exports = { checkAppointments };


