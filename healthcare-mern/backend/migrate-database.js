const mongoose = require('mongoose');
require('dotenv').config();

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Connect to MongoDB without specifying a database
    const baseUri = 'mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(baseUri);
    console.log('✅ Connected to MongoDB Atlas');
    
    const client = mongoose.connection.getClient();
    const testDb = client.db('test');
    const healthifyDb = client.db('healthify_tracker');
    
    console.log('\n📊 Migrating data from "test" to "healthify_tracker"...');
    
    // Get all collections from test database
    const collections = await testDb.listCollections().toArray();
    console.log(`\n📁 Found ${collections.length} collections to migrate:`);
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n  📦 Migrating "${collectionName}" collection...`);
      
      const sourceCollection = testDb.collection(collectionName);
      const targetCollection = healthifyDb.collection(collectionName);
      
      // Get all documents from source
      const documents = await sourceCollection.find({}).toArray();
      console.log(`     Found ${documents.length} documents`);
      
      if (documents.length > 0) {
        // Insert into target (only if not already there)
        const existingCount = await targetCollection.countDocuments();
        
        if (existingCount === 0) {
          await targetCollection.insertMany(documents);
          console.log(`     ✅ Migrated ${documents.length} documents`);
        } else {
          console.log(`     ⏭️  Collection already has ${existingCount} documents, skipping...`);
        }
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Verify the migration
    console.log('\n📋 Verification:');
    const healthifyCollections = await healthifyDb.listCollections().toArray();
    
    for (const collection of healthifyCollections) {
      const count = await healthifyDb.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }
    
    console.log('\n💡 Next steps:');
    console.log('  1. Restart your backend server to use the new database');
    console.log('  2. Your app will now use "healthify_tracker" instead of "test"');
    console.log('  3. All your users and data have been migrated!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migrateDatabase();
