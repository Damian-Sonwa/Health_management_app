const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user subscription details
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch subscription details', 
      error: error.message 
    });
  }
});

// Upgrade to premium
router.post('/upgrade', auth, async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          'subscription.plan': 'premium',
          'subscription.status': 'active'
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Successfully upgraded to premium',
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ 
      message: 'Failed to upgrade subscription', 
      error: error.message 
    });
  }
});

module.exports = router;