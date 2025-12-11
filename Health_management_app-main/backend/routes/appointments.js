const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all appointments for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, upcoming } = req.query;
    
    const query = { userId: req.userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.appointmentDate = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'confirmed'] };
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch appointments', 
      error: error.message 
    });
  }
});

// Create new appointment
router.post('/', auth, async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      userId: req.userId
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(400).json({ 
      message: 'Failed to create appointment', 
      error: error.message 
    });
  }
});

module.exports = router;