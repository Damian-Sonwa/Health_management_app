const express = require('express');
const Medication = require('../models/Medication');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all medications for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: medications
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medications',
      error: error.message
    });
  }
});

// Create new medication request
router.post('/', auth, async (req, res) => {
  try {
    const { prescriptionFile, paymentReceipt, deliveryAddress } = req.body;

    const medication = new Medication({
      userId: req.user.id,
      prescriptionFile,
      paymentReceipt,
      deliveryAddress,
      status: 'pending'
    });

    await medication.save();

    res.status(201).json({
      success: true,
      message: 'Medication request created successfully',
      data: medication
    });
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create medication request',
      error: error.message
    });
  }
});

// Update medication request
router.put('/:id', auth, async (req, res) => {
  try {
    const { prescriptionFile, paymentReceipt, deliveryAddress, status } = req.body;

    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { prescriptionFile, paymentReceipt, deliveryAddress, status },
      { new: true, runValidators: true }
    );

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication request not found'
      });
    }

    res.json({
      success: true,
      message: 'Medication request updated successfully',
      data: medication
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update medication request',
      error: error.message
    });
  }
});

// Delete medication request
router.delete('/:id', auth, async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication request not found'
      });
    }

    res.json({
      success: true,
      message: 'Medication request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medication request',
      error: error.message
    });
  }
});

module.exports = router;