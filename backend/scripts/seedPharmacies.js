const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const MedicationRequest = require('../models/MedicationRequest');

// Sample pharmacy data
const samplePharmacies = [
  {
    name: 'ABC Pharmacy',
    email: 'abc@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0101',
    pharmacyName: 'ABC Pharmacy',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    licenseId: 'PH-ABC-001',
    status: 'approved' // Auto-approved for testing
  },
  {
    name: 'XYZ Medical Supplies',
    email: 'xyz@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0102',
    pharmacyName: 'XYZ Medical Supplies',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    licenseId: 'PH-XYZ-002',
    status: 'approved' // Auto-approved for testing
  },
  {
    name: 'Health Plus Pharmacy',
    email: 'healthplus@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0103',
    pharmacyName: 'Health Plus Pharmacy',
    address: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    licenseId: 'PH-HP-003',
    status: 'approved' // Auto-approved for testing
  },
  {
    name: 'Care Pharmacy',
    email: 'care@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0104',
    pharmacyName: 'Care Pharmacy',
    address: {
      street: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    },
    licenseId: 'PH-CARE-004',
    status: 'approved' // Auto-approved for testing
  },
  {
    name: 'MedExpress Pharmacy',
    email: 'medexpress@pharmacy.com',
    password: 'Pharmacy123',
    phone: '+1-555-0105',
    pharmacyName: 'MedExpress Pharmacy',
    address: {
      street: '654 Maple Drive',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    },
    licenseId: 'PH-ME-005',
    status: 'approved' // Auto-approved for testing
  }
];

