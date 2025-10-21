require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('\n🔍 Comprehensive Email Search:\n');
    
    // Search for emails (case-insensitive)
    const search1 = await User.find({ email: /soma/i });
    const search2 = await User.find({ email: /richmany/i });
    const search3 = await User.find({ email: /chisom/i });
    const search4 = await User.find({ email: /joseph/i });
    
    console.log('Search "soma": ', search1.length > 0 ? `✅ Found ${search1.length}` : '❌ Not found');
    if (search1.length > 0) search1.forEach(u => console.log(`   ${u.name} (${u.email})`));
    
    console.log('\nSearch "richmany": ', search2.length > 0 ? `✅ Found ${search2.length}` : '❌ Not found');
    if (search2.length > 0) search2.forEach(u => console.log(`   ${u.name} (${u.email})`));
    
    console.log('\nSearch "chisom": ', search3.length > 0 ? `✅ Found ${search3.length}` : '❌ Not found');
    if (search3.length > 0) search3.forEach(u => console.log(`   ${u.name} (${u.email})`));
    
    console.log('\nSearch "joseph": ', search4.length > 0 ? `✅ Found ${search4.length}` : '❌ Not found');
    if (search4.length > 0) search4.forEach(u => console.log(`   ${u.name} (${u.email})`));
    
    console.log('\n📊 Database Stats:');
    console.log(`   Total users: ${await User.countDocuments()}`);
    
    // Get last 5 created
    const latest = await User.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('\n📅 Last 5 users created:');
    latest.forEach((u, i) => {
      console.log(`   ${i+1}. ${u.name} (${u.email}) - ${u.createdAt}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

