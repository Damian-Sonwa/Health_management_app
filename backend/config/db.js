const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  try {
    console.log("🔄 Attempting to connect to MongoDB Atlas...");
    console.log("Connection URI:", process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    console.log("🌐 Expected IP: 102.88.54.198/32");
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log("MongoDB Atlas connected successfully");
    console.log("Database:", mongoose.connection.db.databaseName);
    console.log("🔗 Connection state:", mongoose.connection.readyState);

    mongoose.connection.on("connected", () => {
      console.log("MongoDB reconnected");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected, retrying...");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err.message);
    });
  } catch (err) {
    console.error("Initial MongoDB connection error:", err.message);
    console.error("Error details:", err);
    console.log("Make sure IP address 102.88.54.198/32 is whitelisted in MongoDB Atlas");
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
}

connectDB();

setInterval(() => {
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.db.admin().ping()
      .then(() => console.log("MongoDB Atlas pinged"))
      .catch(err => console.error("Ping failed:", err.message));
  }
}, 600000);

module.exports = { connectDB, mongoose };
