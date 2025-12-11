const mongoose = require('mongoose');
require('dotenv').config();

// Import all models to ensure they're registered
require('../models/User');
require('../models/Appointment');
require('../models/Chat');
require('../models/VideoCallSession');
require('../models/PhoneCallLog');
require('../models/FileAttachment');
require('../models/Prescription');
require('../models/Notification');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in .env file');
    }
    
    // Extract database name from URI or use default
    const dbNameMatch = process.env.MONGODB_URI.match(/\.net\/([^?]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'healthify_tracker';
    
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: dbName,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}\n`);
    
    return mongoose.connection.db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const verifyCollections = async () => {
  try {
    const db = await connectDB();
    
    console.log('🔍 Verifying collections exist in database...\n');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Required collections for Consultation Room features
    const requiredCollections = [
      'users',
      'appointments',
      'chats',
      'videocallsessions',
      'phonecalllogs',
      'fileattachments',
      'prescriptions',
      'notifications'
    ];
    
    console.log('📋 Collections found in database:');
    collectionNames.forEach(name => {
      console.log(`   ✓ ${name}`);
    });
    
    console.log('\n✅ Required collections status:');
    
    let allExist = true;
    requiredCollections.forEach(required => {
      const exists = collectionNames.includes(required);
      const status = exists ? '✅ EXISTS' : '❌ MISSING';
      console.log(`   ${status} - ${required}`);
      if (!exists) allExist = false;
    });
    
    // Count documents in each collection
    console.log('\n📊 Document counts:');
    for (const collectionName of requiredCollections) {
      if (collectionNames.includes(collectionName)) {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`   ${collectionName}: ${count} documents`);
      }
    }
    
    // Verify specific collections mentioned by user
    console.log('\n🎯 User-requested collections verification:');
    const userRequested = {
      'phonecalls': 'phonecalllogs',
      'videocalls': 'videocallsessions',
      'live chats': 'chats'
    };
    
    for (const [userTerm, actualName] of Object.entries(userRequested)) {
      const exists = collectionNames.includes(actualName);
      const count = exists ? await db.collection(actualName).countDocuments() : 0;
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${userTerm} (${actualName}): ${count} documents`);
    }
    
    if (allExist) {
      console.log('\n✅ All required collections exist in the database!');
    } else {
      console.log('\n⚠️  Some collections are missing. Run the seed script to create them.');
    }
    
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

verifyCollections();

