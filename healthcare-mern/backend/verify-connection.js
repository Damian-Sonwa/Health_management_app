require('dotenv').config();
const mongoose = require('mongoose');

async function verifyConnection() {
  try {
    console.log('\n🔍 VERIFYING DATABASE CONNECTION:\n');
    
    // Check .env
    console.log('📄 Environment Variables:');
    console.log(`   MONGODB_URI exists: ${!!process.env.MONGODB_URI ? '✅' : '❌'}`);
    
    // Extract database name from URI
    const uri = process.env.MONGODB_URI;
    const dbMatch = uri.match(/\.net\/([^?]+)/);
    const dbName = dbMatch ? dbMatch[1] : 'unknown';
    
    console.log(`\n🗄️  Database Name from URI: "${dbName}"`);
    
    if (dbName !== 'healthify_tracker') {
      console.log('   ⚠️  WARNING: Expected "healthify_tracker" but got:', dbName);
    } else {
      console.log('   ✅ Correct database: healthify_tracker');
    }
    
    // Connect (force healthify_tracker database)
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: 'healthify_tracker' });
    console.log('✅ Connected successfully!\n');
    
    // Verify actual database
    const actualDb = mongoose.connection.db.databaseName;
    console.log(`📊 Actually connected to: "${actualDb}"`);
    
    if (actualDb === 'healthify_tracker') {
      console.log('✅ CONFIRMED: Connected to healthify_tracker\n');
    } else {
      console.log('❌ ERROR: Not connected to healthify_tracker!\n');
    }
    
    // Check if users exist
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`👥 Total users in ${actualDb}: ${userCount}\n`);
    
    // Get latest 3 users
    const latest = await User.find({}).sort({ createdAt: -1 }).limit(3).select('name email createdAt');
    console.log('📋 Latest 3 users:');
    latest.forEach((u, i) => {
      console.log(`   ${i+1}. ${u.name} (${u.email})`);
      console.log(`      Created: ${u.createdAt}\n`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyConnection();

