const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/chats/room/:roomId
// @desc    Get chat history by roomId
// @access  Private
router.get('/room/:roomId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const roomId = req.params.roomId;
    
    // Verify user is part of this room
    // Support both formats:
    // 1. Old format: smallerId_largerId (for doctor-patient chats)
    // 2. New format: pharmacy_{pharmacyId}_request_{medicalRequestId} (for pharmacy-request chats)
    const roomParts = roomId.split('_');
    let hasAccess = false;
    
    if (roomId.startsWith('pharmacy_') && roomParts.length >= 4) {
      // New format: pharmacy_{pharmacyId}_request_{medicalRequestId}
      const pharmacyIdFromRoom = roomParts[1];
      const userIdStr = userId.toString();
      
      // Check if user is the pharmacy or the patient
      if (pharmacyIdFromRoom === userIdStr) {
        hasAccess = true; // User is the pharmacy
      } else {
        // Check if user is the patient by verifying the medication request
        try {
          const MedicationRequest = require('../models/MedicationRequest');
          // medicalRequestId is everything after "pharmacy_{pharmacyId}_request_"
          const requestIndex = roomParts.indexOf('request');
          if (requestIndex !== -1 && requestIndex < roomParts.length - 1) {
            const medicalRequestId = roomParts.slice(requestIndex + 1).join('_');
            const request = await MedicationRequest.findById(medicalRequestId);
            if (request && request.userId.toString() === userIdStr) {
              hasAccess = true; // User is the patient
            }
          }
        } catch (err) {
          console.error('Error checking medication request access:', err);
        }
      }
    } else if (roomParts.length === 2) {
      // Old format: smallerId_largerId
      const userIdStr = userId.toString();
      if (roomParts[0] === userIdStr || roomParts[1] === userIdStr) {
        hasAccess = true;
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not part of this chat room'
      });
    }
    
    // Fetch ALL messages in the room for full conversation history
    // Sort by creation date ascending to show chronological order
    const messages = await Chat.find({ roomId })
      .populate('senderId', 'name email phone image role')
      .populate('receiverId', 'name email phone image role')
      .sort({ createdAt: 1 })
      .limit(1000); // Increased limit to 1000 messages for full conversation history
    
    res.json({
      success: true,
      messages: messages,
      data: messages, // For backward compatibility
      roomId
    });
  } catch (error) {
    console.error('GET chat history by roomId error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
});

// @route   GET /api/chats/:doctorId
// @desc    Get chat history with a specific doctor/pharmacy
// @access  Private
router.get('/:doctorId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const doctorId = req.params.doctorId;
    const roomId = Chat.getRoomId(userId, doctorId);
    
    // Fetch ALL messages in the room for full conversation history
    const messages = await Chat.find({ roomId })
      .populate('senderId', 'name email phone image role')
      .populate('receiverId', 'name email phone image role')
      .sort({ createdAt: 1 })
      .limit(1000); // Increased limit to 1000 messages for full conversation history
    
    res.json({
      success: true,
      messages: messages,
      data: messages, // For backward compatibility
      roomId
    });
  } catch (error) {
    console.error('GET chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
});

// @route   POST /api/chats
// @desc    Send a new message
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { receiverId, message, receiverModel = 'Doctor' } = req.body;
    const senderId = req.user.userId;
    const roomId = Chat.getRoomId(senderId, receiverId);
    
    const chatMessage = new Chat({
      senderId,
      senderModel: 'User',
      receiverId,
      receiverModel,
      message,
      roomId
    });
    
    await chatMessage.save();
    
    res.status(201).json({
      success: true,
      data: chatMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('POST chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// @route   PUT /api/chats/:roomId/read
// @desc    Mark messages as read
// @access  Private
router.put('/:roomId/read', async (req, res) => {
  try {
    const userId = req.user.userId;
    const roomId = req.params.roomId;
    
    await Chat.updateMany(
      { 
        roomId,
        receiverId: userId,
        isRead: false
      },
      { $set: { isRead: true } }
    );
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('PUT mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// @route   GET /api/chats/unread/count
// @desc    Get unread message count
// @access  Private
router.get('/unread/count', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const count = await Chat.countDocuments({
      receiverId: userId,
      isRead: false
    });
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('GET unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

// @route   GET /api/chats/history/:medicalRequestId
// @desc    Get chat history for a specific medication request
// @access  Private
router.get('/history/:medicalRequestId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const medicalRequestId = req.params.medicalRequestId;
    const userRole = req.user.role;
    
    // Verify user has access to this request
    const MedicationRequest = require('../models/MedicationRequest');
    const request = await MedicationRequest.findById(medicalRequestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Medication request not found'
      });
    }
    
    // Check access: patient can see their own requests, pharmacy can see requests assigned to them
    if (userRole === 'patient') {
      if (request.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view chats for your own requests'
        });
      }
    } else if (userRole === 'pharmacy') {
      if (request.pharmacyID.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view chats for requests assigned to your pharmacy'
        });
      }
    } else if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Generate room ID
    const pharmacyId = request.pharmacyID;
    const roomId = Chat.getPharmacyRequestRoomId ? 
      Chat.getPharmacyRequestRoomId(pharmacyId, medicalRequestId) : 
      `pharmacy_${pharmacyId}_request_${medicalRequestId}`;
    
    // Fetch all messages for this request, ordered by timestamp
    const messages = await Chat.find({ 
      $or: [
        { roomId: roomId },
        { medicalRequestId: medicalRequestId },
        { requestId: medicalRequestId }
      ]
    })
      .populate('senderId', 'name email phone image role')
      .populate('receiverId', 'name email phone image role')
      .sort({ createdAt: 1 })
      .limit(1000);
    
    res.json({
      success: true,
      messages: messages,
      data: messages, // For backward compatibility
      roomId: roomId,
      medicalRequestId: medicalRequestId
    });
  } catch (error) {
    console.error('GET chat history by medicalRequestId error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
});

module.exports = router;

