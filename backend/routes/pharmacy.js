const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MedicationRequest = require('../models/MedicationRequest');
const PharmacyResponse = require('../models/PharmacyResponse');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// A. Fetch requests assigned to a specific pharmacy
// GET /api/pharmacy/:id/requests
router.get('/:id/requests', auth, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    const { role, userId } = req.user || {};
    
    console.log(`📋 GET /api/pharmacy/${pharmacyId}/requests - User: ${userId}, Role: ${role}`);
    
    // Ensure pharmacy can only access their own requests (unless admin)
    if (role !== 'admin' && pharmacyId !== userId.toString()) {
      console.log(`⚠️ Access denied: pharmacyId (${pharmacyId}) !== userId (${userId})`);
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own pharmacy requests'
      });
    }

    const { page = 1, limit = 20, status, date } = req.query;
    
    // Convert pharmacyId to ObjectId for proper querying
    // Try to match both ObjectId format and string format
    const pharmacyObjectId = mongoose.Types.ObjectId.isValid(pharmacyId) 
      ? new mongoose.Types.ObjectId(pharmacyId) 
      : null;
    
    // Also check if pharmacyId matches a Pharmacy document's userId
    // In case some requests were created with Pharmacy._id instead of User._id
    const Pharmacy = require('../models/Pharmacy');
    let pharmacyDoc = null;
    try {
      // First, try to find pharmacy by userId
      pharmacyDoc = await Pharmacy.findOne({ userId: pharmacyId });
      if (!pharmacyDoc) {
        // If not found, try by _id (in case pharmacyId is actually a Pharmacy _id)
        pharmacyDoc = await Pharmacy.findById(pharmacyId);
      }
    } catch (err) {
      console.log('⚠️ Error looking up pharmacy:', err.message);
    }
    
    // Build query - try both ObjectId and string formats
    // Also include Pharmacy._id if it exists (for legacy data)
    const queryConditions = [
      ...(pharmacyObjectId ? [{ pharmacyID: pharmacyObjectId }] : []),
      { pharmacyID: pharmacyId }
    ];
    
    // If we found a Pharmacy document, also try matching by its _id
    if (pharmacyDoc && pharmacyDoc._id) {
      queryConditions.push({ pharmacyID: pharmacyDoc._id });
      queryConditions.push({ pharmacyID: pharmacyDoc._id.toString() });
    }
    
    const query = {
      $or: queryConditions
    };
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    console.log(`📋 Query:`, JSON.stringify(query, null, 2));
    
    // Debug: Check what pharmacyIDs exist in the database
    const allRequests = await MedicationRequest.find({}).select('pharmacyID').limit(5).lean();
    console.log(`📋 Sample pharmacyIDs in database:`, allRequests.map(r => ({
      pharmacyID: r.pharmacyID,
      pharmacyIDType: typeof r.pharmacyID,
      pharmacyIDString: r.pharmacyID?.toString()
    })));

    const requests = await MedicationRequest.find(query)
      .populate('userId', 'name email phone image')
      .populate('pharmacyID', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicationRequest.countDocuments(query);

    console.log(`📋 Found ${requests.length} requests (total: ${total}) for pharmacy ${pharmacyId}`);
    console.log(`📋 Request IDs found:`, requests.map(r => r._id.toString()));

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
    console.error('❌ Get pharmacy requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacy requests',
      error: error.message
    });
  }
});

// B. Confirm a medical request
// PATCH /api/pharmacy/medical-request/:id/confirm
router.patch('/medical-request/:id/confirm', auth, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const { role, userId } = req.user || {};
    
    const medicationRequest = await MedicationRequest.findById(requestId);
    
    if (!medicationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Medication request not found'
      });
    }

    // Ensure only the assigned pharmacy can confirm (unless admin)
    if (role !== 'admin' && medicationRequest.pharmacyID.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only confirm requests assigned to your pharmacy'
      });
    }

    // Update status to confirmed
    medicationRequest.status = 'confirmed';
    medicationRequest.statusHistory.push({
      status: 'confirmed',
      updatedBy: userId,
      notes: req.body.notes || 'Request confirmed by pharmacy',
      timestamp: new Date()
    });
    
    await medicationRequest.save();

    // Create pharmacy response record
    const pharmacyResponse = new PharmacyResponse({
      medicationRequestId: requestId,
      pharmacyId: medicationRequest.pharmacyID,
      patientId: medicationRequest.userId,
      responseType: 'confirmation',
      message: req.body.message || 'Your medication request has been confirmed',
      notes: req.body.notes
    });
    await pharmacyResponse.save();

    // Create notification for patient
    const notification = new Notification({
      userId: medicationRequest.userId,
      type: 'medication_reminder',
      title: 'Medication Request Confirmed',
      message: `Your medication request (${medicationRequest.requestId}) has been confirmed by the pharmacy.`,
      priority: 'high',
      actionUrl: `/medication-request`,
      metadata: {
        medicationRequestId: requestId
      }
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Medication request confirmed successfully',
      data: medicationRequest
    });
  } catch (error) {
    console.error('Confirm medication request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm medication request',
      error: error.message
    });
  }
});

