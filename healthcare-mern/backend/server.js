// -------------------- Imports --------------------
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Vital = require('./models/Vital');
const Medication = require('./models/Medication');
const Appointment = require('./models/Appointment');
const Device = require('./models/Device');
const MedicationRequest = require('./models/MedicationRequest');
const VitalReading = require('./models/VitalReading');

// -------------------- App Initialization --------------------
const app = express();

// -------------------- Middleware --------------------
// More permissive CORS for development
app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    const allowedOrigins = [
    "http://localhost:3000",   // React (Create React App)
    "http://localhost:5173",   // Vite frontend
      "http://127.0.0.1:5173",   // Alternative localhost
      "http://127.0.0.1:3000",   // Alternative localhost
      "http://localhost:5174",   // Alternative Vite port
      "http://127.0.0.1:5174"    // Alternative Vite port
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      // For development, let's be more permissive
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log('Allowing localhost origin for development:', origin);
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Cache-Control',
    'Pragma',
    'ngrok-skip-browser-warning'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// JSON Parsing
app.use(express.json());

// -------------------- MongoDB Connection --------------------
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// -------------------- JWT Configuration --------------------

// -------------------- JWT Middleware --------------------
const JWT_SECRET = process.env.JWT_SECRET || 'healthcare-secret-key-2025';
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// -------------------- Routes --------------------

// Public endpoints for testing and initial data
app.get('/api/public/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const vitalCount = await Vital.countDocuments();
    const medicationCount = await Medication.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    
    res.json({
      success: true,
      data: {
        users: userCount,
        vitals: vitalCount,
        medications: medicationCount,
        appointments: appointmentCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch stats: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Public users endpoint for testing
app.get('/api/public/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt').limit(10);
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch users: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Public vitals endpoint for testing
app.get('/api/public/vitals', async (req, res) => {
  try {
    const vitals = await Vital.find({}).populate('userId', 'name email').limit(20);
    res.json({
      success: true,
      data: vitals,
      count: vitals.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch vitals: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// MongoDB Connection Test
app.get('/api/mongodb/test', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB not connected. Connection state: ' + mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    }

    // Test MongoDB connection
    await mongoose.connection.db.admin().ping();
    
    // Get database stats
    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      success: true,
      message: 'MongoDB connection successful',
      database: mongoose.connection.db.databaseName,
      collections: collections.map(col => col.name),
      stats: {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `MongoDB connection failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Populate Database with Sample Data
app.post('/api/mongodb/populate', async (req, res) => {
  try {
    // Check if sample data already exists
    const existingUser = await User.findOne({ email: 'demo@healthcare.com' });
    if (existingUser) {
      return res.json({
        success: true,
        message: 'Sample data already exists',
        data: {
          users: await User.countDocuments(),
          vitals: await Vital.countDocuments(),
          medications: await Medication.countDocuments(),
          appointments: await Appointment.countDocuments()
        }
      });
    }

    // Create sample user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const sampleUser = new User({
      name: 'John Doe',
      email: 'demo@healthcare.com',
      password: hashedPassword,
      phone: '+1-555-0123',
      role: 'patient'
    });
    await sampleUser.save();

    // Create sample vitals
    const sampleVitals = [
      new Vital({
        userId: sampleUser._id,
        type: 'blood_pressure_systolic',
        value: 120,
        unit: 'mmHg',
        notes: 'Normal reading',
        recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }),
      new Vital({
        userId: sampleUser._id,
        type: 'blood_pressure_diastolic',
        value: 80,
        unit: 'mmHg',
        notes: 'Normal reading',
        recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }),
      new Vital({
        userId: sampleUser._id,
        type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        notes: 'Resting heart rate',
        recordedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }),
      new Vital({
        userId: sampleUser._id,
        type: 'weight',
        value: 175,
        unit: 'lbs',
        notes: 'Morning weight',
        recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      })
    ];
    await Vital.insertMany(sampleVitals);

    // Create sample medications
    const sampleMedications = [
      new Medication({
        userId: sampleUser._id,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        notes: 'Take with food'
      }),
      new Medication({
        userId: sampleUser._id,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        notes: 'Take with meals'
      })
    ];
    await Medication.insertMany(sampleMedications);

    // Create sample appointments
    const sampleAppointments = [
      new Appointment({
        userId: sampleUser._id,
        doctorName: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        type: 'Follow-up',
        status: 'confirmed',
        notes: 'Follow-up appointment for blood pressure management'
      }),
      new Appointment({
        userId: sampleUser._id,
        doctorName: 'Dr. Michael Chen',
        specialty: 'Internal Medicine',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: '2:15 PM',
        type: 'Consultation',
        status: 'confirmed',
        notes: 'Annual check-up'
      })
    ];
    await Appointment.insertMany(sampleAppointments);

    res.json({
      success: true,
      message: 'Database populated with sample data successfully',
      data: {
        users: await User.countDocuments(),
        vitals: await Vital.countDocuments(),
        medications: await Medication.countDocuments(),
        appointments: await Appointment.countDocuments()
      },
      sampleUser: {
        email: 'demo@healthcare.com',
        password: 'demo123'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to populate database: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Auth - Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ success: true, token, user: { id: user._id, name, email, phone, role: user.role } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Auth - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) return res.status(400).json({ success: false, message: 'Invalid email or password' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) return res.status(400).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    console.log('Token generated successfully');
    
    res.json({ success: true, token, user: { id: user._id, name: user.name, email, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Get Current User (for auth verification)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// User Profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Password (for testing purposes)
app.post('/api/auth/update-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user's password directly in the database to bypass pre-save hook
    await User.updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ success: false, message: 'Server error during password update' });
  }
});

// Vitals
app.get('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const vitals = await Vital.find({ userId: req.user.userId }).sort({ recordedAt: -1 });
    res.json({ success: true, data: vitals });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const { type, value, unit, notes } = req.body;
    const vital = new Vital({ userId: req.user.userId, type, value, unit, notes });
    await vital.save();
    res.status(201).json({ success: true, data: vital });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Medications
app.get('/api/medications', authenticateToken, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: medications });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

app.post('/api/medications', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, frequency, startDate, endDate, notes } = req.body;
    const medication = new Medication({ userId: req.user.userId, name, dosage, frequency, startDate, endDate, notes });
    await medication.save();
    res.status(201).json({ success: true, data: medication });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const vitalsCount = await Vital.countDocuments({ userId: req.user.userId });
    const medicationsCount = await Medication.countDocuments({ userId: req.user.userId, isActive: true });
    const recentVitals = await Vital.find({ userId: req.user.userId }).sort({ recordedAt: -1 }).limit(5);
    res.json({ success: true, data: { vitalsCount, medicationsCount, recentVitals } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// -------------------- Error Handling --------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`🚀 Healthcare API server running on port ${PORT}`);
});

module.exports = app;
