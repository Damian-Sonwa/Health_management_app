const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      keepAlive: true,
      keepAliveInitialDelay: 300000
    });
    console.log("✅ MongoDB Atlas connected successfully");

    mongoose.connection.on("connected", () => {
      console.log("🟢 MongoDB reconnected");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔴 MongoDB disconnected, retrying...");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
    });
  } catch (err) {
    console.error("❌ Initial MongoDB connection error:", err.message);
    setTimeout(connectDB, 5000);
  }
}

connectDB();

setInterval(() => {
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.db.admin().ping()
      .then(() => console.log("✅ MongoDB Atlas pinged"))
      .catch(err => console.error("❌ Ping failed:", err.message));
  }
}, 600000);

module.exports = { connectDB, mongoose };