// C. Delete a medical request (reject)
// DELETE /api/pharmacy/medical-request/:id
router.delete('/medical-request/:id', auth, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const { role, userId } = req.user || {};
    
    const medicationRequest = await MedicationRequest.findById(requestId);
    
    if (!medicationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Medication request not found'
      });
    }

    // Ensure only the assigned pharmacy can delete (unless admin)
    if (role !== 'admin' && medicationRequest.pharmacyID.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete requests assigned to your pharmacy'
      });
    }

    // Instead of deleting, mark as rejected
    medicationRequest.status = 'rejected';
    medicationRequest.statusHistory.push({
      status: 'rejected',
      updatedBy: userId,
      notes: req.body.reason || 'Request rejected by pharmacy',
      timestamp: new Date()
    });
    
    await medicationRequest.save();

    // Create pharmacy response record
    const pharmacyResponse = new PharmacyResponse({
      medicationRequestId: requestId,
      pharmacyId: medicationRequest.pharmacyID,
      patientId: medicationRequest.userId,
      responseType: 'rejection',
      message: req.body.message || 'Your medication request has been rejected',
      notes: req.body.reason
    });
    await pharmacyResponse.save();

    // Create notification for patient
    const notification = new Notification({
      userId: medicationRequest.userId,
      type: 'medication_reminder',
      title: 'Medication Request Rejected',
      message: `Your medication request (${medicationRequest.requestId}) has been rejected by the pharmacy.`,
      priority: 'medium',
      actionUrl: `/medication-request`,
      metadata: {
        medicationRequestId: requestId
      }
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Medication request rejected successfully',
      data: medicationRequest
    });
  } catch (error) {
    console.error('Delete medication request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject medication request',
      error: error.message
    });
  }
});

// D. Initiate a call to the patient
// POST /api/pharmacy/medical-request/:id/call
router.post('/medical-request/:id/call', auth, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const { role, userId } = req.user || {};
    
    const medicationRequest = await MedicationRequest.findById(requestId)
      .populate('userId', 'name phone email');
    
    if (!medicationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Medication request not found'
      });
    }

    // Ensure only the assigned pharmacy can call (unless admin)
    if (role !== 'admin' && medicationRequest.pharmacyID.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only call patients for requests assigned to your pharmacy'
      });
    }

    if (!medicationRequest.userId?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Patient phone number not available'
      });
    }

    // Create call log in PharmacyResponse
    const pharmacyResponse = new PharmacyResponse({
      medicationRequestId: requestId,
      pharmacyId: medicationRequest.pharmacyID,
      patientId: medicationRequest.userId._id,
      responseType: 'call',
      callLog: {
        callType: 'outgoing',
        phoneNumber: medicationRequest.userId.phone,
        status: 'initiated',
        startTime: new Date()
      },
      notes: req.body.notes || 'Pharmacy initiated call to patient'
    });
    await pharmacyResponse.save();

    // Generate call session (placeholder for Twilio/Agora/WebRTC)
    const callSession = {
      sessionId: `call_${requestId}_${Date.now()}`,
      phoneNumber: medicationRequest.userId.phone,
      patientName: medicationRequest.userId.name,
      // In production, integrate with Twilio/Agora here
      // For now, return a placeholder
      callLink: `tel:${medicationRequest.userId.phone}`,
      // Twilio example: await twilioClient.calls.create({...})
      // Agora example: await agoraClient.generateToken({...})
    };

    res.json({
      success: true,
      message: 'Call session initiated',
      data: {
        callSession,
        pharmacyResponse
      }
    });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call',
      error: error.message
    });
  }
});

