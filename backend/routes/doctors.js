const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { authenticateToken } = require('../middleware/auth');

// Public endpoint for available doctors (no auth required)
// @route   GET /api/doctors/available
// @desc    Get all available doctors for appointment booking
// @access  Public
router.get('/available', async (req, res) => {
  try {
    console.log('📋 GET /api/doctors/available (router) - Fetching available doctors...');
    
    // First, check total count of doctors
    const totalDoctors = await Doctor.countDocuments();
    console.log(`📋 Total doctors in database: ${totalDoctors}`);
    
    // Only return approved doctors with completed onboarding
    let doctors = await Doctor.find({
      status: 'approved',
      onboardingCompleted: true,
      $or: [
        { isActive: true, available: { $ne: false } },
        { isActive: true, isAvailable: { $ne: false } },
        { isActive: true } // Fallback if available fields not set
      ]
    })
    .select('_id name specialty profileImage isActive available')
    .sort({ name: 1 })
    .lean();
    
    console.log(`📋 Found ${doctors.length} doctors with isActive=true and available!=false`);
    
    // If no doctors found with strict criteria, try more lenient query
    if (doctors.length === 0) {
      console.log('⚠️ No doctors found with strict criteria, trying lenient query...');
      
      // Try with just isActive (ignore available field) but still require approval
      doctors = await Doctor.find({
        status: 'approved',
        onboardingCompleted: true,
        $or: [
          { isActive: { $ne: false } },
          { isActive: true },
          {} // Return all if isActive not set
        ]
      })
      .select('_id name specialty profileImage isActive available')
      .sort({ name: 1 })
      .lean();
      
      console.log(`📋 Found ${doctors.length} doctors with isActive!=false`);
      
      // If still no doctors, return only approved doctors with completed onboarding
      if (doctors.length === 0) {
        console.log('⚠️ No doctors found with lenient criteria, returning approved doctors only...');
        doctors = await Doctor.find({
          status: 'approved',
          onboardingCompleted: true
        })
          .select('_id name specialty profileImage isActive available')
          .sort({ name: 1 })
          .lean();
        console.log(`📋 Found ${doctors.length} approved doctors with completed onboarding`);
      }
    }
    
    // Transform to match frontend expectations
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id.toString(),
      _id: doctor._id.toString(),
      name: doctor.name || doctor.fullName,
      fullName: doctor.fullName || doctor.name,
      specialty: doctor.specialty || doctor.specialization || 'General Practice',
      specialization: doctor.specialization || doctor.specialty || 'General Practice',
      profileImage: doctor.profileImage,
      isActive: doctor.isActive !== false, // Default to true if not set
      available: doctor.available !== false || doctor.isAvailable !== false, // Default to true if not set
      isAvailable: doctor.isAvailable !== false || doctor.available !== false // Default to true if not set
    }));
    
    console.log(`✅ Returning ${formattedDoctors.length} doctors to frontend`);
    
    res.json({
      success: true,
      data: formattedDoctors,
      count: formattedDoctors.length
    });
  } catch (error) {
    console.error('GET available doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available doctors',
      error: error.message
    });
  }
});

// Apply authentication to all other routes
router.use(authenticateToken);

// @route   GET /api/doctors
// @desc    Get all doctors (filtered by status if provided)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { specialty, isActive, search, status, userId, all } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by userId if provided
    if (userId) {
      query.userId = userId;
    }
    
    // Filter by status if provided (for admin approval)
    if (status) {
      query.status = status;
    } else if (all !== 'true') {
      // By default, only return approved doctors with completed onboarding
      query.status = 'approved';
      query.onboardingCompleted = true;
    }
    
    // Filter by specialty if provided
    if (specialty) {
      query.specialty = specialty;
    }
    
    // Filter by isActive if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    
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

// @route   GET /api/doctors/:id
// @desc    Get single doctor
// @access  Private
router.get('/:id', async (req, res) => {
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

// @route   POST /api/doctors
// @desc    Add new doctor (admin only - can add role check)
// @access  Private
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    // If userId is provided, this is a doctor creating/updating their own profile
    if (userId) {
      // Check if doctor record already exists
      let doctor = await Doctor.findOne({ userId });
      
      if (doctor) {
        // Update existing doctor
        Object.assign(doctor, {
          specialty: req.body.specialty || doctor.specialty,
          experience: req.body.experience || doctor.experience || 0,
          licenseId: req.body.licenseId || doctor.licenseId,
          licenseImage: req.body.licenseImage || doctor.licenseImage,
          medicalSchool: req.body.medicalSchool || doctor.medicalSchool,
          graduationYear: req.body.graduationYear || doctor.graduationYear,
          boardCertifications: req.body.boardCertifications || doctor.boardCertifications,
          hospitalAffiliations: req.body.hospitalAffiliations || doctor.hospitalAffiliations,
          phoneNumber: req.body.phone || req.body.phoneNumber || doctor.phoneNumber,
          address: req.body.address || doctor.address,
          bio: req.body.bio || doctor.bio,
          isActive: doctor.isActive !== false // Keep existing status
        });
        await doctor.save();
        
        return res.json({
          success: true,
          data: doctor,
          message: 'Doctor profile updated successfully'
        });
      } else {
        // Create new doctor record
        const User = require('../models/User');
        const user = await User.findById(userId);
        
        if (!user || user.role !== 'doctor') {
          return res.status(403).json({
            success: false,
            message: 'Only doctor users can create doctor profiles'
          });
        }
        
        doctor = new Doctor({
          userId,
          name: user.name,
          email: user.email,
          specialty: req.body.specialty || 'General Practice',
          experience: req.body.experience || 0,
          licenseId: req.body.licenseId,
          licenseImage: req.body.licenseImage,
          medicalSchool: req.body.medicalSchool,
          graduationYear: req.body.graduationYear,
          boardCertifications: req.body.boardCertifications,
          hospitalAffiliations: req.body.hospitalAffiliations,
          phoneNumber: req.body.phone || req.body.phoneNumber || user.phone,
          address: req.body.address || user.address || {},
          bio: req.body.bio,
          isActive: true,
          available: true,
          chatAvailable: true
        });
        await doctor.save();
        
        return res.status(201).json({
          success: true,
          data: doctor,
          message: 'Doctor profile created successfully'
        });
      }
    }
    
    // Admin creating doctor (original logic)
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

// @route   PUT /api/doctors/:id
// @desc    Update doctor
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If status is being updated to approved, also set isActive, available, isAvailable
    if (updateData.status === 'approved') {
      updateData.isActive = true;
      updateData.available = true;
      updateData.isAvailable = true;
      if (!updateData.approvedBy && req.user?.userId) {
        updateData.approvedBy = req.user.userId;
      }
      if (!updateData.approvedAt) {
        updateData.approvedAt = new Date();
      }
    } else if (updateData.status === 'rejected') {
      updateData.isActive = false;
      updateData.available = false;
      updateData.isAvailable = false;
    }
    
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
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

// @route   DELETE /api/doctors/:id
// @desc    Delete doctor (admin only - can add role check)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
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

// @route   GET /api/doctors/specialties/list
// @desc    Get list of unique specialties
// @access  Private
router.get('/specialties/list', async (req, res) => {
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

module.exports = router;

