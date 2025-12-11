const express = require('express');
const MedicationRequest = require('../models/MedicationRequest');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all medication requests for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = { userId: req.userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await MedicationRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicationRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get medication requests error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch medication requests', 
      error: error.message 
    });
  }
});

// Create new medication request
router.post('/', auth, async (req, res) => {
  try {
    // Validation
    if (!req.body.pharmacyID) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy ID is required'
      });
    }

    if (!req.body.prescriptionFileURL) {
      return res.status(400).json({
        success: false,
        message: 'Prescription file URL is required'
      });
    }

    if (!req.body.patientInfo || !req.body.patientInfo.name || !req.body.patientInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Patient information (name and phone) is required'
      });
    }

    // Verify pharmacy exists and has pharmacy role
    const User = require('../models/User');
    const pharmacy = await User.findById(req.body.pharmacyID);
    if (!pharmacy || pharmacy.role !== 'pharmacy') {
      return res.status(400).json({
        success: false,
        message: 'Invalid pharmacy ID or pharmacy not found'
      });
    }

    const requestData = {
      ...req.body,
      userId: req.userId,
      status: 'pending' // Always start as pending
    };

    const medicationRequest = new MedicationRequest(requestData);
    await medicationRequest.save();

    // Create notification for pharmacy
    const Notification = require('../models/Notification');
    const notification = new Notification({
      userId: req.body.pharmacyID,
      type: 'medication_reminder',
      title: 'New Medication Request',
      message: `You have received a new medication request (${medicationRequest.requestId}) from ${req.body.patientInfo.name}`,
      priority: 'high',
      actionUrl: `/pharmacy-dashboard`,
      metadata: {
        medicationRequestId: medicationRequest._id
      }
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Medication request created successfully',
      data: medicationRequest
    });
  } catch (error) {
    console.error('Create medication request error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to create medication request', 
      error: error.message 
    });
  }
});

module.exports = router;