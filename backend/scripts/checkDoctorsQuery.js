const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('../models/Doctor');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const checkQuery = async () => {
  try {
    // Exact query from server.js
    const query = {
      $or: [
        { isActive: true, available: { $ne: false } },
        { isActive: true, isAvailable: { $ne: false } },
        { isActive: true }
      ]
    };
    
    const doctors = await Doctor.find(query)
      .select('_id name email specialty profileImage isActive available')
      .sort({ name: 1 })
      .lean();
    
    console.log(`\n📋 Query found ${doctors.length} doctors:\n`);
    doctors.forEach((d, i) => {
      console.log(`${i + 1}. ${d.name} (${d.email || 'no email'})`);
      console.log(`   - specialty: ${d.specialty || 'none'}`);
      console.log(`   - isActive: ${d.isActive}`);
      console.log(`   - available: ${d.available}`);
    });
    
    // Check Tony specifically
    const tony = await Doctor.findOne({ email: 'tony@gmail.com' });
    if (tony) {
      console.log(`\n🔍 Tony doctor details:`);
      console.log(`   Name: ${tony.name}`);
      console.log(`   Email: ${tony.email}`);
      console.log(`   Specialty: ${tony.specialty}`);
      console.log(`   isActive: ${tony.isActive} (type: ${typeof tony.isActive})`);
      console.log(`   available: ${tony.available} (type: ${typeof tony.available})`);
      console.log(`   isAvailable: ${tony.isAvailable} (type: ${typeof tony.isAvailable})`);
      
      const inResults = doctors.find(d => d.email === 'tony@gmail.com');
      if (inResults) {
        console.log(`\n✅ Tony IS in query results!`);
      } else {
        console.log(`\n❌ Tony is NOT in query results!`);
        console.log(`\n   Testing individual conditions:`);
        const test1 = tony.isActive === true && tony.available !== false;
        const test2 = tony.isActive === true && tony.isAvailable !== false;
        const test3 = tony.isActive === true;
        console.log(`   - Condition 1 (isActive=true, available!=false): ${test1}`);
        console.log(`   - Condition 2 (isActive=true, isAvailable!=false): ${test2}`);
        console.log(`   - Condition 3 (isActive=true): ${test3}`);
        
        // Check if available field might be undefined
        if (tony.available === undefined) {
          console.log(`\n   ⚠️  available field is undefined! This might be the issue.`);
        }
      }
    } else {
      console.log(`\n❌ Tony doctor not found in database!`);
    }
    
    // Check all doctors to see which ones are missing
    const allDoctors = await Doctor.find({}).select('_id name email isActive available isAvailable').lean();
    console.log(`\n📊 Total doctors in database: ${allDoctors.length}`);
    const missing = allDoctors.filter(d => !doctors.find(r => r._id.toString() === d._id.toString()));
    if (missing.length > 0) {
      console.log(`\n⚠️  ${missing.length} doctors NOT in query results:`);
      missing.forEach(d => {
        console.log(`   - ${d.name} (${d.email})`);
        console.log(`     isActive: ${d.isActive}, available: ${d.available}, isAvailable: ${d.isAvailable}`);
      });
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
    checkQuery();
  });
}

module.exports = { checkQuery };

