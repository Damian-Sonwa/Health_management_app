const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration to fix the cross-origin issue
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://462557-37ddc8fcc64c4f3e98d815dbc5b0cc59-3-latest.app.mgx.dev",
    "https://pv6ki-37ddc8fcc64c4f3e98d815dbc5b0cc59-preview.app.mgx.dev",
    "https://noncondescendingly-phonometric-ken.ngrok-free.dev"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://kingsleybotchway40:JesusChrist123@healthcarecluster.l1wgv.mongodb.net/healthcare?retryWrites=true&w=majority&appName=HealthcareCluster';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, default: 'patient' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Vital Schema
const vitalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
  unit: String,
  notes: String,
  recordedAt: { type: Date, default: Date.now }
});

const Vital = mongoose.model('Vital', vitalSchema);

// Medication Schema
const medicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: String,
  frequency: String,
  startDate: Date,
  endDate: Date,
  notes: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Medication = mongoose.model('Medication', medicationSchema);

// JWT Secret
const JWT_SECRET = 'healthcare-secret-key-2024';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Healthcare API is running',
    timestamp: new Date().toISOString()
  });
});

// Seed demo user
const seedDemoUser = async () => {
  try {
    const existingUser = await User.findOne({ email: 'alice@example.com' });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const demoUser = new User({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: hashedPassword,
        phone: '+1234567890'
      });
      await demoUser.save();
      console.log('✅ Demo user created: alice@example.com / password123');
    }
  } catch (error) {
    console.error('Error seeding demo user:', error);
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    console.log('✅ Login successful for:', email);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// User Routes
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Vitals Routes
app.get('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const vitals = await Vital.find({ userId: req.user.userId }).sort({ recordedAt: -1 });
    res.json({ success: true, data: vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const { type, value, unit, notes } = req.body;
    const vital = new Vital({ userId: req.user.userId, type, value, unit, notes });
    await vital.save();
    res.status(201).json({ success: true, data: vital });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Medications Routes
app.get('/api/medications', authenticateToken, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: medications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/medications', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, frequency, startDate, endDate, notes } = req.body;
    const medication = new Medication({ userId: req.user.userId, name, dosage, frequency, startDate, endDate, notes });
    await medication.save();
    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard Stats Route
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const vitalsCount = await Vital.countDocuments({ userId: req.user.userId });
    const medicationsCount = await Medication.countDocuments({ userId: req.user.userId, isActive: true });
    const recentVitals = await Vital.find({ userId: req.user.userId }).sort({ recordedAt: -1 }).limit(5);

    res.json({
      success: true,
      data: { vitalsCount, medicationsCount, recentVitals }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Healthcare API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  await seedDemoUser();
});

module.exports = app;