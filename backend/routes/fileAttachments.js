const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileAttachment = require('../models/FileAttachment');
const { auth } = require('../middleware/auth');

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '..', 'uploads', 'file-attachments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Get all file attachments for user
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.user || {};
    const query = role === 'doctor' 
      ? { doctorId: req.userId }
      : { patientId: req.userId };

    const { page = 1, limit = 50, category, appointmentId } = req.query;

    if (category && category !== 'all') {
      query.category = category;
    }

    if (appointmentId) {
      query.appointmentId = appointmentId;
    }

    const files = await FileAttachment.find(query)
      .populate('patientId', 'name email phone image')
      .populate('doctorId', 'name email phone image specialty')
      .populate('uploadedBy', 'name email')
      .populate('appointmentId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FileAttachment.countDocuments(query);

    res.json({
      success: true,
      data: files,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching file attachments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file attachments',
      error: error.message
    });
  }
});

// Get file attachment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await FileAttachment.findById(req.params.id)
      .populate('patientId', 'name email phone image')
      .populate('doctorId', 'name email phone image specialty')
      .populate('uploadedBy', 'name email')
      .populate('appointmentId');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File attachment not found'
      });
    }

    // Verify user has access
    const { role } = req.user || {};
    const hasAccess = 
      file.patientId._id.toString() === req.userId ||
      (file.doctorId && file.doctorId._id.toString() === req.userId) ||
      role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Error fetching file attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file attachment',
      error: error.message
    });
  }
});

// Create new file attachment (with file upload support)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 POST /api/file-attachments - File upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? { name: req.file.originalname, size: req.file.size, type: req.file.mimetype } : 'No file');
    
    const { role } = req.user || {};
    const { patientId, description, appointmentId, category } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a file to upload.'
      });
    }

    // Construct file URL (in production, use cloud storage URL)
    const fileUrl = `/uploads/file-attachments/${req.file.filename}`;
    
    // Set patientId and doctorId based on role
    let finalPatientId = patientId;
    let finalDoctorId = null;
    
    if (role === 'doctor') {
      finalDoctorId = req.userId;
      if (!finalPatientId) {
        // Delete uploaded file if patientId is missing
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }
        }
        return res.status(400).json({
          success: false,
          message: 'patientId is required when uploading as doctor'
        });
      }
    } else if (role === 'patient') {
      finalPatientId = req.userId || patientId;
      // doctorId is optional for patient uploads
    } else if (role === 'admin') {
      // Admin can upload for any patient
      if (!finalPatientId) {
        // Delete uploaded file if patientId is missing
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }
        }
        return res.status(400).json({
          success: false,
          message: 'patientId is required'
        });
      }
    }

    const fileData = {
      patientId: finalPatientId,
      doctorId: finalDoctorId,
      appointmentId: appointmentId || null,
      uploadedBy: req.userId,
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      fileType: req.file.mimetype || 'application/octet-stream',
      fileSize: req.file.size,
      description: description || '',
      category: category || 'other'
    };

    console.log('📤 Creating file attachment with data:', {
      patientId: fileData.patientId,
      fileName: fileData.fileName,
      fileUrl: fileData.fileUrl,
      fileSize: fileData.fileSize
    });

    const file = new FileAttachment(fileData);
    await file.save();

    await file.populate('patientId', 'name email phone image');
    await file.populate('doctorId', 'name email phone image specialty');
    await file.populate('uploadedBy', 'name email');
    if (file.appointmentId) {
      await file.populate('appointmentId');
    }

    console.log('✅ File attachment created successfully:', file._id);

    res.status(201).json({
      success: true,
      data: {
        _id: file._id,
        fileUrl: file.fileUrl,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        description: file.description,
        category: file.category,
        patientId: file.patientId,
        doctorId: file.doctorId,
        appointmentId: file.appointmentId,
        uploadedBy: file.uploadedBy,
        createdAt: file.createdAt
      },
      message: 'File attachment created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating file attachment:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Delete uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Deleted uploaded file due to error');
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating file attachment',
      error: error.message
    });
  }
});

// Update file attachment
router.put('/:id', auth, async (req, res) => {
  try {
    const file = await FileAttachment.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File attachment not found'
      });
    }

    // Verify user has access (uploader, patient, doctor, or admin)
    const { role } = req.user || {};
    const hasAccess = 
      file.uploadedBy.toString() === req.userId ||
      file.patientId.toString() === req.userId ||
      (file.doctorId && file.doctorId.toString() === req.userId) ||
      role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow updating description and category
    if (req.body.description !== undefined) {
      file.description = req.body.description;
    }
    if (req.body.category !== undefined) {
      file.category = req.body.category;
    }

    await file.save();

    await file.populate('patientId', 'name email phone image');
    await file.populate('doctorId', 'name email phone image specialty');
    await file.populate('uploadedBy', 'name email');
    await file.populate('appointmentId');

    res.json({
      success: true,
      data: file,
      message: 'File attachment updated successfully'
    });
  } catch (error) {
    console.error('Error updating file attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating file attachment',
      error: error.message
    });
  }
});

// Delete file attachment
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await FileAttachment.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File attachment not found'
      });
    }

    // Verify user has access (uploader, patient, doctor, or admin)
    const { role } = req.user || {};
    const hasAccess = 
      file.uploadedBy.toString() === req.userId ||
      file.patientId.toString() === req.userId ||
      (file.doctorId && file.doctorId.toString() === req.userId) ||
      role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await file.deleteOne();

    res.json({
      success: true,
      message: 'File attachment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file attachment',
      error: error.message
    });
  }
});

// Get file attachments by appointment
router.get('/appointment/:appointmentId', auth, async (req, res) => {
  try {
    const files = await FileAttachment.find({ 
      appointmentId: req.params.appointmentId 
    })
      .populate('patientId', 'name email phone image')
      .populate('doctorId', 'name email phone image specialty')
      .populate('uploadedBy', 'name email')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error fetching file attachments by appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file attachments',
      error: error.message
    });
  }
});

module.exports = router;

