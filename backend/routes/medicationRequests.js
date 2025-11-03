const express = require('express');
const MedicationRequest = require('../models/MedicationRequest');
const auth = require('../middleware/auth');

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
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
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
    const requestData = {
      ...req.body,
      userId: req.userId
    };

    const medicationRequest = new MedicationRequest(requestData);
    await medicationRequest.save();

    res.status(201).json({
      message: 'Medication request created successfully',
      request: medicationRequest
    });
  } catch (error) {
    console.error('Create medication request error:', error);
    res.status(400).json({ 
      message: 'Failed to create medication request', 
      error: error.message 
    });
  }
});

module.exports = router;