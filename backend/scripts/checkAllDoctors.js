const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('../models/Doctor');

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

const checkAllDoctors = async () => {
  try {
    // Get all doctors
    const allDoctors = await Doctor.find({})
      .select('_id name email specialty isActive available isAvailable')
      .sort({ name: 1 })
      .lean();
    
    console.log(`\n📊 Total doctors in database: ${allDoctors.length}\n`);
    
    // Check query that's used in the API
    const query = {
      $or: [
        { isActive: true, available: { $ne: false } },
        { isActive: true, isAvailable: { $ne: false } },
        { isActive: true }
      ]
    };
    
    const availableDoctors = await Doctor.find(query)
      .select('_id name email specialty isActive available isAvailable')
      .sort({ name: 1 })
      .lean();
    
    console.log(`📋 Doctors matching available query: ${availableDoctors.length}\n`);
    
    availableDoctors.forEach((d, i) => {
      console.log(`${i + 1}. ${d.name} (${d.email || 'no email'})`);
      console.log(`   - Specialty: ${d.specialty || 'none'}`);
      console.log(`   - isActive: ${d.isActive}`);
      console.log(`   - available: ${d.available}`);
      console.log(`   - isAvailable: ${d.isAvailable}`);
    });
    
    // Check which doctors are missing
    const missing = allDoctors.filter(d => 
      !availableDoctors.find(r => r._id.toString() === d._id.toString())
    );
    
    if (missing.length > 0) {
      console.log(`\n⚠️  ${missing.length} doctors NOT in available query:\n`);
      missing.forEach(d => {
        console.log(`   - ${d.name} (${d.email})`);
        console.log(`     isActive: ${d.isActive}, available: ${d.available}, isAvailable: ${d.isAvailable}`);
        
        // Check why they're not matching
        const reason = [];
        if (d.isActive !== true) reason.push(`isActive=${d.isActive}`);
        if (d.available === false) reason.push(`available=false`);
        if (d.isAvailable === false) reason.push(`isAvailable=false`);
        if (d.isActive === undefined) reason.push(`isActive=undefined`);
        if (d.available === undefined) reason.push(`available=undefined`);
        
        console.log(`     Reason: ${reason.join(', ') || 'Unknown'}`);
      });
    }
    
    // Check Tony specifically
    const tony = await Doctor.findOne({ email: 'tony@gmail.com' });
    if (tony) {
      console.log(`\n🔍 Tony doctor status:`);
      console.log(`   Name: ${tony.name}`);
      console.log(`   isActive: ${tony.isActive}`);
      console.log(`   available: ${tony.available}`);
      console.log(`   isAvailable: ${tony.isAvailable}`);
      const tonyInList = availableDoctors.find(d => d.email === 'tony@gmail.com');
      console.log(`   In available list: ${tonyInList ? 'YES ✅' : 'NO ❌'}`);
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
    checkAllDoctors();
  });
}

module.exports = { checkAllDoctors };


