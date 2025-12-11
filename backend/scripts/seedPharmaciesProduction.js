/**
 * Script to seed pharmacies in PRODUCTION database for Medication Request
 * 
 * Usage:
 *   MONGODB_URI="your-production-connection-string" node seedPharmaciesProduction.js
 * 
 * This script creates approved pharmacies that will be visible in the Medication Request form
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required!');
  console.error('\nUsage:');
  console.error('  MONGODB_URI="your-connection-string" node seedPharmaciesProduction.js');
  process.exit(1);
}

// Show which database we're connecting to (without showing password)
const displayUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log('🔗 Connecting to:', displayUri);

// Sample pharmacy data - approved pharmacies for Medication Request
const samplePharmacies = [
  {
    name: 'ABC Pharmacy',
    email: 'abc@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0101',
    pharmacyName: 'ABC Pharmacy',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    licenseId: 'PH-ABC-001'
  },
  {
    name: 'XYZ Medical Supplies',
    email: 'xyz@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0102',
    pharmacyName: 'XYZ Medical Supplies',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    licenseId: 'PH-XYZ-002'
  },
  {
    name: 'Health Plus Pharmacy',
    email: 'healthplus@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0103',
    pharmacyName: 'Health Plus Pharmacy',
    address: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    licenseId: 'PH-HP-003'
  },
  {
    name: 'Care Pharmacy',
    email: 'care@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0104',
    pharmacyName: 'Care Pharmacy',
    address: {
      street: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    },
    licenseId: 'PH-CARE-004'
  },
  {
    name: 'MedExpress Pharmacy',
    email: 'medexpress@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0105',
    pharmacyName: 'MedExpress Pharmacy',
    address: {
      street: '654 Maple Drive',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    },
    licenseId: 'PH-ME-005'
  },
  {
    name: 'City Pharmacy',
    email: 'city@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0106',
    pharmacyName: 'City Pharmacy',
    address: {
      street: '987 Broadway',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    licenseId: 'PH-CITY-006'
  },
  {
    name: 'Wellness Pharmacy',
    email: 'wellness@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0107',
    pharmacyName: 'Wellness Pharmacy',
    address: {
      street: '147 Health Boulevard',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    licenseId: 'PH-WELL-007'
  },
  {
    name: 'Family Care Pharmacy',
    email: 'familycare@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0108',
    pharmacyName: 'Family Care Pharmacy',
    address: {
      street: '258 Care Street',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'USA'
    },
    licenseId: 'PH-FC-008'
  }
];

async function seedPharmacies() {
  try {
    await mongoose.connect(MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', dbName);
    console.log('\n⚠️  WARNING: This will modify the PRODUCTION database!\n');

    // Check existing pharmacies
    const existingCount = await Pharmacy.countDocuments();
    console.log(`📋 Found ${existingCount} existing pharmacies in database\n`);

    // Create or update pharmacies
    const createdPharmacies = [];
    for (const pharmacyData of samplePharmacies) {
      // Check if user already exists
      let user = await User.findOne({ email: pharmacyData.email.toLowerCase() });
      
      if (!user) {
        // Create new user
        const hashedPassword = await bcrypt.hash(pharmacyData.password, 12);
        
        // Generate unique anonymousId to avoid duplicate key errors
        const anonymousId = `pharmacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        user = new User({
          name: pharmacyData.name,
          email: pharmacyData.email.toLowerCase(),
          password: hashedPassword,
          phone: pharmacyData.phone,
          role: 'pharmacy',
          address: pharmacyData.address,
          anonymousId: anonymousId,
          isActive: true
        });
        await user.save();
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } else {
        // Update existing user to ensure it's a pharmacy
        user.role = 'pharmacy';
        user.phone = pharmacyData.phone;
        user.address = pharmacyData.address;
        if (!user.anonymousId) {
          user.anonymousId = `pharmacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        user.isActive = true;
        await user.save();
        console.log(`✅ Updated user: ${user.name} (${user.email})`);
      }

      // Create or update pharmacy record
      let pharmacy = await Pharmacy.findOne({ userId: user._id });
      
      if (!pharmacy) {
        pharmacy = new Pharmacy({
          userId: user._id,
          pharmacyName: pharmacyData.pharmacyName,
          address: pharmacyData.address,
          phone: pharmacyData.phone,
          licenseId: pharmacyData.licenseId,
          status: 'approved', // Auto-approved so they appear in Medication Request form
          approvedAt: new Date() // Set approval date
        });
        await pharmacy.save();
        console.log(`💊 Created pharmacy: ${pharmacy.pharmacyName} (Status: ${pharmacy.status})`);
      } else {
        // Update existing pharmacy to ensure it's approved
        pharmacy.pharmacyName = pharmacyData.pharmacyName;
        pharmacy.address = pharmacyData.address;
        pharmacy.phone = pharmacyData.phone;
        pharmacy.licenseId = pharmacyData.licenseId;
        pharmacy.status = 'approved'; // Ensure it's approved
        if (!pharmacy.approvedAt) {
          pharmacy.approvedAt = new Date();
        }
        await pharmacy.save();
        console.log(`💊 Updated pharmacy: ${pharmacy.pharmacyName} (Status: ${pharmacy.status})`);
      }
      
      createdPharmacies.push({ user, pharmacy });
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total Pharmacies: ${createdPharmacies.length}`);
    console.log(`   - All pharmacies are APPROVED and visible in Medication Request form`);
    console.log('\n🔑 Test Credentials (all pharmacies use same password):');
    console.log('   Email: abc@pharmacy.com');
    console.log('   Password: Pharmacy123');
    console.log('\n📝 Note: All pharmacies are auto-approved and will appear in the frontend.');
    
    // Verify pharmacies are queryable
    const approvedCount = await Pharmacy.countDocuments({ status: 'approved' });
    console.log(`\n✅ Verified: ${approvedCount} approved pharmacies in database`);
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    if (error.code === 11000) {
      console.error('⚠️  Duplicate key error - some pharmacies may already exist');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run seeding
if (require.main === module) {
  seedPharmacies();
}

module.exports = { seedPharmacies };


