const mongoose = require('mongoose');
const uri = 'mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/healthify_tracker?retryWrites=true&w=majority&appName=Cluster0';

console.log('Attempting connection to MongoDB Atlas...');
console.log('URI:', uri.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log(' Connected successfully!');
  console.log('Database:', mongoose.connection.db.databaseName);
  mongoose.connection.close();
}).catch(err => {
  console.error(' Connection error:', err.message);
  console.error('Error code:', err.code);
  console.error('Error name:', err.name);
  process.exit(1);
});
