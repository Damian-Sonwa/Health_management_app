const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function copyPasswordsToHealthify() {
  try {
    console.log('🔄 Copying working passwords from TEST to HEALTHIFY_TRACKER...\n');
    
    // Get all users from TEST with their passwords
    console.log('📊 Reading from TEST database...');
    await mongoose.connect('mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
    const testUsers = mongoose.connection.db.collection('users');
    const users = await testUsers.find({}).toArray();
    console.log(`   ✅ Found ${users.length} users\n`);
    await mongoose.disconnect();
    
    // Update all users in HEALTHIFY_TRACKER
    console.log('📊 Updating HEALTHIFY_TRACKER database...');
    await mongoose.connect('mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/healthify_tracker?retryWrites=true&w=majority&appName=Cluster0');
    const healthifyUsers = mongoose.connection.db.collection('users');
    
    let updated = 0;
    let notFound = 0;
    
    for (const user of users) {
      const result = await healthifyUsers.updateOne(
        { email: user.email },
        { $set: { password: user.password } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`   ✅ ${user.email}`);
        updated++;
      } else {
        console.log(`   ⚠️  ${user.email} - not found in healthify_tracker`);
        notFound++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Updated: ${updated} users`);
    console.log(`   ⚠️  Not found: ${notFound} users`);
    console.log('='.repeat(60));
    
    // Verify
    console.log('\n🔍 Verifying madudamian25@gmail.com...');
    const testUser = await healthifyUsers.findOne({ email: 'madudamian25@gmail.com' });
    if (testUser) {
      const isValid = await bcrypt.compare('Godofjustice@001', testUser.password);
      console.log(`   Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    await mongoose.disconnect();
    
    console.log('\n✅ All passwords copied successfully!');
    console.log('\n💡 Next step: You can now safely delete the TEST database');
    console.log('   Your backend will use HEALTHIFY_TRACKER with all working passwords.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

copyPasswordsToHealthify();
