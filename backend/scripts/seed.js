const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@healthcare.com',
    password: 'password123',
    phone: '+1-555-0101',
    role: 'admin',
    profile: {
      dateOfBirth: new Date('1985-03-15'),
      gender: 'female',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Shellfish'],
      emergencyContact: {
        name: 'Michael Johnson',
        phone: '+1-555-0102',
        relationship: 'Spouse'
      },
      profilePicture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400'
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  },
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    password: 'password123',
    phone: '+1-555-0201',
    profile: {
      dateOfBirth: new Date('1978-11-22'),
      gender: 'male',
      bloodType: 'A-',
      allergies: ['Latex'],
      emergencyContact: {
        name: 'Emma Smith',
        phone: '+1-555-0202',
        relationship: 'Wife'
      },
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
    },
    subscription: {
      plan: 'free',
      status: 'trial',
      trialEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    }
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    password: 'password123',
    phone: '+1-555-0301',
    profile: {
      dateOfBirth: new Date('1992-07-08'),
      gender: 'female',
      bloodType: 'B+',
      allergies: ['Nuts', 'Dairy'],
      emergencyContact: {
        name: 'Carlos Garcia',
        phone: '+1-555-0302',
        relationship: 'Brother'
      },
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
    },
    subscription: {
      plan: 'family',
      status: 'active',
      trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  },
  {
    name: 'Test Admin User',
    email: 'admin.test@healthapp.com',
    password: 'TestPassword123!',
    phone: '+1-555-0401',
    role: 'admin',
    profile: {
      dateOfBirth: new Date('1990-01-15'),
      gender: 'male',
      bloodType: 'O+',
      allergies: [],
      emergencyContact: {
        name: 'Test Contact',
        phone: '+1-555-0402',
        relationship: 'Sibling'
      },
      profilePicture: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400'
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  }
];

// Create Vitals Schema
const vitalsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['blood_pressure', 'heart_rate', 'temperature', 'weight', 'glucose']
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  systolic: Number, // for blood pressure
  diastolic: Number, // for blood pressure
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Medications Schema
const medicationsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  instructions: String,
  prescriptionFile: String,
  paymentReceipt: String,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Appointments Schema
const appointmentsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Devices Schema
const devicesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceType: {
    type: String,
    required: true,
    enum: ['blood_pressure_monitor', 'glucose_meter', 'thermometer', 'scale', 'fitness_tracker']
  },
  deviceName: String,
  reading: {
    value: Number,
    unit: String,
    additional: mongoose.Schema.Types.Mixed
  },
  batteryLevel: Number,
  lastSync: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Vitals = mongoose.model('Vitals', vitalsSchema);
const Medications = mongoose.model('Medications', medicationsSchema);
const Appointments = mongoose.model('Appointments', appointmentsSchema);
const Devices = mongoose.model('Devices', devicesSchema);

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Vitals.deleteMany({});
    await Medications.deleteMany({});
    await Appointments.deleteMany({});
    await Devices.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      users.push(user);
      console.log(`👤 Created user: ${user.name}`);
    }

    // Create vitals for each user
    const vitalsData = [];
    users.forEach(user => {
      // Blood pressure readings
      vitalsData.push({
        userId: user._id,
        type: 'blood_pressure',
        value: 120,
        unit: 'mmHg',
        systolic: 120,
        diastolic: 80,
        notes: 'Normal reading',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      });
      
      vitalsData.push({
        userId: user._id,
        type: 'blood_pressure',
        value: 118,
        unit: 'mmHg',
        systolic: 118,
        diastolic: 78,
        notes: 'Morning reading',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      });

      // Heart rate
      vitalsData.push({
        userId: user._id,
        type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        notes: 'Resting heart rate',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      });

      // Temperature
      vitalsData.push({
        userId: user._id,
        type: 'temperature',
        value: 98.6,
        unit: '°F',
        notes: 'Normal body temperature',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      });

      // Weight
      vitalsData.push({
        userId: user._id,
        type: 'weight',
        value: user.profile.gender === 'male' ? 175 : 140,
        unit: 'lbs',
        notes: 'Weekly weigh-in',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      });
    });

    await Vitals.insertMany(vitalsData);
    console.log(`📊 Created ${vitalsData.length} vital readings`);

    // Create medications for each user
    const medicationsData = [];
    users.forEach(user => {
      medicationsData.push({
        userId: user._id,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        instructions: 'Take with food in the morning',
        prescriptionFile: 'prescription_001.pdf',
        paymentReceipt: 'receipt_001.pdf',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        status: 'delivered',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      });

      medicationsData.push({
        userId: user._id,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        instructions: 'Take with meals',
        prescriptionFile: 'prescription_002.pdf',
        paymentReceipt: 'receipt_002.pdf',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        status: 'shipped',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      });
    });

    await Medications.insertMany(medicationsData);
    console.log(`💊 Created ${medicationsData.length} medication records`);

    // Create appointments for each user
    const appointmentsData = [];
    users.forEach(user => {
      appointmentsData.push({
        userId: user._id,
        doctorName: 'Dr. Emily Wilson',
        appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        appointmentTime: '10:00 AM',
        reason: 'Annual checkup',
        notes: 'Routine physical examination',
        status: 'scheduled',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      });

      appointmentsData.push({
        userId: user._id,
        doctorName: 'Dr. Robert Chen',
        appointmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        appointmentTime: '2:30 PM',
        reason: 'Follow-up consultation',
        notes: 'Review test results',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      });
    });

    await Appointments.insertMany(appointmentsData);
    console.log(`📅 Created ${appointmentsData.length} appointments`);

    // Create device readings for each user
    const devicesData = [];
    users.forEach(user => {
      devicesData.push({
        userId: user._id,
        deviceType: 'blood_pressure_monitor',
        deviceName: 'Omron BP742N',
        reading: {
          value: 120,
          unit: 'mmHg',
          additional: { systolic: 120, diastolic: 80 }
        },
        batteryLevel: 85,
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      });

      devicesData.push({
        userId: user._id,
        deviceType: 'glucose_meter',
        deviceName: 'Accu-Chek Guide',
        reading: {
          value: 95,
          unit: 'mg/dL',
          additional: { testTime: 'fasting' }
        },
        batteryLevel: 92,
        lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      });

      devicesData.push({
        userId: user._id,
        deviceType: 'fitness_tracker',
        deviceName: 'Fitbit Charge 5',
        reading: {
          value: 8500,
          unit: 'steps',
          additional: { heartRate: 72, calories: 2150 }
        },
        batteryLevel: 68,
        lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      });
    });

    await Devices.insertMany(devicesData);
    console.log(`📱 Created ${devicesData.length} device readings`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📊 Vitals: ${vitalsData.length}`);
    console.log(`💊 Medications: ${medicationsData.length}`);
    console.log(`📅 Appointments: ${appointmentsData.length}`);
    console.log(`📱 Devices: ${devicesData.length}`);

    // Display sample login credentials
    console.log('\n🔐 Sample Login Credentials:');
    users.forEach(user => {
      console.log(`Email: ${user.email} | Password: password123`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase };