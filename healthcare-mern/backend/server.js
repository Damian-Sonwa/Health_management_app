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

// ==================== HEALTH CHECK & INFO ====================
// Server Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Healthcare API Server',
    version: '1.0.0',
    status: 'running',
    baseUrl: '/api',
    documentation: 'Access /api for available endpoints'
  });
});

// API Root - Health Check
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Healthcare API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      authentication: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
      users: ['GET /api/users', 'GET /api/users/profile', 'PUT /api/users/profile'],
      vitals: ['GET /api/vitals', 'POST /api/vitals', 'PUT /api/vitals/:id', 'DELETE /api/vitals/:id'],
      medications: ['GET /api/medications', 'POST /api/medications', 'PUT /api/medications/:id', 'DELETE /api/medications/:id'],
      appointments: ['GET /api/appointments', 'POST /api/appointments', 'PUT /api/appointments/:id', 'DELETE /api/appointments/:id'],
      devices: ['GET /api/devices', 'POST /api/devices', 'PUT /api/devices/:id', 'DELETE /api/devices/:id']
    },
    documentation: 'See POSTMAN_ENDPOINTS.md for detailed API documentation'
  });
});

// ==================== AUTHENTICATION ====================
// Auth - Register
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('\n=== REGISTRATION REQUEST ===');
    console.log('Body:', req.body);
    
    const { name, email, password, phone } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user (password will be hashed by pre-save hook)
    const user = new User({ name, email, password, phone });
    await user.save();
    
    console.log('✅ User created:', user.name);

    // Generate token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ 
      success: true, 
      token, 
      user: { id: user._id, name, email, phone, role: user.role },
      message: 'User registered successfully'
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
});

// Auth - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('\n=== LOGIN REQUEST ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? `Yes (${user.name})` : 'No');
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    console.log('Testing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    console.log('✅ Login successful for:', email);
    
    res.json({ success: true, token, user: { id: user._id, name: user.name, email, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error('❌ Login error:', err);
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

// ==================== USERS ENDPOINTS ====================
// Get current user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users (admin or for testing)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
    res.json({ success: true, users, count: users.length });
  } catch (err) {
    console.error('GET users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, profile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, profile, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('UPDATE user error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset Password (public endpoint for fixing password issues)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update password (will be hashed by the pre-save hook)
    user.password = newPassword;
    await user.save();
    
    console.log(`Password reset successful for ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Password updated successfully. You can now login with your new password.' 
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
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

// ==================== VITALS CRUD ====================
// GET all vitals for user
app.get('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const vitals = await Vital.find({ userId: req.user.userId }).sort({ recordedAt: -1 });
    res.json({ success: true, vitals, count: vitals.length });
  } catch (err) { 
    console.error('GET vitals error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// GET single vital by ID
app.get('/api/vitals/:id', authenticateToken, async (req, res) => {
  try {
    const vital = await Vital.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!vital) {
      return res.status(404).json({ success: false, message: 'Vital not found' });
    }
    res.json({ success: true, vital });
  } catch (err) { 
    console.error('GET vital by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// CREATE new vital
app.post('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const { type, value, unit, notes } = req.body;
    const vital = new Vital({ userId: req.user.userId, type, value, unit, notes });
    await vital.save();
    res.status(201).json({ success: true, vital, message: 'Vital created successfully' });
  } catch (err) { 
    console.error('POST vital error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// UPDATE vital by ID
app.put('/api/vitals/:id', authenticateToken, async (req, res) => {
  try {
    const { type, value, unit, notes } = req.body;
    const vital = await Vital.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { type, value, unit, notes, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!vital) {
      return res.status(404).json({ success: false, message: 'Vital not found' });
    }
    res.json({ success: true, vital, message: 'Vital updated successfully' });
  } catch (err) { 
    console.error('PUT vital error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// DELETE vital by ID
app.delete('/api/vitals/:id', authenticateToken, async (req, res) => {
  try {
    const vital = await Vital.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!vital) {
      return res.status(404).json({ success: false, message: 'Vital not found' });
    }
    res.json({ success: true, message: 'Vital deleted successfully' });
  } catch (err) { 
    console.error('DELETE vital error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// ==================== MEDICATIONS CRUD ====================
// GET all medications for user
app.get('/api/medications', authenticateToken, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, medications, count: medications.length });
  } catch (err) { 
    console.error('GET medications error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// GET single medication by ID
app.get('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    const medication = await Medication.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    res.json({ success: true, medication });
  } catch (err) { 
    console.error('GET medication by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// CREATE new medication
app.post('/api/medications', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, frequency, startDate, endDate, notes } = req.body;
    const medication = new Medication({ userId: req.user.userId, name, dosage, frequency, startDate, endDate, notes });
    await medication.save();
    res.status(201).json({ success: true, medication, message: 'Medication created successfully' });
  } catch (err) { 
    console.error('POST medication error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// UPDATE medication by ID
app.put('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, frequency, startDate, endDate, notes, isActive } = req.body;
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, dosage, frequency, startDate, endDate, notes, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    res.json({ success: true, medication, message: 'Medication updated successfully' });
  } catch (err) { 
    console.error('PUT medication error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// DELETE medication by ID
app.delete('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    res.json({ success: true, message: 'Medication deleted successfully' });
  } catch (err) { 
    console.error('DELETE medication error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// ==================== APPOINTMENTS CRUD ====================
// GET all appointments for user
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json({ success: true, appointments, count: appointments.length });
  } catch (err) { 
    console.error('GET appointments error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// GET single appointment by ID
app.get('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, appointment });
  } catch (err) { 
    console.error('GET appointment by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// CREATE new appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { doctorName, specialty, appointmentDate, appointmentTime, type, reason, notes, title, date, time, status } = req.body;
    
    // Support both old and new field names
    const appointmentData = {
      userId: req.user.userId,
      doctorName,
      specialty: specialty || 'General',
      appointmentDate: appointmentDate || date,
      appointmentTime: appointmentTime || time,
      type: type || 'in_person',
      reason: reason || title || 'Consultation',
      notes,
      status: status || 'scheduled'
    };
    
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    res.status(201).json({ success: true, appointment, message: 'Appointment created successfully' });
  } catch (err) { 
    console.error('POST appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message }); 
  }
});

// UPDATE appointment by ID
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { doctorName, specialty, appointmentDate, appointmentTime, type, reason, notes, title, date, time, status } = req.body;
    
    // Support both old and new field names
    const updateData = {};
    if (doctorName) updateData.doctorName = doctorName;
    if (specialty) updateData.specialty = specialty;
    if (appointmentDate || date) updateData.appointmentDate = appointmentDate || date;
    if (appointmentTime || time) updateData.appointmentTime = appointmentTime || time;
    if (type) updateData.type = type;
    if (reason || title) updateData.reason = reason || title;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    updateData.updatedAt = Date.now();
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, appointment, message: 'Appointment updated successfully' });
  } catch (err) { 
    console.error('PUT appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message }); 
  }
});

// DELETE appointment by ID
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (err) { 
    console.error('DELETE appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// ==================== DEVICES CRUD ====================
// GET all devices for user
app.get('/api/devices', authenticateToken, async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.userId }).sort({ connectedAt: -1 });
    res.json({ success: true, devices, count: devices.length });
  } catch (err) { 
    console.error('GET devices error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// GET single device by ID
app.get('/api/devices/:id', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }
    res.json({ success: true, device });
  } catch (err) { 
    console.error('GET device by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// CREATE/Connect new device
app.post('/api/devices', authenticateToken, async (req, res) => {
  try {
    const { name, type, model, manufacturer, status } = req.body;
    const device = new Device({ userId: req.user.userId, name, type, model, manufacturer, status });
    await device.save();
    res.status(201).json({ success: true, device, message: 'Device connected successfully' });
  } catch (err) { 
    console.error('POST device error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// UPDATE device by ID
app.put('/api/devices/:id', authenticateToken, async (req, res) => {
  try {
    const { name, type, model, manufacturer, status, lastSyncedAt } = req.body;
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, type, model, manufacturer, status, lastSyncedAt, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }
    res.json({ success: true, device, message: 'Device updated successfully' });
  } catch (err) { 
    console.error('PUT device error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// DELETE device by ID
app.delete('/api/devices/:id', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }
    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (err) { 
    console.error('DELETE device error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
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
