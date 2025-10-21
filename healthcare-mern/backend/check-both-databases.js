const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function checkBothDatabases() {
  try {
    console.log('🔍 Checking both databases...\n');
    
    // Check TEST database
    console.log('📊 Checking TEST database:');
    await mongoose.connect('mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
    let User = mongoose.connection.db.collection('users');
    let testUsers = await User.countDocuments();
    let testUser = await User.findOne({ email: 'madudamian25@gmail.com' });
    let testPasswordValid = testUser ? await bcrypt.compare('Godofjustice@001', testUser.password) : false;
    console.log(`   👥 Users: ${testUsers}`);
    console.log(`   🔐 Password for madudamian25@gmail.com: ${testPasswordValid ? '✅ VALID' : '❌ INVALID'}\n`);
    await mongoose.disconnect();
    
    // Check HEALTHIFY_TRACKER database
    console.log('📊 Checking HEALTHIFY_TRACKER database:');
    await mongoose.connect('mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/healthify_tracker?retryWrites=true&w=majority&appName=Cluster0');
    User = mongoose.connection.db.collection('users');
    let healthifyUsers = await User.countDocuments();
    let healthifyUser = await User.findOne({ email: 'madudamian25@gmail.com' });
    let healthifyPasswordValid = healthifyUser ? await bcrypt.compare('Godofjustice@001', healthifyUser.password) : false;
    console.log(`   👥 Users: ${healthifyUsers}`);
    console.log(`   🔐 Password for madudamian25@gmail.com: ${healthifyPasswordValid ? '✅ VALID' : '❌ INVALID'}\n`);
    await mongoose.disconnect();
    
    console.log('=' .repeat(60));
    console.log('🎯 Summary:');
    console.log('   TEST database: ' + (testPasswordValid ? '✅ Has working passwords' : '❌ Needs password fix'));
    console.log('   HEALTHIFY_TRACKER database: ' + (healthifyPasswordValid ? '✅ Has working passwords' : '❌ Needs password fix'));
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBothDatabases();