// Sample patient data for medication requests
const samplePatients = [
  {
    name: 'John Doe',
    email: 'john@patient.com',
    password: 'Patient123',
    phone: '+1-555-1001',
    address: {
      street: '100 Patient Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@patient.com',
    password: 'Patient123',
    phone: '+1-555-1002',
    address: {
      street: '200 Health Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    }
  },
  {
    name: 'Bob Johnson',
    email: 'bob@patient.com',
    password: 'Patient123',
    phone: '+1-555-1003',
    address: {
      street: '300 Wellness Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    }
  }
];

const seedPharmaciesAndRequests = async () => {
  try {
    console.log('🌱 Starting pharmacy and medication request seeding...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing pharmacies and medication requests (optional - comment out if you want to keep existing data)
    // await Pharmacy.deleteMany({});
    // await MedicationRequest.deleteMany({});
    // console.log('🗑️ Cleared existing pharmacies and medication requests');

    // Create or update pharmacies
    const createdPharmacies = [];
    for (const pharmacyData of samplePharmacies) {
      // Check if user already exists
      let user = await User.findOne({ email: pharmacyData.email });
      
      if (!user) {
        // Create new user
        const hashedPassword = await bcrypt.hash(pharmacyData.password, 12);
        user = new User({
          name: pharmacyData.name,
          email: pharmacyData.email,
          password: hashedPassword,
          phone: pharmacyData.phone,
          role: 'pharmacy',
          address: pharmacyData.address
        });
        await user.save();
        console.log(`👤 Created user: ${user.name} (${user.email})`);
      } else {
        // Update existing user to ensure it's a pharmacy
        user.role = 'pharmacy';
        user.phone = pharmacyData.phone;
        user.address = pharmacyData.address;
        await user.save();
        console.log(`👤 Updated user: ${user.name} (${user.email})`);
      }

      // Create or update pharmacy record
      let pharmacy = await Pharmacy.findOne({ userId: user._id });
      
      if (!pharmacy) {
        pharmacy = new Pharmacy({
          userId: user._id,
          pharmacyName: pharmacyData.pharmacyName,
          address: pharmacyData.address,
          phone: pharmacyData.phone,
          licenseId: pharmacyData.licenseId,
          status: pharmacyData.status, // Auto-approved for testing
          approvedAt: new Date() // Set approval date
        });
        await pharmacy.save();
        console.log(`💊 Created pharmacy: ${pharmacy.pharmacyName} (Status: ${pharmacy.status})`);
      } else {
        // Update existing pharmacy to ensure it's approved
        pharmacy.pharmacyName = pharmacyData.pharmacyName;
        pharmacy.address = pharmacyData.address;
        pharmacy.phone = pharmacyData.phone;
        pharmacy.licenseId = pharmacyData.licenseId;
        pharmacy.status = pharmacyData.status; // Auto-approved for testing
        if (!pharmacy.approvedAt) {
          pharmacy.approvedAt = new Date();
        }
        await pharmacy.save();
        console.log(`💊 Updated pharmacy: ${pharmacy.pharmacyName} (Status: ${pharmacy.status})`);
      }
      
      createdPharmacies.push({ user, pharmacy });
    }

    // Create or update patients
    const createdPatients = [];
    for (const patientData of samplePatients) {
      let patient = await User.findOne({ email: patientData.email });
      
      if (!patient) {
        const hashedPassword = await bcrypt.hash(patientData.password, 12);
        patient = new User({
          name: patientData.name,
          email: patientData.email,
          password: hashedPassword,
          phone: patientData.phone,
          role: 'patient',
          address: patientData.address
        });
        await patient.save();
        console.log(`👤 Created patient: ${patient.name} (${patient.email})`);
      } else {
        patient.role = 'patient';
        patient.phone = patientData.phone;
        patient.address = patientData.address;
        await patient.save();
        console.log(`👤 Updated patient: ${patient.name} (${patient.email})`);
      }
      
      createdPatients.push(patient);
    }

    // Create medication requests
    const medicationRequests = [];
    const statuses = ['pending', 'confirmed', 'processing', 'completed'];
    const paymentMethods = ['card', 'insurance', 'cash', 'bank_transfer'];
    
    for (let i = 0; i < createdPatients.length; i++) {
      const patient = createdPatients[i];
      // Each patient makes 2-3 requests to different pharmacies
      const numRequests = 2 + Math.floor(Math.random() * 2);
      
      for (let j = 0; j < numRequests; j++) {
        const pharmacy = createdPharmacies[Math.floor(Math.random() * createdPharmacies.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        // Generate unique request ID
        const requestId = `MR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const medicationRequest = new MedicationRequest({
          userId: patient._id,
          requestId,
          pharmacyID: pharmacy.user._id, // Use user._id as pharmacyID
          patientInfo: {
            name: patient.name,
            phone: patient.phone || '',
            email: patient.email,
            address: patient.address || {},
            deliveryNotes: `Please deliver to ${patient.address?.street || 'address'}`
          },
          prescriptionFileURL: `https://example.com/prescriptions/prescription-${requestId}.pdf`,
          deliveryAddress: patient.address || {
            street: patient.address?.street || '123 Main St',
            city: patient.address?.city || 'New York',
            state: patient.address?.state || 'NY',
            zipCode: patient.address?.zipCode || '10001',
            country: 'USA'
          },
          payment: {
            method: paymentMethod,
            amount: 50 + Math.random() * 200, // Random amount between $50-$250
            currency: 'USD',
            status: status === 'completed' ? 'completed' : 'pending'
          },
          status: status,
          statusHistory: [{
            status: 'pending',
            updatedBy: patient._id,
            notes: 'Request submitted to pharmacy',
            timestamp: new Date(Date.now() - (j + 1) * 24 * 60 * 60 * 1000) // Different dates
          }],
          priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)],
          estimatedProcessingTime: 24
        });
        
        // Add status update if not pending
        if (status !== 'pending') {
          medicationRequest.statusHistory.push({
            status: status,
            updatedBy: pharmacy.user._id,
            notes: `Status updated to ${status}`,
            timestamp: new Date(Date.now() - j * 12 * 60 * 60 * 1000)
          });
        }
        
        await medicationRequest.save();
        medicationRequests.push(medicationRequest);
        console.log(`💊 Created medication request: ${requestId} for ${patient.name} → ${pharmacy.pharmacy.pharmacyName} (Status: ${status})`);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Pharmacies: ${createdPharmacies.length}`);
    console.log(`   - Patients: ${createdPatients.length}`);
    console.log(`   - Medication Requests: ${medicationRequests.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Pharmacy: abc@pharmacy.com / Pharmacy123');
    console.log('   Patient: john@patient.com / Patient123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
if (require.main === module) {
  seedPharmaciesAndRequests();
}

module.exports = { seedPharmaciesAndRequests };

