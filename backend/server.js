// -------------------- Imports --------------------
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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
const HealthRecord = require('./models/HealthRecord');
const Notification = require('./models/Notification');
const DataVisualization = require('./models/DataVisualization');
const Caregiver = require('./models/Caregiver');
const CarePlan = require('./models/CarePlan');
const Doctor = require('./models/Doctor');
const UserPreferences = require('./models/UserPreferences');
const Achievement = require('./models/Achievement');
const UserProgress = require('./models/UserProgress');
const AIConversation = require('./models/AIConversation');
const WeeklySummary = require('./models/WeeklySummary');
const { ensurePremiumFeatureAccess } = require('./middleware/featureAccess');

// Import AI utilities
const { generateAIResponse, generateAchievementMessage } = require('./utils/aiMotivation');

// -------------------- App Initialization --------------------
const app = express();

// -------------------- Middleware --------------------
// CORS configuration for production
const allowedOrigins = [
  "https://nuviacare-life.netlify.app", // Netlify deployment
  "https://nuviacare-healthify.netlify.app", // Alternative Netlify deployment
  "https://nuviacare-health-manager.vercel.app", // Vercel deployment
  "http://localhost:3000", // for local development
  "http://localhost:5173", // Vite dev server
  "http://localhost:5174", // Alternative Vite port
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Render health checks, Socket.IO, mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      // Allow all Netlify deployments (including preview deployments)
      if (origin.endsWith('.netlify.app')) return callback(null, true);
      
      // Block unknown origins
      return callback(new Error("CORS not allowed for this origin"));
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
      'Access-Control-Request-Headers'
    ]
  })
);

// Optional: Only log valid origins (not health checks or undefined)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.netlify.app'))) {
    console.log(`✅ CORS request from: ${origin}`);
  }
  next();
});

// JSON Parsing (increased limit for profile pictures)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// -------------------- MongoDB Connection --------------------
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// Verify and force correct database
const dbNameMatch = MONGODB_URI.match(/\.net\/([^?]+)/);
const expectedDb = dbNameMatch ? dbNameMatch[1] : 'healthify_tracker';
console.log(`\n🗄️  Target database from URI: "${expectedDb}"`);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'healthify_tracker'  // FORCE correct database
})
.then(() => {
  const actualDb = mongoose.connection.db.databaseName;
  console.log(`✅ Connected to MongoDB Atlas`);
  console.log(`📊 Active database: "${actualDb}"`);
  if (actualDb !== 'healthify_tracker') {
    console.error(`❌ CRITICAL: Connected to "${actualDb}" instead of "healthify_tracker"!`);
    process.exit(1);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// -------------------- JWT Configuration --------------------

// -------------------- JWT Middleware --------------------
const JWT_SECRET = process.env.JWT_SECRET || 'healthcare-secret-key-2025';
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    const payload = user || {};
    req.user = {
      ...payload,
      role: payload.role || 'user'
    };
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
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
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

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
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

// Update profile picture
app.put('/api/users/profile-picture', authenticateToken, async (req, res) => {
  try {
    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      return res.status(400).json({ success: false, message: 'Profile picture required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        'profile.profilePicture': profilePicture,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user, message: 'Profile picture updated successfully' });
  } catch (err) {
    console.error('UPDATE profile picture error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET user settings/preferences
app.get('/api/users/settings', authenticateToken, async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ userId: req.user.userId });
    
    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await UserPreferences.create({ userId: req.user.userId });
    }
    
    res.json({ success: true, settings: preferences });
  } catch (err) {
    console.error('GET settings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE user settings/preferences
app.put('/api/users/settings', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;
    
    // Upsert preferences (update if exists, create if doesn't)
    const preferences = await UserPreferences.findOneAndUpdate(
      { userId: req.user.userId },
      { 
        ...settings,
        userId: req.user.userId
      },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, settings: preferences, message: 'Settings saved successfully' });
  } catch (err) {
    console.error('UPDATE settings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change Password
app.put('/api/users/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
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
    res.json({ success: true, data: vitals, count: vitals.length });
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
    
    // Auto-track daily activity for blood pressure and glucose
    if (type === 'Blood Pressure' || type === 'blood_pressure') {
      try {
        const { weekNumber, year } = getWeekNumber(new Date());
        const { weekStart, weekEnd } = getWeekDates(new Date());
        
        let summary = await WeeklySummary.findOne({ 
          userId: req.user.userId, 
          weekNumber, 
          year 
        });
        
        if (!summary) {
          summary = new WeeklySummary({
            userId: req.user.userId,
            weekNumber,
            year,
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            dailyActivities: []
          });
        }
        
        const todayStr = new Date().toISOString().split('T')[0];
        let dailyEntry = summary.dailyActivities.find(
          entry => entry.date.toISOString().split('T')[0] === todayStr
        );
        
        if (!dailyEntry) {
          dailyEntry = {
            date: new Date(),
            bloodPressureRecorded: false,
            bloodGlucoseRecorded: false,
            medicationTaken: false,
            goalsCompleted: 0,
            points: 0
          };
          summary.dailyActivities.push(dailyEntry);
        }
        
        if (!dailyEntry.bloodPressureRecorded) {
          dailyEntry.bloodPressureRecorded = true;
          dailyEntry.goalsCompleted += 1;
          dailyEntry.points += 10;
          summary.weeklyStats.bloodPressureReadings += 1;
          summary.weeklyStats.totalPoints += 10;
          summary.weeklyStats.totalDaysActive = summary.dailyActivities.filter(
            day => day.goalsCompleted > 0
          ).length;
          await summary.save();
          console.log(`📊 Auto-tracked BP for user ${req.user.userId} (+10 points)`);
        }
      } catch (trackErr) {
        console.error('Auto-track error (BP):', trackErr);
      }
    } else if (type === 'Blood Glucose' || type === 'blood_glucose' || type === 'Glucose') {
      try {
        const { weekNumber, year } = getWeekNumber(new Date());
        const { weekStart, weekEnd } = getWeekDates(new Date());
        
        let summary = await WeeklySummary.findOne({ 
          userId: req.user.userId, 
          weekNumber, 
          year 
        });
        
        if (!summary) {
          summary = new WeeklySummary({
            userId: req.user.userId,
            weekNumber,
            year,
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            dailyActivities: []
          });
        }
        
        const todayStr = new Date().toISOString().split('T')[0];
        let dailyEntry = summary.dailyActivities.find(
          entry => entry.date.toISOString().split('T')[0] === todayStr
        );
        
        if (!dailyEntry) {
          dailyEntry = {
            date: new Date(),
            bloodPressureRecorded: false,
            bloodGlucoseRecorded: false,
            medicationTaken: false,
            goalsCompleted: 0,
            points: 0
          };
          summary.dailyActivities.push(dailyEntry);
        }
        
        if (!dailyEntry.bloodGlucoseRecorded) {
          dailyEntry.bloodGlucoseRecorded = true;
          dailyEntry.goalsCompleted += 1;
          dailyEntry.points += 10;
          summary.weeklyStats.bloodGlucoseReadings += 1;
          summary.weeklyStats.totalPoints += 10;
          summary.weeklyStats.totalDaysActive = summary.dailyActivities.filter(
            day => day.goalsCompleted > 0
          ).length;
          await summary.save();
          console.log(`📊 Auto-tracked glucose for user ${req.user.userId} (+10 points)`);
        }
      } catch (trackErr) {
        console.error('Auto-track error (glucose):', trackErr);
      }
    }
    
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
    res.json({ success: true, data: medications, count: medications.length });
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
    res.json({ success: true, data: appointments, count: appointments.length });
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

// Helper middleware for telehealth premium gating
const ensureTelehealthAccess = ensurePremiumFeatureAccess('telehealth');

// ==================== DOCTORS CRUD (Telehealth) ====================
// GET all doctors
app.get('/api/doctors', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const { specialty, isActive, search } = req.query;
    
    let query = {};
    
    if (specialty) {
      query.specialty = specialty;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const doctors = await Doctor.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    console.error('GET doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

// GET single doctor by ID
app.get('/api/doctors/:id', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('GET doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: error.message
    });
  }
});

// POST - Add new doctor
app.post('/api/doctors', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const doctorData = {
      name: req.body.name,
      specialty: req.body.specialty,
      hospital: req.body.hospital,
      contact: req.body.contact,
      availableDays: req.body.availableDays || [],
      availableTimes: req.body.availableTimes || [],
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      zoomLink: req.body.zoomLink,
      phoneNumber: req.body.phoneNumber,
      chatAvailable: req.body.chatAvailable !== undefined ? req.body.chatAvailable : true,
      email: req.body.email,
      profileImage: req.body.profileImage,
      experience: req.body.experience || 0,
      rating: req.body.rating || 0,
      consultationFee: req.body.consultationFee || 0
    };
    
    const doctor = new Doctor(doctorData);
    await doctor.save();
    
    // Emit real-time update
    if (io) {
      io.emit('doctor-added', doctor);
    }
    
    res.status(201).json({
      success: true,
      data: doctor,
      message: 'Doctor added successfully'
    });
  } catch (error) {
    console.error('POST doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add doctor',
      error: error.message
    });
  }
});

// PUT - Update doctor by ID
app.put('/api/doctors/:id', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Emit real-time update
    if (io) {
      io.emit('doctor-updated', doctor);
    }
    
    res.json({
      success: true,
      data: doctor,
      message: 'Doctor updated successfully'
    });
  } catch (error) {
    console.error('PUT doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: error.message
    });
  }
});

// DELETE - Delete doctor by ID
app.delete('/api/doctors/:id', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Emit real-time update
    if (io) {
      io.emit('doctor-deleted', { id: req.params.id });
    }
    
    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('DELETE doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
      error: error.message
    });
  }
});

// GET list of unique specialties
app.get('/api/doctors/specialties/list', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty');
    
    res.json({
      success: true,
      data: specialties
    });
  } catch (error) {
    console.error('GET specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specialties',
      error: error.message
    });
  }
});

