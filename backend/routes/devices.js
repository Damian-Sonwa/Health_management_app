const express = require('express');
const Device = require('../models/Device');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all devices for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices',
      error: error.message
    });
  }
});

// Create new device reading
router.post('/', auth, async (req, res) => {
  try {
    const { deviceType, reading } = req.body;

    const device = new Device({
      userId: req.user.id,
      deviceType,
      reading
    });

    await device.save();

    res.status(201).json({
      success: true,
      message: 'Device reading created successfully',
      data: device
    });
  } catch (error) {
    console.error('Error creating device reading:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create device reading',
      error: error.message
    });
  }
});

// Update device reading
router.put('/:id', auth, async (req, res) => {
  try {
    const { deviceType, reading } = req.body;

    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { deviceType, reading },
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device reading not found'
      });
    }

    res.json({
      success: true,
      message: 'Device reading updated successfully',
      data: device
    });
  } catch (error) {
    console.error('Error updating device reading:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update device reading',
      error: error.message
    });
  }
});

// Delete device reading
router.delete('/:id', auth, async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device reading not found'
      });
    }

    res.json({
      success: true,
      message: 'Device reading deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device reading:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete device reading',
      error: error.message
    });
  }
});

module.exports = router;