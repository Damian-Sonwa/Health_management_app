const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Private
router.get('/', async (req, res) => {
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

