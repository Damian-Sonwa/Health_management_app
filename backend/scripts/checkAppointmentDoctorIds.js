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

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const checkAppointments = async () => {
  try {
    // Get Dr. Ebuka Tony's User ID
    const doctorUser = await User.findOne({ email: 'tony@gmail.com' });
    if (!doctorUser) {
      console.log('❌ Doctor user not found!');
      return;
    }
    
    console.log(`\n🔍 Doctor: ${doctorUser.name} (${doctorUser._id})\n`);
    
    // Get all appointments
    const allAppointments = await Appointment.find({})
      .select('_id doctorId doctorName userId patientId status appointmentDate')
      .lean();
    
    console.log(`📊 Total appointments: ${allAppointments.length}\n`);
    
    allAppointments.forEach((apt, i) => {
      console.log(`${i + 1}. Appointment ${apt._id}`);
      console.log(`   - Doctor Name: ${apt.doctorName || 'N/A'}`);
      console.log(`   - doctorId: ${apt.doctorId || 'NULL'}`);
      console.log(`   - doctorId type: ${apt.doctorId ? typeof apt.doctorId : 'N/A'}`);
      console.log(`   - doctorId string: ${apt.doctorId ? apt.doctorId.toString() : 'N/A'}`);
      console.log(`   - Patient userId: ${apt.userId || 'N/A'}`);
      console.log(`   - Status: ${apt.status || 'N/A'}`);
      
      // Check if it matches
      if (apt.doctorId) {
        const matches = apt.doctorId.toString() === doctorUser._id.toString();
        console.log(`   - Matches Dr. Ebuka Tony: ${matches ? 'YES ✅' : 'NO ❌'}`);
        
        if (!matches && apt.doctorName && apt.doctorName.includes('Tony')) {
          console.log(`   ⚠️  This appointment is for Tony but doctorId doesn't match!`);
          console.log(`   Expected: ${doctorUser._id}`);
          console.log(`   Got: ${apt.doctorId}`);
        }
      } else {
        console.log(`   - Matches Dr. Ebuka Tony: NO ❌ (doctorId is null)`);
      }
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
      console.log(`\n🔍 Doctor query includes:`);
      console.log(`   - doctorId = ${doctorUser._id} (User ID)`);
      console.log(`   - doctorId = ${doctorRecord._id} (Doctor model ID)`);
    } else {
      query = { doctorId: doctorUser._id };
      console.log(`\n🔍 Doctor query: doctorId = ${doctorUser._id}`);
    }
    
    const matchingAppointments = await Appointment.find(query).lean();
    console.log(`\n📋 Appointments matching query: ${matchingAppointments.length}`);
    
    if (matchingAppointments.length === 0 && allAppointments.length > 0) {
      console.log('\n⚠️  PROBLEM: Appointments exist but none match the doctor query!');
      console.log('\n💡 Solution: Update appointments to use correct doctorId');
      
      // Find appointments that should be for this doctor
      const tonyAppointments = allAppointments.filter(apt => 
        apt.doctorName && (
          apt.doctorName.includes('Tony') || 
          apt.doctorName.includes('Ebuka') ||
          apt.doctorName === 'Dr. Ebuka Tony'
        )
      );
      
      if (tonyAppointments.length > 0) {
        console.log(`\n📋 Found ${tonyAppointments.length} appointments that should be for Dr. Ebuka Tony:`);
        tonyAppointments.forEach(apt => {
          console.log(`   - ${apt._id}: doctorId=${apt.doctorId}, doctorName=${apt.doctorName}`);
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
    checkAppointments();
  });
}

module.exports = { checkAppointments };


