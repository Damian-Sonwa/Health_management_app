const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Notification = require('./models/Notification');
const Medication = require('./models/Medication');
const Appointment = require('./models/Appointment');

const MONGODB_URI = process.env.MONGODB_URI;

// Notification templates
const createNotifications = async (userId) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const notifications = [
    {
      userId,
      type: 'vital_check',
      title: 'Daily Vital Check Reminder',
      message: 'It\'s time to record your daily vitals. Monitor your blood pressure and heart rate.',
      priority: 'high',
      scheduledFor: new Date(now.setHours(8, 0, 0, 0)),
      icon: 'Activity'
    },
    {
      userId,
      type: 'medication_reminder',
      title: 'Medication Reminder',
      message: 'Don\'t forget to take your morning medication.',
      priority: 'high',
      scheduledFor: new Date(now.setHours(9, 0, 0, 0)),
      icon: 'Pill'
    },
    {
      userId,
      type: 'goal_reminder',
      title: 'Daily Health Goal',
      message: '30 minutes of walking can improve your cardiovascular health. Start now!',
      priority: 'medium',
      scheduledFor: new Date(now.setHours(14, 0, 0, 0)),
      icon: 'Target'
    },
    {
      userId,
      type: 'appointment_reminder',
      title: 'Upcoming Appointment',
      message: 'You have a doctor\'s appointment tomorrow. Please be prepared.',
      priority: 'urgent',
      scheduledFor: tomorrow,
      icon: 'Calendar'
    },
    {
      userId,
      type: 'system',
      title: 'Welcome to HealthTracker Pro',
      message: 'Your health dashboard is ready! Start tracking your vitals and medications.',
      priority: 'low',
      scheduledFor: now,
      icon: 'CheckCircle'
    },
    {
      userId,
      type: 'vital_check',
      title: 'Evening Vital Check',
      message: 'Record your evening vitals to track your daily progress.',
      priority: 'medium',
      scheduledFor: new Date(now.setHours(20, 0, 0, 0)),
      icon: 'Heart'
    }
  ];
  
  return notifications;
};

async function seedNotifications() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'healthify_tracker'
    });
    
    const actualDb = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: ${actualDb}`);
    
    if (actualDb !== 'healthify_tracker') {
      console.error(`❌ Wrong database! Connected to "${actualDb}" instead of "healthify_tracker"`);
      process.exit(1);
    }
    
    // Get all users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('⚠️ No users found. Please create users first.');
      process.exit(0);
    }
    
    let totalNotificationsCreated = 0;
    
    for (const user of users) {
      console.log(`\n👤 Creating notifications for: ${user.name} (${user.email})`);
      
      // Check if user already has notifications
      const existingNotifications = await Notification.countDocuments({ userId: user._id });
      
      if (existingNotifications > 0) {
        console.log(`   ℹ️ User already has ${existingNotifications} notifications. Skipping...`);
        continue;
      }
      
      // Create notifications
      const notificationsToCreate = await createNotifications(user._id);
      
      for (const notifData of notificationsToCreate) {
        const notification = new Notification(notifData);
        await notification.save();
        totalNotificationsCreated++;
      }
      
      console.log(`   ✅ Created ${notificationsToCreate.length} notifications`);
    }
    
    console.log(`\n✨ SEED COMPLETE!`);
    console.log(`   📬 Total notifications created: ${totalNotificationsCreated}`);
    console.log(`   👥 Users with notifications: ${users.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    process.exit(1);
  }
}

seedNotifications();