// ==================== CHAT CRUD (Telehealth) ====================
const Chat = require('./models/Chat');

// GET chat history with a specific doctor
app.get('/api/chats/:doctorId', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const userId = req.user.userId;
    const doctorId = req.params.doctorId;
    const roomId = Chat.getRoomId(userId, doctorId);
    
    const messages = await Chat.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages
    
    res.json({
      success: true,
      data: messages,
      roomId
    });
  } catch (error) {
    console.error('GET chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
});

// POST - Send a new message
app.post('/api/chats', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const { receiverId, message, receiverModel = 'Doctor' } = req.body;
    const senderId = req.user.userId;
    const roomId = Chat.getRoomId(senderId, receiverId);
    
    const chatMessage = new Chat({
      senderId,
      senderModel: 'User',
      receiverId,
      receiverModel,
      message,
      roomId
    });
    
    await chatMessage.save();
    
    // Emit real-time chat message via Socket.IO
    if (io) {
      io.to(roomId).emit('new-message', chatMessage);
    }
    
    res.status(201).json({
      success: true,
      data: chatMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('POST chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// PUT - Mark messages as read
app.put('/api/chats/:roomId/read', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const userId = req.user.userId;
    const roomId = req.params.roomId;
    
    await Chat.updateMany(
      { 
        roomId,
        receiverId: userId,
        isRead: false
      },
      { $set: { isRead: true } }
    );
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('PUT mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// GET unread message count
app.get('/api/chats/unread/count', authenticateToken, ensureTelehealthAccess, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const count = await Chat.countDocuments({
      receiverId: userId,
      isRead: false
    });
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('GET unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

// ==================== DEVICES CRUD ====================
// GET all devices for user
app.get('/api/devices', authenticateToken, async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.userId }).sort({ connectedAt: -1 });
    res.json({ success: true, data: devices, count: devices.length });
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

// ==================== MEDICATION REQUESTS CRUD ====================
// GET all medication requests for user
app.get('/api/medication-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await MedicationRequest.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, requests, count: requests.length });
  } catch (err) {
    console.error('GET medication requests error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single medication request by ID
app.get('/api/medication-requests/:id', authenticateToken, async (req, res) => {
  try {
    const request = await MedicationRequest.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, request });
  } catch (err) {
    console.error('GET medication request by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE new medication request
app.post('/api/medication-requests', authenticateToken, async (req, res) => {
  try {
    const { patientName, patientPhone, patientEmail, pharmacy, deliveryAddress, paymentMethod, prescriptionFile, paymentReceipt, notes } = req.body;
    
    const requestData = {
      userId: req.user.userId,
      patientInfo: {
        name: patientName,
        phone: patientPhone,
        email: patientEmail
      },
      prescription: {
        fileName: prescriptionFile || 'prescription.pdf'
      },
      pharmacy: {
        name: pharmacy || 'hospital_pharmacy'
      },
      deliveryAddress: {
        street: deliveryAddress
      },
      payment: {
        method: paymentMethod || 'card',
        receiptFileName: paymentReceipt || 'receipt.pdf'
      },
      notes,
      status: 'pending'
    };
    
    const request = new MedicationRequest(requestData);
    await request.save();
    
    res.status(201).json({ success: true, request, message: 'Medication request submitted successfully' });
  } catch (err) {
    console.error('POST medication request error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// UPDATE medication request by ID
app.put('/api/medication-requests/:id', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const request = await MedicationRequest.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    if (status) {
      request.updateStatus(status, req.user.userId, notes);
    }
    
    res.json({ success: true, request, message: 'Request updated successfully' });
  } catch (err) {
    console.error('PUT medication request error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE medication request by ID
app.delete('/api/medication-requests/:id', authenticateToken, async (req, res) => {
  try {
    const request = await MedicationRequest.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (err) {
    console.error('DELETE medication request error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const vitalsCount = await Vital.countDocuments({ userId: req.user.userId });
    const medicationsCount = await Medication.countDocuments({ userId: req.user.userId, isActive: true });
    const appointmentsCount = await Appointment.countDocuments({ userId: req.user.userId });
    const healthRecordsCount = await HealthRecord.countDocuments({ userId: req.user.userId });
    const unreadNotifications = await Notification.countDocuments({ userId: req.user.userId, isRead: false });
    const recentVitals = await Vital.find({ userId: req.user.userId }).sort({ recordedAt: -1 }).limit(5);
    const upcomingAppointments = await Appointment.find({ 
      userId: req.user.userId, 
      appointmentDate: { $gte: new Date() } 
    }).sort({ appointmentDate: 1 }).limit(5);
    
    res.json({ 
      success: true, 
      data: { 
        vitalsCount, 
        medicationsCount, 
        appointmentsCount,
        healthRecordsCount,
        unreadNotifications,
        recentVitals,
        upcomingAppointments
      } 
    });
  } catch (err) { 
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' }); 
  }
});

// ==================== HEALTH RECORDS CRUD ====================
// GET all health records for user
app.get('/api/health-records', authenticateToken, async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    const query = { userId: req.user.userId };
    if (type) query.type = type;
    
    const records = await HealthRecord.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: records, count: records.length });
  } catch (err) {
    console.error('GET health records error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single health record by ID
app.get('/api/health-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Health record not found' });
    }
    
    res.json({ success: true, data: record });
  } catch (err) {
    console.error('GET health record error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE new health record
app.post('/api/health-records', authenticateToken, async (req, res) => {
  try {
    const recordData = {
      userId: req.user.userId,
      ...req.body
    };
    
    const record = new HealthRecord(recordData);
    await record.save();
    
    // Create notification for new health record
    const notification = new Notification({
      userId: req.user.userId,
      type: 'system',
      title: 'New Health Record Added',
      message: `Your ${req.body.type} record "${req.body.title}" has been saved successfully.`,
      priority: 'low',
      icon: 'FileText'
    });
    await notification.save();
    
    res.status(201).json({ success: true, data: record, message: 'Health record created successfully' });
  } catch (err) {
    console.error('CREATE health record error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE health record by ID
app.put('/api/health-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Health record not found' });
    }
    
    res.json({ success: true, data: record, message: 'Health record updated successfully' });
  } catch (err) {
    console.error('UPDATE health record error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE health record by ID
app.delete('/api/health-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Health record not found' });
    }
    
    res.json({ success: true, message: 'Health record deleted successfully' });
  } catch (err) {
    console.error('DELETE health record error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== NOTIFICATIONS CRUD ====================
// GET all notifications for user
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { isRead, type, limit = 20 } = req.query;
    const query = { userId: req.user.userId };
    
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;
    
    const notifications = await Notification.find(query)
      .sort({ scheduledFor: -1 })
      .limit(parseInt(limit));
    
    const unreadCount = await Notification.countDocuments({ userId: req.user.userId, isRead: false });
    
    res.json({ success: true, data: notifications, unreadCount, count: notifications.length });
  } catch (err) {
    console.error('GET notifications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE new notification
app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notificationData = {
      userId: req.user.userId,
      ...req.body
    };
    
    const notification = new Notification(notificationData);
    await notification.save();
    
    res.status(201).json({ success: true, data: notification, message: 'Notification created successfully' });
  } catch (err) {
    console.error('CREATE notification error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// MARK notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, data: notification, message: 'Notification marked as read' });
  } catch (err) {
    console.error('UPDATE notification error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// MARK all notifications as read
app.put('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('UPDATE all notifications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE notification by ID
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('DELETE notification error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== DATA VISUALIZATION CRUD ====================
// GET visualization data for user
app.get('/api/data-visualization', authenticateToken, async (req, res) => {
  try {
    const { dataCategory, period = 'monthly' } = req.query;
    const userId = req.user.userId;
    
    // If no dataCategory provided, return all visualizations
    if (!dataCategory) {
      const allViz = await DataVisualization.find({ userId }).sort({ createdAt: -1 });
      return res.json({ success: true, data: allViz || [] });
    }
    
    // Check if we have valid cached data
    let vizData = await DataVisualization.findOne({
      userId,
      dataCategory,
      period
    });
    
    if (vizData && vizData.isValid()) {
      return res.json({ success: true, data: vizData, cached: true });
    }
    
    // Generate new visualization data based on category
    let dataPoints = [];
    
    if (dataCategory === 'vitals') {
      // Get vitals data for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const vitals = await Vital.find({
        userId,
        recordedAt: { $gte: sixMonthsAgo }
      }).sort({ recordedAt: 1 });
      
      // Group by month
      const monthlyData = {};
      vitals.forEach(vital => {
        const month = new Date(vital.recordedAt).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = [];
        monthlyData[month].push(vital.value || 80);
      });
      
      // Calculate averages
      for (let [month, values] of Object.entries(monthlyData)) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        dataPoints.push({ date: month, value: Math.round(avg) });
      }
    } else if (dataCategory === 'wellness') {
      // Calculate wellness score based on various factors
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const vitalsCount = await Vital.countDocuments({
          userId,
          recordedAt: { 
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
          }
        });
        
        const score = Math.min(100, 70 + (vitalsCount * 5));
        dataPoints.push({ date: monthName, value: score });
      }
    } else if (dataCategory === 'appointments') {
      // Get appointment types distribution
      const appointments = await Appointment.find({ userId });
      const typeCounts = {};
      
      appointments.forEach(apt => {
        const type = apt.type || 'General';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      dataPoints = Object.entries(typeCounts).map(([type, count]) => ({
        date: type,
        value: count
      }));
    }
    
    // Create or update visualization data
    if (vizData) {
      vizData.dataPoints = dataPoints;
      vizData.generatedAt = new Date();
      vizData.validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await vizData.save();
    } else {
      vizData = new DataVisualization({
        userId,
        chartType: dataCategory === 'appointments' ? 'bar' : 'line',
        dataCategory,
        period,
        dataPoints
      });
      await vizData.save();
    }
    
    res.json({ success: true, data: vizData, cached: false });
  } catch (err) {
    console.error('GET data visualization error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE old visualization data (cleanup)
app.delete('/api/data-visualization/cleanup', authenticateToken, async (req, res) => {
  try {
    const result = await DataVisualization.deleteMany({
      userId: req.user.userId,
      validUntil: { $lt: new Date() }
    });
    
    res.json({ success: true, message: `Deleted ${result.deletedCount} old visualization records` });
  } catch (err) {
    console.error('DELETE visualization cleanup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== CAREGIVERS CRUD ====================
// GET all caregivers for user
app.get('/api/caregivers', authenticateToken, async (req, res) => {
  try {
    const caregivers = await Caregiver.find({ userId: req.user.userId, isActive: true })
      .sort({ primaryCaregiver: -1, emergencyContact: -1, createdAt: -1 });
    
    res.json({ success: true, data: caregivers, count: caregivers.length });
  } catch (err) {
    console.error('GET caregivers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE new caregiver
app.post('/api/caregivers', authenticateToken, async (req, res) => {
  try {
    const { name, relationship, phone, email, emergencyContact, primaryCaregiver, availability, specialization, notes } = req.body;
    
    // Validation: name is required
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Caregiver name is required' });
    }
    
    const caregiverData = {
      userId: req.user.userId,
      name: name.trim(),
      relationship: relationship || 'family',
      phone: phone ? phone.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      emergencyContact: emergencyContact || false,
      primaryCaregiver: primaryCaregiver || false,
      availability: availability || 'on-call',
      specialization: specialization ? specialization.trim() : '',
      notes: notes ? notes.trim() : ''
    };
    
    const caregiver = new Caregiver(caregiverData);
    await caregiver.save();
    
    console.log(`✅ Caregiver created: ${caregiver.name} for user ${req.user.userId}`);
    res.status(201).json({ success: true, data: caregiver, message: 'Caregiver added successfully' });
  } catch (err) {
    console.error('❌ CREATE caregiver error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error while creating caregiver' });
  }
});

// UPDATE caregiver
app.put('/api/caregivers/:id', authenticateToken, async (req, res) => {
  try {
    const caregiver = await Caregiver.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!caregiver) {
      return res.status(404).json({ success: false, message: 'Caregiver not found' });
    }
    
    res.json({ success: true, data: caregiver, message: 'Caregiver updated successfully' });
  } catch (err) {
    console.error('UPDATE caregiver error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE caregiver
app.delete('/api/caregivers/:id', authenticateToken, async (req, res) => {
  try {
    const caregiver = await Caregiver.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isActive: false },
      { new: true }
    );
    
    if (!caregiver) {
      return res.status(404).json({ success: false, message: 'Caregiver not found' });
    }
    
    res.json({ success: true, message: 'Caregiver removed successfully' });
  } catch (err) {
    console.error('DELETE caregiver error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== CARE PLANS CRUD ====================
// GET all care plans for user
app.get('/api/care-plans', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user.userId };
    if (status) query.status = status;
    
    const carePlans = await CarePlan.find(query)
      .populate('assignedTo', 'name relationship')
      .sort({ priority: 1, createdAt: -1 });
    
    res.json({ success: true, data: carePlans, count: carePlans.length });
  } catch (err) {
    console.error('GET care plans error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE new care plan
app.post('/api/care-plans', authenticateToken, async (req, res) => {
  try {
    const carePlanData = {
      userId: req.user.userId,
      ...req.body
    };
    
    const carePlan = new CarePlan(carePlanData);
    await carePlan.save();
    
    res.status(201).json({ success: true, data: carePlan, message: 'Care plan created successfully' });
  } catch (err) {
    console.error('CREATE care plan error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE care plan
app.put('/api/care-plans/:id', authenticateToken, async (req, res) => {
  try {
    const carePlan = await CarePlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name relationship');
    
    if (!carePlan) {
      return res.status(404).json({ success: false, message: 'Care plan not found' });
    }
    
    res.json({ success: true, data: carePlan, message: 'Care plan updated successfully' });
  } catch (err) {
    console.error('UPDATE care plan error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE care plan
app.delete('/api/care-plans/:id', authenticateToken, async (req, res) => {
  try {
    const carePlan = await CarePlan.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!carePlan) {
      return res.status(404).json({ success: false, message: 'Care plan not found' });
    }
    
    res.json({ success: true, message: 'Care plan deleted successfully' });
  } catch (err) {
    console.error('DELETE care plan error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== DOCTORS CRUD ====================
// GET all available doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const { specialty, isAvailable } = req.query;
    const query = {};
    
    if (specialty) query.specialty = new RegExp(specialty, 'i');
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    
    const doctors = await Doctor.find(query)
      .sort({ rating: -1, name: 1 })
      .limit(50);
    
    res.json({ success: true, data: doctors, count: doctors.length });
  } catch (err) {
    console.error('GET doctors error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single doctor
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({ success: true, data: doctor });
  } catch (err) {
    console.error('GET doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE new doctor (admin only for now)
app.post('/api/doctors', async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    
    res.status(201).json({ success: true, data: doctor, message: 'Doctor added successfully' });
  } catch (err) {
    console.error('CREATE doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE doctor
app.put('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({ success: true, data: doctor, message: 'Doctor updated successfully' });
  } catch (err) {
    console.error('UPDATE doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== USER PREFERENCES ====================
// GET user preferences
app.get('/api/preferences', authenticateToken, async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ userId: req.user.userId });
    
    // Create default preferences if none exist
    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user.userId });
      await preferences.save();
    }
    
    res.json({ success: true, data: preferences });
  } catch (err) {
    console.error('GET preferences error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE user preferences
app.put('/api/preferences', authenticateToken, async (req, res) => {
  try {
    let preferences = await UserPreferences.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, data: preferences, message: 'Preferences updated successfully' });
  } catch (err) {
    console.error('UPDATE preferences error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== SUBSCRIPTIONS ====================
// GET user subscription
app.get('/api/subscriptions/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('subscription');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Return subscription with default values if not set
    const subscription = user.subscription || {
      tier: 'free',
      status: 'active',
      plan: 'free'
    };

    res.json({ 
      success: true, 
      subscription 
    });
  } catch (err) {
    console.error('GET subscription error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

// UPDATE or CREATE subscription
app.post('/api/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { tier, status, plan, paymentMethod } = req.body;

    const updateData = {
      'subscription.tier': tier || 'free',
      'subscription.status': status || 'active',
      'subscription.plan': plan || 'free'
    };

    if (paymentMethod) {
      updateData['subscription.paymentMethod'] = paymentMethod;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('subscription');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      subscription: user.subscription,
      message: 'Subscription updated successfully' 
    });
  } catch (err) {
    console.error('UPDATE subscription error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

// UPGRADE to premium
app.post('/api/subscriptions/upgrade', authenticateToken, async (req, res) => {
  try {
    const { plan, paymentMethod, transactionId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          'subscription.tier': 'premium',
          'subscription.status': 'active',
          'subscription.plan': plan || 'monthly',
          'subscription.paymentMethod': paymentMethod,
          'subscription.startDate': new Date(),
          'subscription.endDate': plan === 'yearly' 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 1 month
        }
      },
      { new: true, runValidators: true }
    ).select('subscription');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log(`✅ User ${user._id} upgraded to premium (${plan})`);

    res.json({ 
      success: true, 
      subscription: user.subscription,
      message: 'Successfully upgraded to premium!' 
    });
  } catch (err) {
    console.error('UPGRADE subscription error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

// ==================== STRIPE PAYMENT ====================
// Note: Stripe integration requires STRIPE_SECRET_KEY in environment
// Install: npm install stripe

// Create Stripe checkout session
app.post('/api/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { priceId, planId, successUrl, cancelUrl } = req.body;
    const userId = req.user.userId;

    if (!priceId || !planId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️  Stripe not configured. Set STRIPE_SECRET_KEY environment variable.');
      return res.status(503).json({ 
        error: 'Payment processing is not configured yet. Please contact support.' 
      });
    }

    // Dynamically load Stripe only if configured
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.FRONTEND_URL}/subscription/success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/subscription/cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          userId,
          planId,
        },
      },
    });

    // Store pending subscription info
    const startDate = new Date();
    const endDate = new Date();
    if (planId === 'yearly') {
      endDate.setFullYear(startDate.getFullYear() + 1);
    } else {
      endDate.setMonth(startDate.getMonth() + 1);
    }

    // Update user with pending subscription
    await User.findByIdAndUpdate(userId, {
      $set: {
        'subscription.tier': 'premium',
        'subscription.status': 'pending',
        'subscription.plan': planId,
        'subscription.startDate': startDate,
        'subscription.endDate': endDate,
        'subscription.paymentReference': session.id,
      }
    });

    console.log(`✅ Stripe checkout session created for user ${userId}`);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Stripe webhook handler
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // For testing without webhook secret
      console.warn('⚠️  Stripe webhook secret not set. Using unverified webhook.');
      event = JSON.parse(req.body);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            $set: {
              'subscription.status': 'active',
              'subscription.tier': 'premium',
            }
          });
          console.log(`✅ Subscription activated for user ${userId}`);
        }
        break;
      
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        const userIdCancel = subscription.metadata?.userId;
        
        if (userIdCancel) {
          await User.findByIdAndUpdate(userIdCancel, {
            $set: {
              'subscription.status': 'cancelled',
              'subscription.tier': 'free',
            }
          });
          console.log(`✅ Subscription cancelled for user ${userIdCancel}`);
        }
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// ==================== GAMIFICATION ====================
// GET user progress
app.get('/api/gamification/progress', authenticateToken, async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.user.userId });
    
    // Create default progress if none exists
    if (!progress) {
      progress = new UserProgress({ userId: req.user.userId });
      await progress.save();
    }
    
    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('GET progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE user progress (award points, update streak)
app.post('/api/gamification/progress/update', authenticateToken, async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      progress = new UserProgress({ userId: req.user.userId });
    }
    
    const { action, category, points } = req.body;
    
    // Award points
    if (points) {
      progress.totalPoints += points;
    }
    
    // Update streak
    progress.updateStreak();
    
    // Update stats based on category
    if (category === 'blood_pressure') {
      progress.stats.bloodPressureReadings += 1;
      progress.dailyGoals.bloodPressure = true;
    } else if (category === 'blood_glucose') {
      progress.stats.bloodGlucoseReadings += 1;
      progress.dailyGoals.bloodGlucose = true;
    } else if (category === 'medication') {
      progress.stats.medicationsTaken += 1;
      progress.dailyGoals.medication = true;
    } else if (category === 'care_task') {
      progress.stats.careTasksCompleted += 1;
    }
    
    // Check for level up
    const leveledUp = progress.updateLevel();
    
    await progress.save();
    
    // Create achievement if level up or streak milestone
    let newAchievement = null;
    if (leveledUp) {
      newAchievement = new Achievement({
        userId: req.user.userId,
        type: 'milestone',
        category: 'general',
        name: `Level ${progress.level} Reached!`,
        description: `You've reached level ${progress.level}! Keep up the amazing work!`,
        icon: '⭐',
        badgeColor: 'gold',
        points: 50
      });
      await newAchievement.save();
    }
    
    // Check for streak milestones
    const streakMilestones = [3, 7, 14, 30, 60, 90, 180, 365];
    if (streakMilestones.includes(progress.currentStreak)) {
      newAchievement = new Achievement({
        userId: req.user.userId,
        type: 'streak',
        category: 'general',
        name: `${progress.currentStreak}-Day Streak!`,
        description: `You've maintained a ${progress.currentStreak}-day streak! Incredible consistency!`,
        icon: '🔥',
        badgeColor: 'orange',
        points: progress.currentStreak
      });
      await newAchievement.save();
    }
    
    res.json({ 
      success: true, 
      data: progress, 
      leveledUp,
      newAchievement,
      message: leveledUp ? `Level up! You're now level ${progress.level}!` : 'Progress updated!'
    });
  } catch (err) {
    console.error('UPDATE progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET user achievements
app.get('/api/gamification/achievements', authenticateToken, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.userId })
      .sort({ unlockedAt: -1 });
    
    res.json({ success: true, data: achievements });
  } catch (err) {
    console.error('GET achievements error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE achievement (manual unlock)
app.post('/api/gamification/achievements', authenticateToken, async (req, res) => {
  try {
    const achievement = new Achievement({
      userId: req.user.userId,
      ...req.body
    });
    
    await achievement.save();
    
    // Update user points
    if (achievement.points > 0) {
      await UserProgress.findOneAndUpdate(
        { userId: req.user.userId },
        { $inc: { totalPoints: achievement.points } }
      );
    }
    
    res.json({ 
      success: true, 
      data: achievement, 
      message: generateAchievementMessage(achievement) 
    });
  } catch (err) {
    console.error('CREATE achievement error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET leaderboard (optional - top users by points)
app.get('/api/gamification/leaderboard', authenticateToken, async (req, res) => {
  try {
    const topUsers = await UserProgress.find()
      .sort({ totalPoints: -1 })
      .limit(10)
      .populate('userId', 'name');
    
    res.json({ success: true, data: topUsers });
  } catch (err) {
    console.error('GET leaderboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== WEEKLY SUMMARY & ANALYTICS ====================
// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { weekNumber, year: d.getFullYear() };
}

// Helper function to get week start and end dates
function getWeekDates(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
}

// TRACK daily activity
app.post('/api/analytics/daily-track', authenticateToken, async (req, res) => {
  try {
    const { activityType } = req.body; // 'blood_pressure', 'blood_glucose', 'medication'
    const userId = req.user.userId;
    const today = new Date();
    const { weekNumber, year } = getWeekNumber(today);
    const { weekStart, weekEnd } = getWeekDates(today);
    
    // Find or create weekly summary
    let summary = await WeeklySummary.findOne({ 
      userId, 
      weekNumber, 
      year 
    });
    
    if (!summary) {
      summary = new WeeklySummary({
        userId,
        weekNumber,
        year,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        dailyActivities: []
      });
    }
    
    // Find or create today's entry
    const todayStr = today.toISOString().split('T')[0];
    let dailyEntry = summary.dailyActivities.find(
      entry => entry.date.toISOString().split('T')[0] === todayStr
    );
    
    if (!dailyEntry) {
      dailyEntry = {
        date: today,
        bloodPressureRecorded: false,
        bloodGlucoseRecorded: false,
        medicationTaken: false,
        goalsCompleted: 0,
        points: 0
      };
      summary.dailyActivities.push(dailyEntry);
    }
    
    // Update activity
    let pointsEarned = 0;
    if (activityType === 'blood_pressure' && !dailyEntry.bloodPressureRecorded) {
      dailyEntry.bloodPressureRecorded = true;
      dailyEntry.goalsCompleted += 1;
      pointsEarned = 10;
      summary.weeklyStats.bloodPressureReadings += 1;
    } else if (activityType === 'blood_glucose' && !dailyEntry.bloodGlucoseRecorded) {
      dailyEntry.bloodGlucoseRecorded = true;
      dailyEntry.goalsCompleted += 1;
      pointsEarned = 10;
      summary.weeklyStats.bloodGlucoseReadings += 1;
    } else if (activityType === 'medication' && !dailyEntry.medicationTaken) {
      dailyEntry.medicationTaken = true;
      dailyEntry.goalsCompleted += 1;
      pointsEarned = 5;
      summary.weeklyStats.medicationDoses += 1;
    }
    
    dailyEntry.points += pointsEarned;
    summary.weeklyStats.totalPoints += pointsEarned;
    
    // Recalculate total days active
    summary.weeklyStats.totalDaysActive = summary.dailyActivities.filter(
      day => day.goalsCompleted > 0
    ).length;
    
    await summary.save();
    
    res.json({ 
      success: true, 
      pointsEarned,
      summary,
      message: `+${pointsEarned} points earned!` 
    });
  } catch (err) {
    console.error('Daily track error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET current week summary
app.get('/api/analytics/current-week', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const { weekNumber, year } = getWeekNumber(today);
    
    let summary = await WeeklySummary.findOne({ 
      userId: req.user.userId, 
      weekNumber, 
      year 
    });
    
    if (!summary) {
      const { weekStart, weekEnd } = getWeekDates(today);
      summary = new WeeklySummary({
        userId: req.user.userId,
        weekNumber,
        year,
        weekStartDate: weekStart,
        weekEndDate: weekEnd
      });
      await summary.save();
    }
    
    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('GET current week error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// COMPLETE weekly summary (run at end of week)
app.post('/api/analytics/complete-week', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const { weekNumber, year } = getWeekNumber(today);
    
    let summary = await WeeklySummary.findOne({ 
      userId: req.user.userId, 
      weekNumber, 
      year 
    });
    
    if (!summary) {
      return res.status(404).json({ 
        success: false, 
        message: 'Weekly summary not found' 
      });
    }
    
    // Calculate rewards (badges and flowers)
    const rewards = summary.calculateRewards();
    summary.isComplete = true;
    await summary.save();
    
    // Update user progress
    let progress = await UserProgress.findOne({ userId: req.user.userId });
    if (progress) {
      progress.totalPoints += summary.weeklyStats.totalPoints;
      progress.updateLevel();
      await progress.save();
    }
    
    console.log(`✅ Week ${weekNumber} completed for user ${req.user.userId}. Badges: ${rewards.badges.length}, Flowers: ${rewards.flowers.count}`);
    
    res.json({ 
      success: true, 
      summary,
      rewards,
      message: `Week completed! You earned ${rewards.badges.length} badges and ${rewards.flowers.count} flowers!`
    });
  } catch (err) {
    console.error('Complete week error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all weekly summaries (history)
app.get('/api/analytics/weekly-history', authenticateToken, async (req, res) => {
  try {
    const { limit = 12 } = req.query; // Last 12 weeks by default
    
    const summaries = await WeeklySummary.find({ 
      userId: req.user.userId,
      isComplete: true
    })
    .sort({ year: -1, weekNumber: -1 })
    .limit(parseInt(limit));
    
    res.json({ success: true, data: summaries, count: summaries.length });
  } catch (err) {
    console.error('GET weekly history error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== AI CHAT ====================
// GET conversation history
app.get('/api/ai-chat/conversation', authenticateToken, async (req, res) => {
  try {
    let conversation = await AIConversation.findOne({ userId: req.user.userId });
    
    if (!conversation) {
      conversation = new AIConversation({ 
        userId: req.user.userId,
        messages: []
      });
      await conversation.save();
    }
    
    res.json({ success: true, data: conversation });
  } catch (err) {
    console.error('GET conversation error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// SEND message to AI
app.post('/api/ai-chat/message', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    // Get user progress and recent vitals for context
    const progress = await UserProgress.findOne({ userId: req.user.userId });
    const recentBP = await Vital.findOne({ 
      userId: req.user.userId, 
      type: { $in: ['blood_pressure_systolic', 'blood_pressure_diastolic'] }
    }).sort({ recordedAt: -1 });
    const recentGlucose = await Vital.findOne({ 
      userId: req.user.userId, 
      type: 'blood_sugar'
    }).sort({ recordedAt: -1 });
    
    const userStats = {
      totalPoints: progress?.totalPoints || 0,
      level: progress?.level || 1,
      currentStreak: progress?.currentStreak || 0,
      recentBP: recentBP,
      recentGlucose: recentGlucose
    };
    
    // Generate AI response
    const aiResponse = generateAIResponse(message, userStats);
    
    // Save conversation
    let conversation = await AIConversation.findOne({ userId: req.user.userId });
    
    if (!conversation) {
      conversation = new AIConversation({ userId: req.user.userId, messages: [] });
    }
    
    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Add AI response
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      context: { userStats }
    });
    
    conversation.totalMessages += 2;
    conversation.lastInteraction = new Date();
    
    // Keep only last 50 messages for performance
    if (conversation.messages.length > 50) {
      conversation.messages = conversation.messages.slice(-50);
    }
    
    await conversation.save();
    
    res.json({ 
      success: true, 
      data: { 
        userMessage: message,
        aiResponse: aiResponse,
        conversation: conversation
      }
    });
  } catch (err) {
    console.error('SEND message error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CLEAR conversation history
app.delete('/api/ai-chat/conversation', authenticateToken, async (req, res) => {
  try {
    await AIConversation.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { messages: [], totalMessages: 0 } }
    );
    
    res.json({ success: true, message: 'Conversation cleared' });
  } catch (err) {
    console.error('CLEAR conversation error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== NOTIFICATIONS CRUD ====================
// GET all notifications for user
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ scheduledFor: -1, createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// CREATE notification
app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      userId: req.user.userId
    };

    const notification = await Notification.create(notificationData);
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
});

// MARK notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
});

// MARK all notifications as read
app.put('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message
    });
  }
});

// DELETE notification
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

// GET unread count
app.get('/api/notifications/unread/count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread count',
      error: error.message
    });
  }
});

// -------------------- Error Handling --------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// -------------------- Socket.IO Setup --------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use the same allowed origins
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store connected users with their socket IDs
const connectedUsers = new Map(); // userId -> Set of socket IDs

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', (userId) => {
    if (userId) {
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId).add(socket.id);
      socket.userId = userId;
      console.log(`✅ User authenticated: ${userId} (socket: ${socket.id})`);
      socket.emit('authenticated', { userId, socketId: socket.id });
    }
  });

  // Handle manual data refresh request
  socket.on('refresh-data', async (userId) => {
    try {
      console.log(`🔄 Manual refresh requested for user: ${userId}`);
      socket.emit('data-refreshed', { userId, timestamp: new Date() });
    } catch (error) {
      console.error('Error during manual refresh:', error);
    }
  });

  // ==================== CHAT SOCKET HANDLERS ====================
  
  // Join a chat room
  socket.on('join-chat-room', ({ userId, doctorId }) => {
    try {
      const roomId = Chat.getRoomId(userId, doctorId);
      socket.join(roomId);
      console.log(`💬 User ${userId} joined chat room: ${roomId}`);
      socket.emit('chat-room-joined', { roomId });
    } catch (error) {
      console.error('Error joining chat room:', error);
      socket.emit('chat-error', { message: 'Failed to join chat room' });
    }
  });

  // Leave a chat room
  socket.on('leave-chat-room', ({ roomId }) => {
    try {
      socket.leave(roomId);
      console.log(`💬 Socket ${socket.id} left chat room: ${roomId}`);
    } catch (error) {
      console.error('Error leaving chat room:', error);
    }
  });

  // Send chat message (real-time)
  socket.on('send-chat-message', async ({ receiverId, message, receiverModel = 'Doctor' }) => {
    try {
      if (!socket.userId) {
        return socket.emit('chat-error', { message: 'User not authenticated' });
      }

      const senderId = socket.userId;
      const roomId = Chat.getRoomId(senderId, receiverId);

      const chatMessage = new Chat({
        senderId,
        senderModel: 'User',
        receiverId,
        receiverModel,
        message,
        roomId
      });

      await chatMessage.save();

      // Emit to everyone in the room including sender
      io.to(roomId).emit('new-message', chatMessage);
      console.log(`💬 Message sent in room ${roomId}`);
    } catch (error) {
      console.error('Error sending chat message:', error);
      socket.emit('chat-error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing-start', ({ roomId, userName }) => {
    socket.to(roomId).emit('user-typing', { userName });
  });

  socket.on('typing-stop', ({ roomId }) => {
    socket.to(roomId).emit('user-stopped-typing');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    if (socket.userId) {
      const userSockets = connectedUsers.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedUsers.delete(socket.userId);
        }
      }
    }
  });
});

// -------------------- MongoDB Change Streams --------------------
async function setupChangeStreams() {
  try {
    // Only set up change streams if MongoDB connection is ready and it's a replica set
    if (mongoose.connection.readyState === 1) {
      console.log('🔄 Setting up MongoDB Change Streams...');

      // Watch for changes in Medications collection
      const medicationChangeStream = Medication.watch([], { fullDocument: 'updateLookup' });
      medicationChangeStream.on('change', (change) => {
        try {
          const userId = change.fullDocument?.userId;
          if (userId && connectedUsers.has(userId)) {
            const sockets = connectedUsers.get(userId);
            sockets.forEach(socketId => {
              io.to(socketId).emit('medication-updated', {
                type: change.operationType,
                data: change.fullDocument,
                timestamp: new Date()
              });
            });
            console.log(`📤 Emitted medication-updated to user ${userId}`);
          }
        } catch (error) {
          console.error('Error in medication change stream:', error);
        }
      });
      medicationChangeStream.on('error', (error) => {
        console.error('❌ Medication change stream error:', error.message);
      });

      // Watch for changes in Vitals collection
      const vitalChangeStream = Vital.watch([], { fullDocument: 'updateLookup' });
      vitalChangeStream.on('change', (change) => {
        try {
          const userId = change.fullDocument?.userId;
          if (userId && connectedUsers.has(userId)) {
            const sockets = connectedUsers.get(userId);
            sockets.forEach(socketId => {
              io.to(socketId).emit('vital-updated', {
                type: change.operationType,
                data: change.fullDocument,
                timestamp: new Date()
              });
            });
            console.log(`📤 Emitted vital-updated to user ${userId}`);
          }
        } catch (error) {
          console.error('Error in vital change stream:', error);
        }
      });
      vitalChangeStream.on('error', (error) => {
        console.error('❌ Vital change stream error:', error.message);
      });

      // Watch for changes in Appointments collection
      const appointmentChangeStream = Appointment.watch([], { fullDocument: 'updateLookup' });
      appointmentChangeStream.on('change', (change) => {
        try {
          const userId = change.fullDocument?.userId;
          if (userId && connectedUsers.has(userId)) {
            const sockets = connectedUsers.get(userId);
            sockets.forEach(socketId => {
              io.to(socketId).emit('appointment-updated', {
                type: change.operationType,
                data: change.fullDocument,
                timestamp: new Date()
              });
            });
            console.log(`📤 Emitted appointment-updated to user ${userId}`);
          }
        } catch (error) {
          console.error('Error in appointment change stream:', error);
        }
      });
      appointmentChangeStream.on('error', (error) => {
        console.error('❌ Appointment change stream error:', error.message);
      });

      // Watch for changes in CarePlans collection
      const carePlanChangeStream = CarePlan.watch([], { fullDocument: 'updateLookup' });
      carePlanChangeStream.on('change', (change) => {
        try {
          const userId = change.fullDocument?.userId;
          if (userId && connectedUsers.has(userId)) {
            const sockets = connectedUsers.get(userId);
            sockets.forEach(socketId => {
              io.to(socketId).emit('careplan-updated', {
                type: change.operationType,
                data: change.fullDocument,
                timestamp: new Date()
              });
            });
            console.log(`📤 Emitted careplan-updated to user ${userId}`);
          }
        } catch (error) {
          console.error('Error in careplan change stream:', error);
        }
      });
      carePlanChangeStream.on('error', (error) => {
        console.error('❌ CarePlan change stream error:', error.message);
      });

      // Watch for changes in Notifications collection
      const notificationChangeStream = Notification.watch([], { fullDocument: 'updateLookup' });
      notificationChangeStream.on('change', (change) => {
        try {
          const userId = change.fullDocument?.userId;
          if (userId && connectedUsers.has(userId)) {
            const sockets = connectedUsers.get(userId);
            sockets.forEach(socketId => {
              io.to(socketId).emit('notification-updated', {
                type: change.operationType,
                data: change.fullDocument,
                timestamp: new Date()
              });
            });
            console.log(`📤 Emitted notification-updated to user ${userId}`);
          }
        } catch (error) {
          console.error('Error in notification change stream:', error);
        }
      });
      notificationChangeStream.on('error', (error) => {
        console.error('❌ Notification change stream error:', error.message);
      });

      // Watch for changes in HealthRecords collection
      const healthRecordChangeStream = HealthRecord.watch([], { fullDocument: 'updateLookup' });
      healthRecordChangeStream.on('change', (change) => {
        try {
          const userId = change.fullDocument?.userId;
          if (userId && connectedUsers.has(userId)) {
            const sockets = connectedUsers.get(userId);
            sockets.forEach(socketId => {
              io.to(socketId).emit('healthrecord-updated', {
                type: change.operationType,
                data: change.fullDocument,
                timestamp: new Date()
              });
            });
            console.log(`📤 Emitted healthrecord-updated to user ${userId}`);
          }
        } catch (error) {
          console.error('Error in healthrecord change stream:', error);
        }
      });
      healthRecordChangeStream.on('error', (error) => {
        console.error('❌ HealthRecord change stream error:', error.message);
      });

      console.log('✅ MongoDB Change Streams activated!');
    }
  } catch (error) {
    // Change streams require MongoDB replica set
    // If not available, fall back to polling-based updates
    console.log('⚠️  Change streams not available (requires MongoDB replica set)');
    console.log('   Using polling-based updates instead');
  }
}

// -------------------- Global Error Handlers --------------------
// Prevent server crashes from uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  // Don't exit, just log it
});

// Prevent server crashes from unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED PROMISE REJECTION:', reason);
  console.error('Promise:', promise);
  // Don't exit, just log it
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5001;
server.listen(PORT, async () => {
  console.log(`🚀 Healthcare API server running on port ${PORT}`);
  console.log(`🔌 Socket.IO server ready for real-time updates`);
  
  // Set up change streams after a short delay to ensure connection is ready
  setTimeout(() => {
    setupChangeStreams();
  }, 2000);
});

module.exports = { app, io, server };
