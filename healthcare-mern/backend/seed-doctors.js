const mongoose = require('mongoose');
require('dotenv').config();

const Doctor = require('./models/Doctor');

const MONGODB_URI = process.env.MONGODB_URI;

const sampleDoctors = [
  {
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    subSpecialty: 'Interventional Cardiology',
    qualifications: [
      { degree: 'MD', institution: 'Harvard Medical School', year: 2005 },
      { degree: 'Fellowship', institution: 'Johns Hopkins', year: 2010 }
    ],
    experience: 15,
    rating: 4.9,
    reviews: 342,
    phone: '+1 (555) 123-4567',
    email: 'dr.sarah.johnson@healthcarepro.com',
    clinic: {
      name: 'Heart Care Center',
      address: {
        street: '123 Medical Plaza',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
    },
    consultationFee: 250,
    languages: ['English', 'Spanish'],
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    bio: 'Board-certified cardiologist with over 15 years of experience specializing in interventional procedures and heart disease management.',
    telehealth: { video: true, audio: true, chat: false }
  },
  {
    name: 'Dr. Michael Chen',
    specialty: 'Internal Medicine',
    qualifications: [
      { degree: 'MD', institution: 'Stanford University', year: 2008 }
    ],
    experience: 12,
    rating: 4.8,
    reviews: 289,
    phone: '+1 (555) 234-5678',
    email: 'dr.michael.chen@healthcarepro.com',
    clinic: {
      name: 'Primary Care Associates',
      address: {
        street: '456 Health Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      }
    },
    consultationFee: 180,
    languages: ['English', 'Mandarin'],
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    bio: 'Experienced internal medicine physician focused on preventive care and chronic disease management.',
    telehealth: { video: true, audio: true, chat: true }
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    subSpecialty: 'Cosmetic Dermatology',
    qualifications: [
      { degree: 'MD', institution: 'Yale School of Medicine', year: 2010 },
      { degree: 'Residency', institution: 'Mayo Clinic', year: 2014 }
    ],
    experience: 10,
    rating: 4.7,
    reviews: 456,
    phone: '+1 (555) 345-6789',
    email: 'dr.emily.rodriguez@healthcarepro.com',
    clinic: {
      name: 'Skin Health Center',
      address: {
        street: '789 Dermatology Lane',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      }
    },
    consultationFee: 200,
    languages: ['English', 'Spanish', 'Portuguese'],
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    bio: 'Dermatology specialist with expertise in both medical and cosmetic procedures.',
    telehealth: { video: true, audio: false, chat: false }
  },
  {
    name: 'Dr. James Williams',
    specialty: 'Psychiatry',
    subSpecialty: 'Adult Psychiatry',
    qualifications: [
      { degree: 'MD', institution: 'Columbia University', year: 2007 }
    ],
    experience: 13,
    rating: 4.9,
    reviews: 523,
    phone: '+1 (555) 456-7890',
    email: 'dr.james.williams@healthcarepro.com',
    clinic: {
      name: 'Mind Wellness Center',
      address: {
        street: '321 Mental Health Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      }
    },
    consultationFee: 220,
    languages: ['English'],
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
    bio: 'Compassionate psychiatrist specializing in anxiety, depression, and mood disorders.',
    telehealth: { video: true, audio: true, chat: true }
  },
  {
    name: 'Dr. Lisa Park',
    specialty: 'Pediatrics',
    qualifications: [
      { degree: 'MD', institution: 'University of Pennsylvania', year: 2009 }
    ],
    experience: 11,
    rating: 4.8,
    reviews: 678,
    phone: '+1 (555) 567-8901',
    email: 'dr.lisa.park@healthcarepro.com',
    clinic: {
      name: 'Children\'s Health Clinic',
      address: {
        street: '555 Kids Avenue',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA'
      }
    },
    consultationFee: 160,
    languages: ['English', 'Korean'],
    photoUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
    bio: 'Dedicated pediatrician providing comprehensive care for infants, children, and adolescents.',
    telehealth: { video: true, audio: true, chat: false }
  },
  {
    name: 'Dr. Robert Thompson',
    specialty: 'Orthopedics',
    subSpecialty: 'Sports Medicine',
    qualifications: [
      { degree: 'MD', institution: 'Duke University', year: 2006 },
      { degree: 'Fellowship', institution: 'Cleveland Clinic', year: 2011 }
    ],
    experience: 14,
    rating: 4.6,
    reviews: 234,
    phone: '+1 (555) 678-9012',
    email: 'dr.robert.thompson@healthcarepro.com',
    clinic: {
      name: 'Orthopedic Sports Center',
      address: {
        street: '777 Sports Medicine Drive',
        city: 'Denver',
        state: 'CO',
        zipCode: '80201',
        country: 'USA'
      }
    },
    consultationFee: 280,
    languages: ['English'],
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
    bio: 'Orthopedic surgeon specializing in sports injuries and joint replacement.',
    telehealth: { video: true, audio: false, chat: false }
  }
];

async function seedDoctors() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'healthify_tracker'
    });
    
    const actualDb = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: ${actualDb}`);
    
    // Check if doctors already exist
    const existingDoctors = await Doctor.countDocuments();
    
    if (existingDoctors > 0) {
      console.log(`\nℹ️  ${existingDoctors} doctors already exist in database`);
      console.log('Skipping seed. Delete existing doctors to re-seed.');
      process.exit(0);
    }
    
    console.log('\n📋 Seeding doctors...');
    
    for (const doctorData of sampleDoctors) {
      const doctor = new Doctor(doctorData);
      await doctor.save();
      console.log(`   ✅ Added: ${doctor.name} (${doctor.specialty})`);
    }
    
    console.log(`\n✨ SEED COMPLETE!`);
    console.log(`   👨‍⚕️ Total doctors added: ${sampleDoctors.length}`);
    console.log(`   🏥 Specialties: Cardiology, Internal Medicine, Dermatology, Psychiatry, Pediatrics, Orthopedics`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();

