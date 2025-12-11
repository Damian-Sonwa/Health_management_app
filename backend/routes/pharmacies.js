const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const MedicationRequest = require('../models/MedicationRequest');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Middleware to attach io instance to request
router.use((req, res, next) => {
  // io will be attached in server.js
  next();
});

// POST /api/pharmacies - Create or update pharmacy profile (for pharmacy users)
router.post('/', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { pharmacyName, phone, address, licenseId, description } = req.body;

    // Verify user is a pharmacy
    const user = await User.findById(userId);
    if (!user || user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy users can create pharmacy profiles'
      });
    }

    // Check if pharmacy record already exists
    let pharmacy = await Pharmacy.findOne({ userId });
    
    if (pharmacy) {
      // Update existing pharmacy
      pharmacy.pharmacyName = pharmacyName || pharmacy.pharmacyName;
      pharmacy.phone = phone || pharmacy.phone;
      pharmacy.address = address || pharmacy.address;
      pharmacy.licenseId = licenseId || pharmacy.licenseId;
      pharmacy.description = description || pharmacy.description;
      await pharmacy.save();
      
      res.json({
        success: true,
        message: 'Pharmacy profile updated successfully',
        data: pharmacy
      });
    } else {
      // Create new pharmacy record
      pharmacy = new Pharmacy({
        userId,
        pharmacyName: pharmacyName || user.name,
        phone: phone || user.phone,
        address: address || user.address || {},
        licenseId: licenseId || null,
        description: description || null,
        status: 'pending' // New pharmacies need admin approval
      });
      
      await pharmacy.save();
      
      res.status(201).json({
        success: true,
        message: 'Pharmacy profile created successfully',
        data: pharmacy
      });
    }
  } catch (error) {
    console.error('Create/update pharmacy profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/update pharmacy profile',
      error: error.message
    });
  }
});

// GET /api/pharmacies/:id - Get pharmacy details (only approved pharmacies visible to patients)
router.get('/:id', async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    
    // Try to find by Pharmacy model first (preferred)
    let pharmacy = await Pharmacy.findOne({ userId: pharmacyId })
      .populate('userId', 'name email phone image')
      .lean();
    
    // Fallback to User model if not found in Pharmacy model (for backward compatibility)
    if (!pharmacy) {
      const user = await User.findById(pharmacyId)
        .select('name email phone address pharmacyName licenseId image role')
        .lean();
      
      if (!user || user.role !== 'pharmacy') {
        return res.status(404).json({
          success: false,
          message: 'Pharmacy not found'
        });
      }
      
      // Check if pharmacy is approved (if exists in Pharmacy model)
      const pharmacyRecord = await Pharmacy.findOne({ userId: pharmacyId }).lean();
      if (pharmacyRecord && pharmacyRecord.status !== 'approved') {
        // Only allow access if user is admin or the pharmacy itself
        if (req.user?.role !== 'admin' && req.user?.userId !== pharmacyId) {
          return res.status(403).json({
            success: false,
            message: 'This pharmacy is not yet approved'
          });
        }
      }
      
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name || user.pharmacyName,
          pharmacyName: user.pharmacyName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          licenseId: user.licenseId,
          image: user.image,
          chatRoomId: `pharmacy_${pharmacyId}`
        }
      });
    }
    
    // Check if pharmacy is approved (only show to patients if approved)
    if (pharmacy.status !== 'approved') {
      // Only allow access if user is admin or the pharmacy itself
      if (req.user?.role !== 'admin' && req.user?.userId !== pharmacyId) {
        return res.status(403).json({
          success: false,
          message: 'This pharmacy is not yet approved'
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        _id: pharmacy.userId?._id || pharmacy.userId,
        name: pharmacy.userId?.name || pharmacy.pharmacyName,
        pharmacyName: pharmacy.pharmacyName,
        email: pharmacy.userId?.email || '',
        phone: pharmacy.phone || pharmacy.userId?.phone || '',
        address: typeof pharmacy.address === 'object' 
          ? `${pharmacy.address.street || ''}, ${pharmacy.address.city || ''}, ${pharmacy.address.state || ''} ${pharmacy.address.zipCode || ''}`.trim()
          : pharmacy.address || '',
        licenseId: pharmacy.licenseId,
        image: pharmacy.logo || pharmacy.userId?.image,
        status: pharmacy.status,
        chatRoomId: `pharmacy_${pharmacyId}`
      }
    });
  } catch (error) {
    console.error('Get pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacy details',
      error: error.message
    });
  }
});

