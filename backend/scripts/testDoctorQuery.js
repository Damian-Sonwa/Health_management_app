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

const testQuery = async () => {
  try {
    const query = {
      $or: [
        { isActive: true, available: { $ne: false } },
        { isActive: true, isAvailable: { $ne: false } },
        { isActive: true }
      ]
    };
    
    const doctors = await Doctor.find(query)
      .select('_id name specialty profileImage isActive available email')
      .sort({ name: 1 })
      .lean();
    
    console.log(`\n📋 Query found ${doctors.length} doctors:`);
    doctors.forEach(d => {
      console.log(`   - ${d.name} (${d.email || 'no email'}) - Active: ${d.isActive}, Available: ${d.available}`);
    });
    
    const tony = doctors.find(d => d.name === 'Ebuka Tony' || d.email === 'tony@gmail.com');
    if (tony) {
      console.log(`\n✅ Ebuka Tony FOUND in query results!`);
      console.log(`   ID: ${tony._id}`);
      console.log(`   Name: ${tony.name}`);
      console.log(`   Email: ${tony.email}`);
    } else {
      console.log(`\n❌ Ebuka Tony NOT FOUND in query results!`);
      console.log(`   This is the problem - the query is not matching the doctor.`);
      
      // Check why
      const tonyDoc = await Doctor.findOne({ email: 'tony@gmail.com' });
      if (tonyDoc) {
        console.log(`\n   Doctor exists with:`);
        console.log(`   - isActive: ${tonyDoc.isActive} (type: ${typeof tonyDoc.isActive})`);
        console.log(`   - available: ${tonyDoc.available} (type: ${typeof tonyDoc.available})`);
        console.log(`   - isAvailable: ${tonyDoc.isAvailable} (type: ${typeof tonyDoc.isAvailable})`);
        
        // Test individual conditions
        const test1 = tonyDoc.isActive === true && tonyDoc.available !== false;
        const test2 = tonyDoc.isActive === true && tonyDoc.isAvailable !== false;
        const test3 = tonyDoc.isActive === true;
        console.log(`\n   Query condition tests:`);
        console.log(`   - Condition 1 (isActive=true, available!=false): ${test1}`);
        console.log(`   - Condition 2 (isActive=true, isAvailable!=false): ${test2}`);
        console.log(`   - Condition 3 (isActive=true): ${test3}`);
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
    testQuery();
  });
}

module.exports = { testQuery };

