const express = require('express');
const router = express.Router();
const VideoCallSession = require('../models/VideoCallSession');
const { auth } = require('../middleware/auth');

// Get all video call sessions for user
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.user || {};
    const query = role === 'doctor' 
      ? { doctorId: req.userId }
      : { patientId: req.userId };

    const sessions = await VideoCallSession.find(query)
      .populate('doctorId', 'name email phone image specialty')
      .populate('patientId', 'name email phone image')
      .populate('appointmentId')
      .sort({ startTime: -1 })
      .limit(100);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching video call sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video call sessions',
      error: error.message
    });
  }
});

// Get video call session by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await VideoCallSession.findById(req.params.id)
      .populate('doctorId', 'name email phone image specialty')
      .populate('patientId', 'name email phone image')
      .populate('appointmentId');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Video call session not found'
      });
    }

    // Verify user has access to this session
    const { role } = req.user || {};
    const hasAccess = role === 'doctor' 
      ? session.doctorId._id.toString() === req.userId
      : session.patientId._id.toString() === req.userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching video call session:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video call session',
      error: error.message
    });
  }
});

// Create new video call session
router.post('/', auth, async (req, res) => {
  try {
    const { role } = req.user || {};
    const sessionData = {
      ...req.body,
      [role === 'doctor' ? 'doctorId' : 'patientId']: req.userId
    };

    const session = new VideoCallSession(sessionData);
    await session.save();

    await session.populate('doctorId', 'name email phone image specialty');
    await session.populate('patientId', 'name email phone image');
    await session.populate('appointmentId');

    res.status(201).json({
      success: true,
      data: session,
      message: 'Video call session created successfully'
    });
  } catch (error) {
    console.error('Error creating video call session:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating video call session',
      error: error.message
    });
  }
});

// Update video call session (e.g., join, end)
router.put('/:id', auth, async (req, res) => {
  try {
    const session = await VideoCallSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Video call session not found'
      });
    }

    // Verify user has access
    const { role } = req.user || {};
    const hasAccess = role === 'doctor' 
      ? session.doctorId.toString() === req.userId
      : session.patientId.toString() === req.userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update session
    if (req.body.status === 'joined' && session.status === 'initiated') {
      session.status = 'joined';
    } else if (req.body.status === 'ended') {
      session.status = 'ended';
      session.endTime = new Date();
    }

    Object.assign(session, req.body);
    await session.save();

    await session.populate('doctorId', 'name email phone image specialty');
    await session.populate('patientId', 'name email phone image');
    await session.populate('appointmentId');

    res.json({
      success: true,
      data: session,
      message: 'Video call session updated successfully'
    });
  } catch (error) {
    console.error('Error updating video call session:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video call session',
      error: error.message
    });
  }
});

// Get active video call sessions
router.get('/active/list', auth, async (req, res) => {
  try {
    const { role } = req.user || {};
    const query = {
      status: { $in: ['initiated', 'joined'] },
      [role === 'doctor' ? 'doctorId' : 'patientId']: req.userId
    };

    const activeSessions = await VideoCallSession.find(query)
      .populate('doctorId', 'name email phone image specialty')
      .populate('patientId', 'name email phone image')
      .populate('appointmentId')
      .sort({ startTime: -1 });

    res.json({
      success: true,
      data: activeSessions
    });
  } catch (error) {
    console.error('Error fetching active video call sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active video call sessions',
      error: error.message
    });
  }
});

module.exports = router;