// GET /api/pharmacies - Get all APPROVED pharmacies (for selection page - public for patients)
// NOTE: This endpoint is PUBLIC (no auth required) so patients can see pharmacies when not logged in
router.get('/', async (req, res) => {
  try {
    // Only return approved pharmacies for patients
    // Admin can see all pharmacies by adding ?all=true query param
    const showAll = req.query.all === 'true' && req.user?.role === 'admin';
    
    const query = showAll ? {} : { status: 'approved' };
    
    console.log('🔵 GET /api/pharmacies - Query:', JSON.stringify(query));
    console.log('🔵 GET /api/pharmacies - Request from:', req.user?.email || 'anonymous');
    
    // Find approved pharmacies
    let pharmacies = await Pharmacy.find(query)
      .populate('userId', 'name email phone image role isActive')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`🔵 GET /api/pharmacies - Found ${pharmacies.length} pharmacies before filtering`);
    
    // Filter out pharmacies where userId doesn't exist or user is not active
    pharmacies = pharmacies.filter(pharmacy => {
      const hasValidUser = pharmacy.userId && pharmacy.userId._id;
      const userIsActive = pharmacy.userId?.isActive !== false; // Default to true if not set
      const userIsPharmacy = pharmacy.userId?.role === 'pharmacy';
      
      if (!hasValidUser) {
        console.warn(`⚠️ Pharmacy ${pharmacy.pharmacyName} has invalid userId`);
        return false;
      }
      if (!userIsPharmacy) {
        console.warn(`⚠️ Pharmacy ${pharmacy.pharmacyName} user is not a pharmacy role`);
        return false;
      }
      return true;
    });
    
    console.log(`🔵 GET /api/pharmacies - Found ${pharmacies.length} pharmacies after filtering`);
    
    // Debug: Log pharmacy details
    if (pharmacies.length > 0) {
      console.log('🔵 Sample pharmacy:', {
        _id: pharmacies[0]._id,
        userId: pharmacies[0].userId?._id,
        pharmacyName: pharmacies[0].pharmacyName,
        status: pharmacies[0].status,
        userRole: pharmacies[0].userId?.role
      });
    } else {
      // Check if there are any pharmacies at all (even unapproved)
      const totalPharmacies = await Pharmacy.countDocuments({});
      console.log(`⚠️ No approved pharmacies found. Total pharmacies in DB: ${totalPharmacies}`);
      if (totalPharmacies > 0) {
        const allPharmacies = await Pharmacy.find({}).select('pharmacyName status userId').lean();
        console.log('⚠️ All pharmacies in DB:', allPharmacies.map(p => ({ 
          name: p.pharmacyName, 
          status: p.status,
          hasUserId: !!p.userId
        })));
      }
    }
    
    const mappedPharmacies = pharmacies.map(pharmacy => ({
      _id: pharmacy.userId?._id?.toString() || pharmacy.userId?.toString() || pharmacy.userId,
      name: pharmacy.userId?.name || pharmacy.pharmacyName,
      pharmacyName: pharmacy.pharmacyName,
      email: pharmacy.userId?.email || '',
      phone: pharmacy.phone || pharmacy.userId?.phone || '',
      address: typeof pharmacy.address === 'object' 
        ? `${pharmacy.address.street || ''}, ${pharmacy.address.city || ''}, ${pharmacy.address.state || ''} ${pharmacy.address.zipCode || ''}`.trim()
        : pharmacy.address || '',
      image: pharmacy.logo || pharmacy.userId?.image,
      status: pharmacy.status,
      licenseId: pharmacy.licenseId
    }));
    
    console.log(`🔵 Returning ${mappedPharmacies.length} pharmacies to frontend`);
    
    res.json({
      success: true,
      data: mappedPharmacies,
      count: mappedPharmacies.length
    });
  } catch (error) {
    console.error('❌ Get pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacies',
      error: error.message
    });
  }
});

