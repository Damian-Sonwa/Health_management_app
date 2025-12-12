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
    
    // Verify user is part of this room (roomId format: smallerId_largerId)
    const roomParts = roomId.split('_');
    if (roomParts.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format'
      });
    }
    
    const userIdStr = userId.toString();
    if (roomParts[0] !== userIdStr && roomParts[1] !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not part of this chat room'
      });
    }
    
    const messages = await Chat.find({ roomId })
      .populate('senderId', 'name email phone image role')
      .populate('receiverId', 'name email phone image role')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages
    
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

module.exports = router;

