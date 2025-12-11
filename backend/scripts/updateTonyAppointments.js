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

const updateAppointments = async () => {
  try {
    // Get Dr. Ebuka Tony's User ID
    const doctorUser = await User.findOne({ email: 'tony@gmail.com' });
    if (!doctorUser) {
      console.log('❌ Doctor user not found!');
      return;
    }
    
    console.log(`\n🔍 Doctor: ${doctorUser.name} (User ID: ${doctorUser._id})\n`);
    
    // Find appointments for Dr. Ebuka Tony
    const tonyAppointments = await Appointment.find({
      doctorName: { $regex: /Tony|Ebuka/i }
    }).lean();
    
    console.log(`📊 Found ${tonyAppointments.length} appointments for Dr. Ebuka Tony\n`);
    
    let updated = 0;
    for (const apt of tonyAppointments) {
      console.log(`🔧 Updating appointment: ${apt._id}`);
      console.log(`   - Current doctorId: ${apt.doctorId}`);
      console.log(`   - Doctor Name: ${apt.doctorName}`);
      
      // Update to use User ID
      await Appointment.updateOne(
        { _id: apt._id },
        { $set: { doctorId: doctorUser._id } }
      );
      
      console.log(`   ✅ Updated doctorId to: ${doctorUser._id}`);
      updated++;
      console.log('');
    }
    
    console.log(`\n✅ Updated ${updated} appointments`);
    
    // Verify
    const verifyAppointments = await Appointment.find({
      doctorId: doctorUser._id
    }).lean();
    
    console.log(`\n📋 Verified: ${verifyAppointments.length} appointments now have correct doctorId`);
    verifyAppointments.forEach(apt => {
      console.log(`   - ${apt._id}: ${apt.doctorName} - ${apt.status} - ${new Date(apt.appointmentDate).toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(() => {
    updateAppointments();
  });
}

module.exports = { updateAppointments };