// Direct patient call (without medication request)
// POST /api/pharmacy/call/patient
router.post('/call/patient', auth, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const { patientId, patientPhone, callType } = req.body;
    const { userId } = req.user || {};
    
    if (!patientId || !patientPhone) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and phone number are required'
      });
    }

    // Verify patient exists
    const patient = await User.findById(patientId).select('name phone email');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Create call log using PhoneCallLog model
    const PhoneCallLog = require('../models/PhoneCallLog');
    const callLog = new PhoneCallLog({
      pharmacyId: userId,
      patientId: patientId,
      callType: callType === 'video' ? 'video' : 'phone', // Use 'phone' or 'video'
      direction: 'outgoing', // Map to the direction field
      phoneNumber: patientPhone,
      status: 'initiated',
      startTime: new Date()
    });
    await callLog.save();

    // Generate call session (placeholder for Twilio/Agora/WebRTC)
    const callSession = {
      sessionId: `call_${callLog._id}_${Date.now()}`,
      callLogId: callLog._id.toString(),
      phoneNumber: patientPhone,
      patientName: patient.name,
      callLink: callType === 'video' ? null : `tel:${patientPhone}`,
    };

    res.json({
      success: true,
      message: 'Call session initiated',
      data: {
        callSession,
        callLog: {
          _id: callLog._id,
          status: callLog.status,
          startTime: callLog.startTime
        }
      }
    });
  } catch (error) {
    console.error('Direct patient call error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call',
      error: error.message
    });
  }
});

// Update direct call status (when call ends)
// PATCH /api/pharmacy/call/:callLogId
router.patch('/call/:callLogId', auth, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const { callLogId } = req.params;
    const { status, duration, endTime } = req.body;
    const { userId } = req.user || {};
    
    const PhoneCallLog = require('../models/PhoneCallLog');
    const callLog = await PhoneCallLog.findById(callLogId);
    
    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found'
      });
    }

    // Ensure pharmacy can only update their own calls
    const isPharmacyCall = callLog.pharmacyId && callLog.pharmacyId.toString() === userId.toString();
    const isDoctorCall = callLog.doctorId && callLog.doctorId.toString() === userId.toString();
    
    if (!isPharmacyCall && !isDoctorCall && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own calls'
      });
    }

    callLog.status = status || 'completed';
    callLog.duration = duration || 0;
    callLog.endTime = endTime ? new Date(endTime) : new Date();
    await callLog.save();

    res.json({
      success: true,
      message: 'Call log updated successfully',
      data: callLog
    });
  } catch (error) {
    console.error('Update call log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update call log',
      error: error.message
    });
  }
});

// Update call status (when call ends)
// PATCH /api/pharmacy/medical-request/:id/call/:responseId
router.patch('/medical-request/:id/call/:responseId', auth, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const { responseId } = req.params;
    const { role, userId } = req.user || {};
    
    const pharmacyResponse = await PharmacyResponse.findById(responseId)
      .populate('medicationRequestId');
    
    if (!pharmacyResponse) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found'
      });
    }

    // Ensure only the assigned pharmacy can update (unless admin)
    if (role !== 'admin' && pharmacyResponse.pharmacyId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update call log
    if (req.body.status) {
      pharmacyResponse.callLog.status = req.body.status;
    }
    if (req.body.duration) {
      pharmacyResponse.callLog.duration = req.body.duration;
    }
    if (req.body.endTime) {
      pharmacyResponse.callLog.endTime = new Date(req.body.endTime);
    } else if (req.body.status === 'completed' || req.body.status === 'missed') {
      pharmacyResponse.callLog.endTime = new Date();
      if (!pharmacyResponse.callLog.duration && pharmacyResponse.callLog.startTime) {
        pharmacyResponse.callLog.duration = Math.floor(
          (new Date() - pharmacyResponse.callLog.startTime) / 1000
        );
      }
    }
    if (req.body.recordingUrl) {
      pharmacyResponse.callLog.recordingUrl = req.body.recordingUrl;
    }

    await pharmacyResponse.save();

    res.json({
      success: true,
      message: 'Call log updated successfully',
      data: pharmacyResponse
    });
  } catch (error) {
    console.error('Update call log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update call log',
      error: error.message
    });
  }
});

// E. Upload or receive payment receipts
// POST /api/pharmacy/medical-request/:id/upload-receipt
router.post('/medical-request/:id/upload-receipt', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { role, userId } = req.user || {};
    
    const medicationRequest = await MedicationRequest.findById(requestId);
    
    if (!medicationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Medication request not found'
      });
    }

    // Ensure only the patient can upload receipts to their own request
    if (medicationRequest.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only upload receipts to your own requests'
      });
    }

    const { receiptUrl } = req.body;
    
    if (!receiptUrl) {
      return res.status(400).json({
        success: false,
        message: 'Receipt URL is required'
      });
    }

    // Update payment receipt URL
    medicationRequest.paymentReceiptURL = receiptUrl;
    medicationRequest.payment.receiptUrl = receiptUrl;
    medicationRequest.payment.receiptFileName = req.body.receiptFileName || 'receipt.pdf';
    
    // Update status to awaiting-payment if not already
    if (medicationRequest.status === 'confirmed') {
      medicationRequest.status = 'awaiting-payment';
      medicationRequest.statusHistory.push({
        status: 'awaiting-payment',
        updatedBy: userId,
        notes: 'Payment receipt uploaded by patient',
        timestamp: new Date()
      });
    }
    
    await medicationRequest.save();

    // Create notification for pharmacy
    const notification = new Notification({
      userId: medicationRequest.pharmacyID,
      type: 'medication_reminder',
      title: 'Payment Receipt Uploaded',
      message: `Patient has uploaded a payment receipt for request ${medicationRequest.requestId}`,
      priority: 'high',
      actionUrl: `/pharmacy-dashboard`,
      metadata: {
        medicationRequestId: requestId
      }
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Payment receipt uploaded successfully',
      data: medicationRequest
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload receipt',
      error: error.message
    });
  }
});

