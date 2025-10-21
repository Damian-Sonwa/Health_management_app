const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/healthify_tracker?retryWrites=true&w=majority")
.then(() => {
  console.log(" Connected to MongoDB Atlas!");
  console.log("Database:", mongoose.connection.db.databaseName);
  mongoose.connection.close();
  process.exit(0);
})
.catch(err => {
  console.error(" Connection Failed:", err.message);
  process.exit(1);
});
