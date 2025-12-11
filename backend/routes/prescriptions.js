const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { auth } = require('../middleware/auth');

// Get all prescriptions for user
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.user || {};
    const query = role === 'doctor' 
      ? { doctorId: req.userId }
      : { patientId: req.userId };

    const { page = 1, limit = 50, status } = req.query;

    if (status && status !== 'all') {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'name email phone image specialty licenseId')
      .populate('patientId', 'name email phone image')
      .populate('appointmentId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.json({
      success: true,
      data: prescriptions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
});

// Get prescription by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'name email phone image specialty licenseId')
      .populate('patientId', 'name email phone image')
      .populate('appointmentId');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Verify user has access
    const { role } = req.user || {};
    const hasAccess = role === 'doctor' 
      ? prescription.doctorId._id.toString() === req.userId
      : prescription.patientId._id.toString() === req.userId;

    if (!hasAccess && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription',
      error: error.message
    });
  }
});

// Create new prescription (doctor only)
router.post('/', auth, async (req, res) => {
  try {
    const { role } = req.user || {};
    
    if (role !== 'doctor' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create prescriptions'
      });
    }

    const prescriptionData = {
      ...req.body,
      doctorId: req.userId
    };

    const prescription = new Prescription(prescriptionData);
    await prescription.save();

    await prescription.populate('doctorId', 'name email phone image specialty licenseId');
    await prescription.populate('patientId', 'name email phone image');
    await prescription.populate('appointmentId');

    res.status(201).json({
      success: true,
      data: prescription,
      message: 'Prescription created successfully'
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating prescription',
      error: error.message
    });
  }
});

// Update prescription (doctor only)
router.put('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const { role } = req.user || {};
    
    // Only doctor who created it or admin can update
    if (prescription.doctorId.toString() !== req.userId && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    Object.assign(prescription, req.body);
    await prescription.save();

    await prescription.populate('doctorId', 'name email phone image specialty licenseId');
    await prescription.populate('patientId', 'name email phone image');
    await prescription.populate('appointmentId');

    res.json({
      success: true,
      data: prescription,
      message: 'Prescription updated successfully'
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating prescription',
      error: error.message
    });
  }
});

// Delete prescription (doctor or admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const { role } = req.user || {};
    
    // Only doctor who created it or admin can delete
    if (prescription.doctorId.toString() !== req.userId && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await prescription.deleteOne();

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting prescription',
      error: error.message
    });
  }
});

// Get prescriptions by appointment
router.get('/appointment/:appointmentId', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      appointmentId: req.params.appointmentId 
    })
      .populate('doctorId', 'name email phone image specialty licenseId')
      .populate('patientId', 'name email phone image')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching prescriptions by appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
});

module.exports = router;

