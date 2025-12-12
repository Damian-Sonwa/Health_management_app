const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/chats
// @desc    Get chat messages - UNIFIED ENDPOINT
//          Query params: pharmacyId, patientId (for general chat)
//          OR: medicalRequestId (for order-specific chat)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { pharmacyId, patientId, medicalRequestId } = req.query;
    
    let query = {};
    
    // ORDER-SPECIFIC CHAT (preferred)
    if (medicalRequestId) {
      // Verify user has access to this order
      const MedicationRequest = require('../models/MedicationRequest');
      const request = await MedicationRequest.findById(medicalRequestId);
      
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Check access
      if (userRole === 'patient' && request.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (userRole === 'pharmacy' && request.pharmacyID.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (userRole !== 'admin' && userRole !== 'patient' && userRole !== 'pharmacy') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Fetch messages for this order
      query = {
        $or: [
          { medicalRequestId: medicalRequestId },
          { requestId: medicalRequestId },
          { orderId: medicalRequestId }
        ]
      };
    }
    // GENERAL CHAT (pharmacy + patient)
    else if (pharmacyId && patientId) {
      // Verify access
      if (userRole === 'patient' && patientId !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (userRole === 'pharmacy' && pharmacyId !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // General chat: pharmacyId + patientId, NO medicalRequestId
      query = {
        pharmacyId: pharmacyId,
        patientId: patientId,
        $or: [
          { medicalRequestId: { $exists: false } },
          { medicalRequestId: null },
          { orderId: { $exists: false } },
          { orderId: null }
        ]
      };
    }
    // PHARMACY GETS ALL THEIR CHATS (when only pharmacyId provided)
    else if (pharmacyId && userRole === 'pharmacy' && pharmacyId === userId.toString()) {
      query = {
        pharmacyId: pharmacyId
      };
    }
    // PATIENT GETS ALL THEIR CHATS (when only patientId provided)
    else if (patientId && userRole === 'patient' && patientId === userId.toString()) {
      query = {
        patientId: patientId
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either medicalRequestId, or both pharmacyId and patientId, or pharmacyId (for pharmacy role), or patientId (for patient role) required'
      });
    }
    
    // Fetch messages
    const messages = await Chat.find(query)
      .populate('senderId', 'name email phone image role')
      .populate('receiverId', 'name email phone image role')
      .sort({ createdAt: 1 })
      .limit(1000);
    
    res.json({
      success: true,
      messages: messages,
      data: messages
    });
  } catch (error) {
    console.error('GET /api/chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// @route   GET /api/chats/history/:medicalRequestId
// @desc    Get chat history for specific order (backward compatibility)
// @access  Private
router.get('/history/:medicalRequestId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const medicalRequestId = req.params.medicalRequestId;
    const userRole = req.user.role;
    
    const MedicationRequest = require('../models/MedicationRequest');
    const request = await MedicationRequest.findById(medicalRequestId);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check access
    if (userRole === 'patient' && request.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (userRole === 'pharmacy' && request.pharmacyID.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const messages = await Chat.find({
      $or: [
        { medicalRequestId: medicalRequestId },
        { requestId: medicalRequestId },
        { orderId: medicalRequestId }
      ]
    })
      .populate('senderId', 'name email phone image role')
      .populate('receiverId', 'name email phone image role')
      .sort({ createdAt: 1 })
      .limit(1000);
    
    res.json({ success: true, messages, data: messages });
  } catch (error) {
    console.error('GET /api/chats/history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history', error: error.message });
  }
});

// @route   POST /api/chats
// @desc    Send a message - UNIFIED
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { pharmacyId, patientId, medicalRequestId, message } = req.body;
    const senderId = req.user.userId;
    const senderRole = req.user.role;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    // Determine receiver based on sender role
    let receiverId;
    let actualPharmacyId, actualPatientId;
    
    if (senderRole === 'patient') {
      if (!pharmacyId) {
        return res.status(400).json({ success: false, message: 'pharmacyId is required' });
      }
      receiverId = pharmacyId;
      actualPatientId = senderId;
      actualPharmacyId = pharmacyId;
    } else if (senderRole === 'pharmacy') {
      if (!patientId) {
        return res.status(400).json({ success: false, message: 'patientId is required' });
      }
      receiverId = patientId;
      actualPharmacyId = senderId;
      actualPatientId = patientId;
    } else {
      return res.status(403).json({ success: false, message: 'Only patients and pharmacies can send messages' });
    }
    
    // Generate room ID
    let roomId;
    if (medicalRequestId) {
      // Order-specific room
      roomId = Chat.getPharmacyRequestRoomId 
        ? Chat.getPharmacyRequestRoomId(actualPharmacyId, medicalRequestId)
        : `pharmacy_${actualPharmacyId}_request_${medicalRequestId}`;
    } else {
      // General chat room (sorted IDs)
      roomId = Chat.getRoomId 
        ? Chat.getRoomId(actualPharmacyId, actualPatientId)
        : [actualPharmacyId, actualPatientId].sort().join('_');
    }
    
    const User = require('../models/User');
    const sender = await User.findById(senderId);
    
    const chatMessage = new Chat({
      senderId,
      senderModel: 'User',
      receiverId,
      receiverModel: 'User',
      message: message.trim(),
      senderName: sender?.name || (senderRole === 'patient' ? 'Patient' : 'Pharmacy'),
      roomId,
      pharmacyId: actualPharmacyId,
      patientId: actualPatientId,
      medicalRequestId: medicalRequestId || null,
      requestId: medicalRequestId || null,
      orderId: medicalRequestId || null,
      senderRole,
      messageType: 'text'
    });
    
    await chatMessage.save();
    await chatMessage.populate('senderId', 'name email phone image role');
    await chatMessage.populate('receiverId', 'name email phone image role');
    
    const populatedMsg = chatMessage.toObject();
    const fullMessage = {
      _id: chatMessage._id.toString(),
      message: chatMessage.message,
      senderRole,
      senderName: chatMessage.senderName,
      timestamp: chatMessage.createdAt,
      createdAt: chatMessage.createdAt,
      pharmacyId: actualPharmacyId.toString(),
      patientId: actualPatientId.toString(),
      senderId: senderId.toString(),
      receiverId: receiverId.toString(),
      medicalRequestId: medicalRequestId ? medicalRequestId.toString() : null,
      orderId: medicalRequestId ? medicalRequestId.toString() : null,
      roomId,
      senderId_obj: populatedMsg.senderId,
      receiverId_obj: populatedMsg.receiverId
    };
    
    // Emit via Socket.IO (handled by server.js)
    const io = req.app.get('socketio');
    if (io) {
      // Emit to unified rooms
      io.to(`pharmacy-room-${actualPharmacyId}`).emit('newMessage', fullMessage);
      io.to(`patient-room-${actualPatientId}`).emit('newMessage', fullMessage);
      if (medicalRequestId) {
        io.to(`order-room-${medicalRequestId}`).emit('newMessage', fullMessage);
      }
      // Also emit to roomId for direct room access
      io.to(roomId).emit('newMessage', fullMessage);
    }
    
    res.status(201).json({ success: true, data: fullMessage, message: 'Message sent successfully' });
  } catch (error) {
    console.error('POST /api/chats error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
});

module.exports = router;
