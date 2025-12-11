const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  profile: {
    dateOfBirth: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', null],
      default: null
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
      default: null
    },
    allergies: [{
      type: String,
      trim: true
    }],
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        default: null
      },
      phone: {
        type: String,
        trim: true,
        default: null
      },
      relationship: {
        type: String,
        trim: true,
        default: null
      }
    },
    profilePicture: {
      type: String,
      default: null
    }
  },
  role: {
    type: String,
    enum: ['patient', 'pharmacy', 'doctor', 'admin'],
    default: 'patient'
  },
  // Doctor-specific fields
  specialty: {
    type: String,
    trim: true,
    default: null
  },
  experience: {
    type: Number,
    min: 0,
    default: null
  },
  licenseId: {
    type: String,
    trim: true,
    default: null
  },
  image: {
    type: String,
    trim: true,
    default: null
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'family'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial'],
      default: 'trial'
    },
    trialEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);