// POST /api/pharmacies/:id/request - Submit medication request to specific pharmacy
router.post('/:id/request', auth, async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    const { userId } = req.user;
    
    // Verify pharmacy exists
    const pharmacy = await User.findById(pharmacyId);
    if (!pharmacy || pharmacy.role !== 'pharmacy') {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }
    
    // Get patient info
    const patient = await User.findById(userId).select('name email phone address');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Extract request data
    const {
      prescriptionFileURL,
      deliveryAddress,
      paymentMethod,
      paymentAmount,
      notes,
      deliveryNotes,
      patientPhone,
      patientName,
      patientEmail
    } = req.body;
    
    if (!prescriptionFileURL) {
      return res.status(400).json({
        success: false,
        message: 'Prescription file is required'
      });
    }
    
    // Generate unique request ID
    const requestId = `MR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Parse deliveryAddress if it's a string
    let parsedDeliveryAddress = deliveryAddress;
    if (typeof deliveryAddress === 'string') {
      // Try to parse if it's a comma-separated string
      const parts = deliveryAddress.split(',').map(s => s.trim());
      parsedDeliveryAddress = {
        street: parts[0] || '',
        city: parts[1] || '',
        state: parts[2] || '',
        zipCode: parts[3] || '',
        country: 'USA'
      };
    } else if (!deliveryAddress || typeof deliveryAddress !== 'object') {
      parsedDeliveryAddress = {
        street: patient.address?.street || '',
        city: patient.address?.city || '',
        state: patient.address?.state || '',
        zipCode: patient.address?.zipCode || '',
        country: 'USA'
      };
    }
    
    // Get pharmacy details for the request
    const pharmacyRecord = await Pharmacy.findOne({ userId: pharmacyId });
    
    // Create medication request
    const medicationRequestData = {
      userId: patient._id,
      requestId,
      pharmacyID: pharmacyId,
      pharmacy: {
        name: 'local_pharmacy', // Default enum value (required by schema)
        address: pharmacyRecord?.address ? 
          (typeof pharmacyRecord.address === 'object' 
            ? `${pharmacyRecord.address.street || ''}, ${pharmacyRecord.address.city || ''}, ${pharmacyRecord.address.state || ''}`.trim()
            : pharmacyRecord.address)
          : '',
        phone: pharmacyRecord?.phone || pharmacy?.phone || ''
      },
      patientInfo: {
        name: patientName || patient.name || 'Patient',
        phone: patientPhone || patient.phone || 'N/A',
        email: patientEmail || patient.email || '',
        address: parsedDeliveryAddress,
        deliveryNotes: deliveryNotes || notes || ''
      },
      prescriptionFileURL,
      deliveryAddress: parsedDeliveryAddress,
      payment: {
        method: paymentMethod || 'card',
        amount: paymentAmount || 0,
        currency: 'USD',
        status: 'pending'
      },
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        updatedBy: userId,
        notes: 'Request submitted to pharmacy',
        timestamp: new Date()
      }],
      notes: notes || ''
    };
    
    console.log('📤 Creating medication request with data:', {
      userId: medicationRequestData.userId,
      pharmacyID: medicationRequestData.pharmacyID,
      requestId: medicationRequestData.requestId,
      hasPrescriptionFileURL: !!prescriptionFileURL
    });
    
    let medicationRequest;
    try {
      medicationRequest = new MedicationRequest(medicationRequestData);
      await medicationRequest.save();
      console.log('✅ Medication request created successfully:', medicationRequest._id);
    } catch (saveError) {
      console.error('❌ Error saving medication request:', saveError);
      console.error('❌ Save error details:', {
        message: saveError.message,
        name: saveError.name,
        errors: saveError.errors
      });
      
      // Return more specific error message
      if (saveError.errors) {
        const errorMessages = Object.values(saveError.errors).map((err) => err.message).join(', ');
        return res.status(400).json({
          success: false,
          message: `Validation error: ${errorMessages}`,
          error: saveError.message
        });
      }
      
      return res.status(400).json({
        success: false,
        message: `Failed to create medication request: ${saveError.message}`,
        error: saveError.message
      });
    }
    
    // Create notification for pharmacy
    const pharmacyNotification = new Notification({
      userId: pharmacyId,
      type: 'medication_reminder',
      title: 'New Medication Request',
      message: `You have received a new medication request from ${patient.name} (${requestId})`,
      priority: 'high',
      actionUrl: `/pharmacy-dashboard`,
      metadata: {
        medicationRequestId: medicationRequest._id,
        patientId: userId
      }
    });
    await pharmacyNotification.save();
    
    // Create notification for patient
    const patientNotification = new Notification({
      userId: userId,
      type: 'medication_reminder',
      title: 'Request Submitted',
      message: `Your medication request (${requestId}) has been submitted to ${pharmacy.name || pharmacy.pharmacyName}. You can chat with them in real-time.`,
      priority: 'medium',
      actionUrl: `/pharmacy/${pharmacyId}`,
      metadata: {
        medicationRequestId: medicationRequest._id,
        pharmacyId: pharmacyId
      }
    });
    await patientNotification.save();
    
    // Emit Socket.IO event to notify pharmacy in real-time
    const io = req.app.get('socketio');
    if (io) {
      // Emit to pharmacy's specific room
      io.to(`pharmacy_requests_${pharmacyId.toString()}`).emit('newPharmacyMedicationRequest', {
        medicationRequest,
        notification: pharmacyNotification
      });
      // Also emit to pharmacy's general room
      io.to(pharmacyId.toString()).emit('newPharmacyMedicationRequest', {
        medicationRequest,
        notification: pharmacyNotification
      });
      console.log(`💊 Emitted new medication request to pharmacy ${pharmacyId}`);
    }
    
    // Get chat room ID (handle gracefully if Chat model doesn't have getRoomId)
    let chatRoomId = null;
    try {
      if (Chat && typeof Chat.getRoomId === 'function') {
        chatRoomId = Chat.getRoomId(userId, pharmacyId);
      } else {
        // Fallback: create room ID from user IDs
        chatRoomId = [userId.toString(), pharmacyId.toString()].sort().join('_');
      }
    } catch (chatError) {
      console.warn('⚠️ Could not generate chat room ID:', chatError);
      // Continue without chat room ID
    }
    
    res.status(201).json({
      success: true,
      message: 'Medication request submitted successfully',
      data: {
        medicationRequest,
        requestId: medicationRequest.requestId,
        chatRoomId: chatRoomId
      }
    });
  } catch (error) {
    console.error('❌ Submit pharmacy request error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit medication request',
      error: error.message
    });
  }
});

// ==================== ADMIN PHARMACY APPROVAL ROUTES ====================

// GET /api/pharmacies/admin/pending - Get all pending pharmacies (admin only)
router.get('/admin/pending', auth, requireRole('admin'), async (req, res) => {
  try {
    const pendingPharmacies = await Pharmacy.find({ status: 'pending' })
      .populate('userId', 'name email phone image createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: pendingPharmacies.map(pharmacy => ({
        _id: pharmacy._id,
        userId: pharmacy.userId?._id || pharmacy.userId,
        pharmacyName: pharmacy.pharmacyName,
        name: pharmacy.userId?.name || pharmacy.pharmacyName,
        email: pharmacy.userId?.email || '',
        phone: pharmacy.phone || pharmacy.userId?.phone || '',
        address: pharmacy.address,
        licenseId: pharmacy.licenseId,
        licenseImage: pharmacy.licenseImage,
        logo: pharmacy.logo,
        status: pharmacy.status,
        createdAt: pharmacy.createdAt,
        userCreatedAt: pharmacy.userId?.createdAt
      })),
      count: pendingPharmacies.length
    });
  } catch (error) {
    console.error('Get pending pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending pharmacies',
      error: error.message
    });
  }
});

// PUT /api/pharmacies/admin/:id/approve - Approve a pharmacy (admin only)
router.put('/admin/:id/approve', auth, requireRole('admin'), async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    const adminId = req.user.userId;
    
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }
    
    pharmacy.status = 'approved';
    pharmacy.approvedBy = adminId;
    pharmacy.approvedAt = new Date();
    await pharmacy.save();
    
    // Create notification for pharmacy
    const notification = new Notification({
      userId: pharmacy.userId,
      type: 'system',
      title: 'Pharmacy Approved',
      message: `Your pharmacy "${pharmacy.pharmacyName}" has been approved. You can now receive medication requests from patients.`,
      priority: 'high'
    });
    await notification.save();
    
    res.json({
      success: true,
      message: 'Pharmacy approved successfully',
      data: pharmacy
    });
  } catch (error) {
    console.error('Approve pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve pharmacy',
      error: error.message
    });
  }
});

// PUT /api/pharmacies/admin/:id/reject - Reject a pharmacy (admin only)
router.put('/admin/:id/reject', auth, requireRole('admin'), async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    const { reason } = req.body;
    
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }
    
    pharmacy.status = 'rejected';
    pharmacy.rejectionReason = reason || 'Rejected by admin';
    await pharmacy.save();
    
    // Create notification for pharmacy
    const notification = new Notification({
      userId: pharmacy.userId,
      type: 'system',
      title: 'Pharmacy Registration Rejected',
      message: `Your pharmacy registration for "${pharmacy.pharmacyName}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      priority: 'high'
    });
    await notification.save();
    
    res.json({
      success: true,
      message: 'Pharmacy rejected successfully',
      data: pharmacy
    });
  } catch (error) {
    console.error('Reject pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject pharmacy',
      error: error.message
    });
  }
});

