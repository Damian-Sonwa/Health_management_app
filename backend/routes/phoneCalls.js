const express = require('express');
const router = express.Router();
const PhoneCallLog = require('../models/PhoneCallLog');
const { auth } = require('../middleware/auth');

// Get all phone call logs for user
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.user || {};
    const query = role === 'doctor' 
      ? { doctorId: req.userId }
      : { patientId: req.userId };

    const { page = 1, limit = 50, status, callType } = req.query;

    if (status && status !== 'all') {
      query.status = status;
    }

    if (callType && callType !== 'all') {
      query.callType = callType;
    }

    const calls = await PhoneCallLog.find(query)
      .populate('doctorId', 'name email phone image specialty')
      .populate('patientId', 'name email phone image')
      .populate('appointmentId')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PhoneCallLog.countDocuments(query);

    res.json({
      success: true,
      data: calls,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching phone call logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching phone call logs',
      error: error.message
    });
  }
});

// Get phone call log by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const call = await PhoneCallLog.findById(req.params.id)
      .populate('doctorId', 'name email phone image specialty')
      .populate('patientId', 'name email phone image')
      .populate('appointmentId');

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Phone call log not found'
      });
    }

    // Verify user has access
    const { role } = req.user || {};
    const hasAccess = role === 'doctor' 
      ? call.doctorId._id.toString() === req.userId
      : call.patientId._id.toString() === req.userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: call
    });
  } catch (error) {
    console.error('Error fetching phone call log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching phone call log',
      error: error.message
    });
  }
});

// Create new phone call log
router.post('/', auth, async (req, res) => {
  try {
    const { role } = req.user || {};
    const callData = {
      ...req.body,
      [role === 'doctor' ? 'doctorId' : 'patientId']: req.userId,
      startTime: req.body.startTime || new Date()
    };

    const call = new PhoneCallLog(callData);
    await call.save();

    await call.populate('doctorId', 'name email phone image specialty');
    await call.populate('patientId', 'name email phone image');
    await call.populate('appointmentId');

    res.status(201).json({
      success: true,
      data: call,
      message: 'Phone call log created successfully'
    });
  } catch (error) {
    console.error('Error creating phone call log:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating phone call log',
      error: error.message
    });
  }
});

// Update phone call log (e.g., end call, update duration)
router.put('/:id', auth, async (req, res) => {
  try {
    const call = await PhoneCallLog.findById(req.params.id);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Phone call log not found'
      });
    }

    // Verify user has access
    const { role } = req.user || {};
    const hasAccess = role === 'doctor' 
      ? call.doctorId.toString() === req.userId
      : call.patientId.toString() === req.userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update end time and calculate duration if ending call
    if (req.body.endTime && !call.endTime) {
      call.endTime = new Date(req.body.endTime);
      if (call.startTime) {
        call.duration = Math.floor((call.endTime - call.startTime) / 1000);
      }
    }

    Object.assign(call, req.body);
    await call.save();

    await call.populate('doctorId', 'name email phone image specialty');
    await call.populate('patientId', 'name email phone image');
    await call.populate('appointmentId');

    res.json({
      success: true,
      data: call,
      message: 'Phone call log updated successfully'
    });
  } catch (error) {
    console.error('Error updating phone call log:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating phone call log',
      error: error.message
    });
  }
});

// Get call statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { role } = req.user || {};
    const query = role === 'doctor' 
      ? { doctorId: req.userId }
      : { patientId: req.userId };

    const totalCalls = await PhoneCallLog.countDocuments(query);
    const completedCalls = await PhoneCallLog.countDocuments({ ...query, status: 'completed' });
    const missedCalls = await PhoneCallLog.countDocuments({ ...query, status: 'missed' });
    
    const totalDuration = await PhoneCallLog.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalCalls,
        completedCalls,
        missedCalls,
        totalDurationSeconds: totalDuration[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching call statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call statistics',
      error: error.message
    });
  }
});

module.exports = router;

