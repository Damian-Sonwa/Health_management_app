/**
 * Script to check pharmacies in the database
 * 
 * Usage:
 *   MONGODB_URI="your-connection-string" node checkPharmacies.js
 *   OR
 *   node checkPharmacies.js (uses MONGODB_URI from .env)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required!');
  console.error('\nUsage:');
  console.error('  MONGODB_URI="your-connection-string" node checkPharmacies.js');
  process.exit(1);
}

// Show which database we're connecting to (without showing password)
const displayUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log('🔗 Connecting to:', displayUri);

async function checkPharmacies() {
  try {
    await mongoose.connect(MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', dbName);
    console.log('\n');

    // Check total pharmacies
    const totalPharmacies = await Pharmacy.countDocuments({});
    console.log(`📋 Total pharmacies in database: ${totalPharmacies}\n`);

    if (totalPharmacies === 0) {
      console.log('⚠️  No pharmacies found in database!');
      console.log('💡 Run the seed script: node backend/scripts/seedPharmaciesProduction.js\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Check by status
    const approvedCount = await Pharmacy.countDocuments({ status: 'approved' });
    const pendingCount = await Pharmacy.countDocuments({ status: 'pending' });
    const rejectedCount = await Pharmacy.countDocuments({ status: 'rejected' });
    
    console.log('📊 Pharmacies by status:');
    console.log(`   - Approved: ${approvedCount}`);
    console.log(`   - Pending: ${pendingCount}`);
    console.log(`   - Rejected: ${rejectedCount}\n`);

    // List all pharmacies
    const allPharmacies = await Pharmacy.find({})
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    console.log('📋 All pharmacies:');
    allPharmacies.forEach((pharmacy, index) => {
      console.log(`\n${index + 1}. ${pharmacy.pharmacyName}`);
      console.log(`   Status: ${pharmacy.status}`);
      console.log(`   User ID: ${pharmacy.userId?._id || pharmacy.userId || 'MISSING'}`);
      console.log(`   User Name: ${pharmacy.userId?.name || 'MISSING'}`);
      console.log(`   Email: ${pharmacy.userId?.email || 'MISSING'}`);
      console.log(`   Phone: ${pharmacy.phone || pharmacy.userId?.phone || 'MISSING'}`);
      console.log(`   Address: ${typeof pharmacy.address === 'object' 
        ? `${pharmacy.address.street || ''}, ${pharmacy.address.city || ''}, ${pharmacy.address.state || ''}`.trim()
        : pharmacy.address || 'N/A'}`);
    });

    // Check approved pharmacies specifically
    if (approvedCount > 0) {
      console.log('\n✅ Approved pharmacies (visible in Medication Request form):');
      const approvedPharmacies = await Pharmacy.find({ status: 'approved' })
        .populate('userId', 'name email phone')
        .lean();
      
      approvedPharmacies.forEach((pharmacy, index) => {
        console.log(`   ${index + 1}. ${pharmacy.pharmacyName} (${pharmacy.userId?.name || 'N/A'})`);
      });
    } else {
      console.log('\n⚠️  No approved pharmacies found!');
      console.log('💡 To approve pharmacies, you can:');
      console.log('   1. Run the seed script: node backend/scripts/seedPharmaciesProduction.js');
      console.log('   2. Or manually update status to "approved" in the database');
    }

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking pharmacies:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run check
if (require.main === module) {
  checkPharmacies();
}

module.exports = { checkPharmacies };