// POST /api/pharmacies/admin/create - Create a new pharmacy (admin only)
router.post('/admin/create', auth, requireRole('admin'), async (req, res) => {
  try {
    const adminId = req.user.userId;
    const {
      name,
      email,
      password,
      phone,
      pharmacyName,
      address,
      licenseId,
      licenseImage,
      logo
    } = req.body;

    console.log('🔵 POST /api/pharmacies/admin/create - Request body:', {
      name: !!name,
      email: !!email,
      password: !!password,
      phone: !!phone,
      pharmacyName: !!pharmacyName,
      hasAddress: !!address,
      hasLicenseId: !!licenseId
    });

    // Validate required fields with detailed error messages
    const missingFields = [];
    if (!name || name.trim() === '') missingFields.push('name');
    if (!email || email.trim() === '') missingFields.push('email');
    if (!password || password.trim() === '') missingFields.push('password');
    if (!pharmacyName || pharmacyName.trim() === '') missingFields.push('pharmacyName');
    if (!phone || phone.trim() === '') missingFields.push('phone');

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.error('❌ User already exists with email:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        email: email
      });
    }

    // Generate unique anonymousId to avoid duplicate key errors
    const anonymousId = `pharmacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user (password will be hashed by User model's pre-save hook)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // Pass plain password - pre-save hook will hash it
      phone: phone.trim(),
      role: 'pharmacy',
      address: address || {},
      anonymousId: anonymousId,
      isActive: true
    });
    
    try {
      await user.save();
      console.log('✅ Created user:', user.email);
    } catch (userError) {
      console.error('❌ Error creating user:', userError);
      if (userError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists (duplicate key error)',
          error: userError.message
        });
      }
      throw userError;
    }

    // Create pharmacy record
    const pharmacy = new Pharmacy({
      userId: user._id,
      pharmacyName: pharmacyName.trim(),
      address: address || {},
      phone: phone.trim(),
      licenseId: licenseId || null,
      licenseImage: licenseImage || null,
      logo: logo || null,
      status: 'approved', // Auto-approved when created by admin
      approvedBy: adminId,
      approvedAt: new Date()
    });
    
    try {
      await pharmacy.save();
      console.log('✅ Created pharmacy:', pharmacy.pharmacyName);
    } catch (pharmacyError) {
      console.error('❌ Error creating pharmacy:', pharmacyError);
      // If pharmacy creation fails, delete the user to avoid orphaned records
      await User.findByIdAndDelete(user._id);
      throw pharmacyError;
    }

    res.status(201).json({
      success: true,
      message: 'Pharmacy created successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        pharmacy: {
          _id: pharmacy._id,
          pharmacyName: pharmacy.pharmacyName,
          status: pharmacy.status
        }
      }
    });
  } catch (error) {
    console.error('❌ Create pharmacy error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create pharmacy';
    if (error.code === 11000) {
      errorMessage = 'Duplicate key error - pharmacy or user may already exist';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      code: error.code
    });
  }
});

// PUT /api/pharmacies/admin/:id - Update a pharmacy (admin only)
router.put('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    const {
      name,
      email,
      password,
      phone,
      pharmacyName,
      address,
      licenseId,
      licenseImage,
      logo,
      status
    } = req.body;

    console.log('🔵 PUT /api/pharmacies/admin/:id - Updating pharmacy:', pharmacyId);

    // Find pharmacy by ID (could be Pharmacy._id or userId)
    let pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      // Try finding by userId
      pharmacy = await Pharmacy.findOne({ userId: pharmacyId });
    }

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    // Get the user associated with this pharmacy
    const user = await User.findById(pharmacy.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with pharmacy not found'
      });
    }

    // Update user fields if provided
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) {
      // Check if email is being changed and if new email already exists
      if (email.toLowerCase() !== user.email.toLowerCase()) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use by another user'
          });
        }
        user.email = email.toLowerCase().trim();
      }
    }
    if (password !== undefined && password.trim() !== '') {
      // Only update password if provided and not empty
      // Password will be hashed by User model's pre-save hook
      user.password = password;
    }
    if (phone !== undefined) user.phone = phone.trim();
    await user.save();

    // Update pharmacy fields if provided
    if (pharmacyName !== undefined) pharmacy.pharmacyName = pharmacyName.trim();
    if (address !== undefined) pharmacy.address = address;
    if (phone !== undefined) pharmacy.phone = phone.trim();
    if (licenseId !== undefined) pharmacy.licenseId = licenseId || null;
    if (licenseImage !== undefined) pharmacy.licenseImage = licenseImage || null;
    if (logo !== undefined) pharmacy.logo = logo || null;
    if (status !== undefined && ['pending', 'approved', 'rejected'].includes(status)) {
      pharmacy.status = status;
      if (status === 'approved' && !pharmacy.approvedAt) {
        pharmacy.approvedBy = req.user.userId;
        pharmacy.approvedAt = new Date();
      }
    }
    await pharmacy.save();

    console.log('✅ Pharmacy updated successfully:', pharmacy._id);

    res.json({
      success: true,
      message: 'Pharmacy updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        pharmacy: {
          _id: pharmacy._id,
          pharmacyName: pharmacy.pharmacyName,
          status: pharmacy.status,
          address: pharmacy.address,
          phone: pharmacy.phone,
          licenseId: pharmacy.licenseId
        }
      }
    });
  } catch (error) {
    console.error('❌ Update pharmacy error:', error);
    console.error('❌ Error stack:', error.stack);
    
    let errorMessage = 'Failed to update pharmacy';
    if (error.code === 11000) {
      errorMessage = 'Duplicate key error - email may already be in use';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      code: error.code
    });
  }
});

// DELETE /api/pharmacies/admin/:id - Delete a pharmacy (admin only)
router.delete('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    
    // Find pharmacy by ID (could be Pharmacy._id or userId)
    let pharmacy = await Pharmacy.findById(pharmacyId);
    
    // If not found by _id, try finding by userId
    if (!pharmacy) {
      pharmacy = await Pharmacy.findOne({ userId: pharmacyId });
    }
    
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    const userId = pharmacy.userId;
    
    // Delete pharmacy record
    await Pharmacy.deleteOne({ _id: pharmacy._id });
    
    // Optionally delete the user account (or just remove pharmacy role)
    // For safety, we'll just remove the pharmacy role instead of deleting the user
    const user = await User.findById(userId);
    if (user) {
      // Option 1: Delete the user completely
      // await User.deleteOne({ _id: userId });
      
      // Option 2: Change role to patient (safer)
      // user.role = 'patient';
      // await user.save();
      
      // Option 3: Just delete (as requested)
      await User.deleteOne({ _id: userId });
    }
    
    // Delete all medication requests associated with this pharmacy
    await MedicationRequest.deleteMany({ pharmacyID: userId });
    
    res.json({
      success: true,
      message: 'Pharmacy deleted successfully'
    });
  } catch (error) {
    console.error('Delete pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pharmacy',
      error: error.message
    });
  }
});

module.exports = router;