// F. Pharmacy marks payment as verified
// PATCH /api/pharmacy/medical-request/:id/verify-payment
router.patch('/medical-request/:id/verify-payment', auth, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const { role, userId } = req.user || {};
    
    const medicationRequest = await MedicationRequest.findById(requestId);
    
    if (!medicationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Medication request not found'
      });
    }

    // Ensure only the assigned pharmacy can verify payment (unless admin)
    if (role !== 'admin' && medicationRequest.pharmacyID.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only verify payments for requests assigned to your pharmacy'
      });
    }

    // Update payment status
    medicationRequest.payment.status = 'completed';
    medicationRequest.payment.paidAt = new Date();
    medicationRequest.status = 'completed';
    
    medicationRequest.statusHistory.push({
      status: 'completed',
      updatedBy: userId,
      notes: req.body.notes || 'Payment verified by pharmacy',
      timestamp: new Date()
    });
    
    await medicationRequest.save();

    // Create pharmacy response record
    const pharmacyResponse = new PharmacyResponse({
      medicationRequestId: requestId,
      pharmacyId: medicationRequest.pharmacyID,
      patientId: medicationRequest.userId,
      responseType: 'payment_verification',
      message: 'Payment has been verified',
      notes: req.body.notes || 'Payment verified and order completed'
    });
    await pharmacyResponse.save();

    // Create notification for patient
    const notification = new Notification({
      userId: medicationRequest.userId,
      type: 'medication_reminder',
      title: 'Payment Verified',
      message: `Your payment for medication request (${medicationRequest.requestId}) has been verified. Your order is now being processed.`,
      priority: 'high',
      actionUrl: `/medication-request`,
      metadata: {
        medicationRequestId: requestId
      }
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: medicationRequest
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Get call logs for a pharmacy
// GET /api/pharmacy/:id/call-logs
router.get('/:id/call-logs', auth, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    const { role, userId } = req.user || {};
    
    // Ensure pharmacy can only access their own call logs (unless admin)
    if (role !== 'admin' && pharmacyId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { limit = 50 } = req.query;
    
    const callLogs = await PharmacyResponse.getCallLogs(pharmacyId, parseInt(limit));

    res.json({
      success: true,
      data: callLogs
    });
  } catch (error) {
    console.error('Get call logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call logs',
      error: error.message
    });
  }
});

// @route   GET /api/pharmacy/:id/chat-sessions
// @desc    Get all chat sessions for a pharmacy with last message and unread count
// @access  Private (pharmacy only)
router.get('/:id/chat-sessions', auth, async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    
    // Verify the pharmacy is accessing their own data
    if (req.user.userId !== pharmacyId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get all unique chat rooms where pharmacy is sender or receiver
    const pharmacyObjectId = new mongoose.Types.ObjectId(pharmacyId);
    const chatRooms = await Chat.aggregate([
      {
        $match: {
          $or: [
            { senderId: pharmacyObjectId },
            { receiverId: pharmacyObjectId }
          ]
        }
      },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', pharmacyObjectId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Get patient info for each chat room
    const sessions = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMsg = room.lastMessage;
        const patientId = lastMsg.senderId.toString() === pharmacyId 
          ? lastMsg.receiverId 
          : lastMsg.senderId;
        
        // Get patient info
        const patient = await User.findById(patientId).select('name email phone');
        
        // Get medication request if linked
        const request = lastMsg.appointmentId 
          ? await MedicationRequest.findById(lastMsg.appointmentId).select('_id requestId status')
          : null;

        return {
          roomId: room._id,
          patientId: patientId.toString(),
          patientName: patient?.name || 'Unknown Patient',
          patientPhone: patient?.phone || '',
          patientEmail: patient?.email || '',
          lastMessage: lastMsg.message,
          lastMessageTime: lastMsg.createdAt,
          lastMessageType: lastMsg.messageType,
          unreadCount: room.unreadCount,
          requestId: request?._id?.toString(),
          requestStatus: request?.status
        };
      })
    );

    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Get pharmacy chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions',
      error: error.message
    });
  }
});

module.exports = router;

