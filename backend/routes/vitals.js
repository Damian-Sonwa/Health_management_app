const express = require('express');
const Vital = require('../models/Vital');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all vitals for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const vitals = await Vital.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: vitals
    });
  } catch (error) {
    console.error('Error fetching vitals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vitals',
      error: error.message
    });
  }
});

// Create new vital reading
router.post('/', auth, async (req, res) => {
  try {
    const { bloodPressure, pulse, temperature } = req.body;

    const vital = new Vital({
      userId: req.user.id,
      bloodPressure,
      pulse,
      temperature
    });

    await vital.save();

    res.status(201).json({
      success: true,
      message: 'Vital reading created successfully',
      data: vital
    });
  } catch (error) {
    console.error('Error creating vital:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create vital reading',
      error: error.message
    });
  }
});

// Update vital reading
router.put('/:id', auth, async (req, res) => {
  try {
    const { bloodPressure, pulse, temperature } = req.body;

    const vital = await Vital.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { bloodPressure, pulse, temperature },
      { new: true, runValidators: true }
    );

    if (!vital) {
      return res.status(404).json({
        success: false,
        message: 'Vital reading not found'
      });
    }

    res.json({
      success: true,
      message: 'Vital reading updated successfully',
      data: vital
    });
  } catch (error) {
    console.error('Error updating vital:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update vital reading',
      error: error.message
    });
  }
});

// Delete vital reading
router.delete('/:id', auth, async (req, res) => {
  try {
    const vital = await Vital.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!vital) {
      return res.status(404).json({
        success: false,
        message: 'Vital reading not found'
      });
    }

    res.json({
      success: true,
      message: 'Vital reading deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vital:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vital reading',
      error: error.message
    });
  }
});

module.exports = router;