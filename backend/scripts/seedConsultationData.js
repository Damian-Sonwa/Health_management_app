const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import all models
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Chat = require('../models/Chat');
const VideoCallSession = require('../models/VideoCallSession');
const PhoneCallLog = require('../models/PhoneCallLog');
const FileAttachment = require('../models/FileAttachment');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in .env file');
    }
    // Extract database name from URI or use default
    const dbNameMatch = process.env.MONGODB_URI.match(/\.net\/([^?]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'healthify_tracker';
    
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: dbName, // Force correct database
    });
    console.log('✅ Connected to MongoDB Atlas for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Please ensure MONGODB_URI is set in your .env file');
    process.exit(1);
  }
};

// Seed function
const seedConsultationData = async () => {
  try {
    console.log('🌱 Starting comprehensive database seeding for Consultation Room features...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Appointment.deleteMany({});
    await Chat.deleteMany({});
    await VideoCallSession.deleteMany({});
    await PhoneCallLog.deleteMany({});
    await FileAttachment.deleteMany({});
    await Prescription.deleteMany({});
    await Notification.deleteMany({});
    // Don't delete users - we'll use existing or create new ones
    console.log('✅ Cleared existing consultation data\n');

    // Get or create users
    console.log('👥 Setting up users...');
    
    // Find or create doctors - use findOneAndUpdate to avoid duplicate key errors
    let doctor1 = await User.findOneAndUpdate(
      { email: 'doctor1@healthcare.com' },
      {
        name: 'Dr. Sarah Johnson',
        email: 'doctor1@healthcare.com',
        phone: '+1-555-0101',
        role: 'doctor',
        specialty: 'Cardiology',
        experience: 15,
        licenseId: 'MD-CARD-001',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    // Set password if user was just created
    if (!doctor1.password || doctor1.password.length < 20) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      doctor1.password = hashedPassword;
      await doctor1.save();
      console.log('✅ Created/Updated doctor: Dr. Sarah Johnson');
    } else {
      console.log('✅ Using existing doctor: Dr. Sarah Johnson');
    }

    let doctor2 = await User.findOneAndUpdate(
      { email: 'doctor2@healthcare.com' },
      {
        name: 'Dr. Michael Chen',
        email: 'doctor2@healthcare.com',
        phone: '+1-555-0102',
        role: 'doctor',
        specialty: 'Pediatrics',
        experience: 12,
        licenseId: 'MD-PED-002',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    if (!doctor2.password || doctor2.password.length < 20) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      doctor2.password = hashedPassword;
      await doctor2.save();
      console.log('✅ Created/Updated doctor: Dr. Michael Chen');
    } else {
      console.log('✅ Using existing doctor: Dr. Michael Chen');
    }

    // Find or create patients
    let patient1 = await User.findOneAndUpdate(
      { email: 'patient1@email.com' },
      {
        name: 'John Smith',
        email: 'patient1@email.com',
        phone: '+1-555-0201',
        role: 'patient',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    if (!patient1.password || patient1.password.length < 20) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      patient1.password = hashedPassword;
      await patient1.save();
      console.log('✅ Created/Updated patient: John Smith');
    } else {
      console.log('✅ Using existing patient: John Smith');
    }

    let patient2 = await User.findOneAndUpdate(
      { email: 'patient2@email.com' },
      {
        name: 'Maria Garcia',
        email: 'patient2@email.com',
        phone: '+1-555-0301',
        role: 'patient',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    if (!patient2.password || patient2.password.length < 20) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      patient2.password = hashedPassword;
      await patient2.save();
      console.log('✅ Created/Updated patient: Maria Garcia');
    } else {
      console.log('✅ Using existing patient: Maria Garcia');
    }
    
    // If we still don't have users, try to find any existing users
    if (!doctor1 || !doctor2 || !patient1 || !patient2) {
      console.log('⚠️  Some users not found, trying to use existing users from database...');
      const existingDoctors = await User.find({ role: 'doctor' }).limit(2);
      const existingPatients = await User.find({ role: 'patient' }).limit(2);
      
      if (existingDoctors.length > 0 && !doctor1) doctor1 = existingDoctors[0];
      if (existingDoctors.length > 1 && !doctor2) doctor2 = existingDoctors[1];
      if (existingPatients.length > 0 && !patient1) patient1 = existingPatients[0];
      if (existingPatients.length > 1 && !patient2) patient2 = existingPatients[1];
      
      // If still no users, we can't proceed
      if (!doctor1 || !patient1) {
        throw new Error('Cannot proceed: Need at least one doctor and one patient. Please create users first.');
      }
    }

    console.log('\n📅 Creating appointments...');

    // Create appointments
    const appointment1 = new Appointment({
      userId: patient1._id,
      patientId: patient1._id,
      doctorId: doctor1._id,
      doctorName: doctor1.name,
      specialty: doctor1.specialty,
      appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      appointmentTime: '10:00',
      duration: 30,
      type: 'video',
      communicationMethod: 'video',
      status: 'accepted',
      reason: 'Annual checkup and consultation',
      notes: 'Patient requested video consultation for annual health review',
    });
    await appointment1.save();
    console.log('✅ Created appointment 1: Patient1 with Dr. Sarah Johnson');

    const appointment2 = new Appointment({
      userId: patient2._id,
      patientId: patient2._id,
      doctorId: doctor2._id,
      doctorName: doctor2.name,
      specialty: doctor2.specialty,
      appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      appointmentTime: '14:30',
      duration: 45,
      type: 'video',
      communicationMethod: 'video',
      status: 'pending',
      reason: 'Follow-up consultation',
      notes: 'Follow-up after previous treatment',
    });
    await appointment2.save();
    console.log('✅ Created appointment 2: Patient2 with Dr. Michael Chen');

    const appointment3 = new Appointment({
      userId: patient1._id,
      patientId: patient1._id,
      doctorId: doctor2._id,
      doctorName: doctor2.name,
      specialty: doctor2.specialty,
      appointmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      appointmentTime: '11:00',
      duration: 30,
      type: 'phone',
      communicationMethod: 'phone',
      status: 'completed',
      reason: 'Routine consultation',
      notes: 'Completed phone consultation',
    });
    await appointment3.save();
    console.log('✅ Created appointment 3: Patient1 with Dr. Michael Chen (completed)');

    console.log('\n💬 Creating chat messages...');

    // Create chat messages
    const roomId1 = Chat.getRoomId(patient1._id.toString(), doctor1._id.toString());
    
    const chat1 = new Chat({
      senderId: patient1._id,
      senderModel: 'User',
      receiverId: doctor1._id,
      receiverModel: 'User',
      message: 'Hello Dr. Johnson, I have a question about my upcoming appointment.',
      messageType: 'text',
      roomId: roomId1,
      appointmentId: appointment1._id,
      consultationId: appointment1._id,
    });
    await chat1.save();

    const chat2 = new Chat({
      senderId: doctor1._id,
      senderModel: 'User',
      receiverId: patient1._id,
      receiverModel: 'User',
      message: 'Hello! I\'m happy to help. What would you like to know?',
      messageType: 'text',
      roomId: roomId1,
      appointmentId: appointment1._id,
      consultationId: appointment1._id,
    });
    await chat2.save();

    const chat3 = new Chat({
      senderId: patient1._id,
      senderModel: 'User',
      receiverId: doctor1._id,
      receiverModel: 'User',
      message: 'Should I bring any previous test results?',
      messageType: 'text',
      roomId: roomId1,
      appointmentId: appointment1._id,
      consultationId: appointment1._id,
    });
    await chat3.save();
    console.log('✅ Created 3 chat messages for appointment 1');

    const roomId2 = Chat.getRoomId(patient2._id.toString(), doctor2._id.toString());
    const chat4 = new Chat({
      senderId: patient2._id,
      senderModel: 'User',
      receiverId: doctor2._id,
      receiverModel: 'User',
      message: 'Hi Dr. Chen, I need to reschedule my appointment.',
      messageType: 'text',
      roomId: roomId2,
      appointmentId: appointment2._id,
      consultationId: appointment2._id,
    });
    await chat4.save();
    console.log('✅ Created chat message for appointment 2');

    console.log('\n📹 Creating video call sessions...');

    // Create video call sessions
    const videoSession1 = new VideoCallSession({
      doctorId: doctor1._id,
      patientId: patient1._id,
      appointmentId: appointment1._id,
      status: 'initiated',
      startTime: new Date(),
      meetingId: `meeting-${appointment1._id}`,
      meetingLink: `https://meet.example.com/${appointment1._id}`,
    });
    await videoSession1.save();
    console.log('✅ Created video call session 1');

    const videoSession2 = new VideoCallSession({
      doctorId: doctor2._id,
      patientId: patient2._id,
      appointmentId: appointment2._id,
      status: 'initiated',
      startTime: new Date(),
      meetingId: `meeting-${appointment2._id}`,
      meetingLink: `https://meet.example.com/${appointment2._id}`,
    });
    await videoSession2.save();
    console.log('✅ Created video call session 2');

    // Completed video session
    const videoSession3 = new VideoCallSession({
      doctorId: doctor1._id,
      patientId: patient1._id,
      appointmentId: appointment1._id,
      status: 'ended',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 minutes later
      duration: 1800, // 30 minutes in seconds
      meetingId: `meeting-completed-${appointment1._id}`,
      meetingLink: `https://meet.example.com/completed-${appointment1._id}`,
    });
    await videoSession3.save();
    console.log('✅ Created completed video call session');

    console.log('\n📞 Creating phone call logs...');

    // Create phone call logs
    const phoneCall1 = new PhoneCallLog({
      doctorId: doctor2._id,
      patientId: patient1._id,
      appointmentId: appointment3._id,
      callType: 'outgoing',
      duration: 1200, // 20 minutes
      status: 'completed',
      phoneNumber: patient1.phone,
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
      notes: 'Routine consultation call completed successfully',
    });
    await phoneCall1.save();
    console.log('✅ Created phone call log 1 (completed)');

    const phoneCall2 = new PhoneCallLog({
      doctorId: doctor1._id,
      patientId: patient1._id,
      appointmentId: appointment1._id,
      callType: 'incoming',
      duration: 0,
      status: 'missed',
      phoneNumber: doctor1.phone,
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Missed call - patient will call back',
    });
    await phoneCall2.save();
    console.log('✅ Created phone call log 2 (missed)');

    console.log('\n📎 Creating file attachments...');

    // Create file attachments
    const file1 = new FileAttachment({
      patientId: patient1._id,
      doctorId: doctor1._id,
      appointmentId: appointment1._id,
      uploadedBy: patient1._id,
      fileName: 'lab_results_2024.pdf',
      fileUrl: 'https://example.com/files/lab_results_2024.pdf',
      fileType: 'application/pdf',
      fileSize: 245760, // 240 KB
      description: 'Recent lab test results',
      category: 'lab_result',
    });
    await file1.save();
    console.log('✅ Created file attachment 1 (lab results)');

    const file2 = new FileAttachment({
      patientId: patient2._id,
      doctorId: doctor2._id,
      appointmentId: appointment2._id,
      uploadedBy: patient2._id,
      fileName: 'medical_history.pdf',
      fileUrl: 'https://example.com/files/medical_history.pdf',
      fileType: 'application/pdf',
      fileSize: 512000, // 500 KB
      description: 'Complete medical history document',
      category: 'medical_history',
    });
    await file2.save();
    console.log('✅ Created file attachment 2 (medical history)');

    const file3 = new FileAttachment({
      patientId: patient1._id,
      doctorId: doctor1._id,
      uploadedBy: doctor1._id,
      fileName: 'xray_chest.jpg',
      fileUrl: 'https://example.com/files/xray_chest.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024000, // 1 MB
      description: 'Chest X-ray from last visit',
      category: 'xray',
    });
    await file3.save();
    console.log('✅ Created file attachment 3 (X-ray)');

    console.log('\n💊 Creating prescriptions...');

    // Create prescriptions
    const prescription1 = new Prescription({
      doctorId: doctor1._id,
      patientId: patient1._id,
      appointmentId: appointment1._id,
      medication: 'Lisinopril',
      dosage: '10mg',
      instructions: 'Take one tablet daily in the morning with food. Continue for 30 days.',
      status: 'active',
    });
    await prescription1.save();
    console.log('✅ Created prescription 1');

    const prescription2 = new Prescription({
      doctorId: doctor2._id,
      patientId: patient2._id,
      appointmentId: appointment2._id,
      medication: 'Amoxicillin',
      dosage: '500mg',
      instructions: 'Take one capsule three times daily after meals. Complete the full course of 7 days.',
      status: 'active',
    });
    await prescription2.save();
    console.log('✅ Created prescription 2');

    const prescription3 = new Prescription({
      doctorId: doctor2._id,
      patientId: patient1._id,
      appointmentId: appointment3._id,
      medication: 'Metformin',
      dosage: '500mg',
      instructions: 'Take twice daily with meals. Monitor blood sugar levels.',
      status: 'active',
    });
    await prescription3.save();
    console.log('✅ Created prescription 3');

    console.log('\n🔔 Creating notifications...');

    // Create notifications
    const notification1 = new Notification({
      userId: patient1._id,
      title: 'Appointment Accepted',
      message: 'Your appointment with Dr. Sarah Johnson has been accepted for next week.',
      type: 'appointment',
      isRead: false,
      metadata: {
        appointmentId: appointment1._id,
      },
    });
    await notification1.save();

    const notification2 = new Notification({
      userId: patient2._id,
      title: 'New Message',
      message: 'You have a new message from Dr. Michael Chen.',
      type: 'chat',
      isRead: false,
    });
    await notification2.save();

    const notification3 = new Notification({
      userId: doctor1._id,
      title: 'Video Call Scheduled',
      message: 'Video call with John Smith is scheduled for tomorrow at 10:00 AM.',
      type: 'video',
      isRead: false,
      metadata: {
        appointmentId: appointment1._id,
      },
    });
    await notification3.save();

    const notification4 = new Notification({
      userId: patient1._id,
      title: 'New Prescription',
      message: 'Dr. Sarah Johnson has prescribed Lisinopril for you.',
      type: 'prescription',
      isRead: false,
    });
    await notification4.save();

    const notification5 = new Notification({
      userId: doctor2._id,
      title: 'Appointment Request',
      message: 'Maria Garcia has requested an appointment.',
      type: 'appointment',
      isRead: true,
      metadata: {
        appointmentId: appointment2._id,
      },
    });
    await notification5.save();
    console.log('✅ Created 5 notifications');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${await User.countDocuments({ role: { $in: ['patient', 'doctor'] } })}`);
    console.log(`   📅 Appointments: ${await Appointment.countDocuments()}`);
    console.log(`   💬 Chat Messages: ${await Chat.countDocuments()}`);
    console.log(`   📹 Video Call Sessions: ${await VideoCallSession.countDocuments()}`);
    console.log(`   📞 Phone Call Logs: ${await PhoneCallLog.countDocuments()}`);
    console.log(`   📎 File Attachments: ${await FileAttachment.countDocuments()}`);
    console.log(`   💊 Prescriptions: ${await Prescription.countDocuments()}`);
    console.log(`   🔔 Notifications: ${await Notification.countDocuments()}`);
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('   Doctor 1: doctor1@healthcare.com / password123');
    console.log('   Doctor 2: doctor2@healthcare.com / password123');
    console.log('   Patient 1: patient1@email.com / password123');
    console.log('   Patient 2: patient2@email.com / password123');
    console.log('\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  connectDB()
    .then(() => seedConsultationData())
    .then(() => {
      console.log('✅ Seeding process completed');
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = { seedConsultationData, connectDB };

