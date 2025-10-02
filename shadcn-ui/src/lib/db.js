// Mock MongoDB-like database for browser environment
// This simulates MongoDB operations using localStorage

class MockDatabase {
  constructor() {
    this.dbName = 'healthcare_dashboard';
    this.collections = {
      user_profiles: 'user_profiles',
      vital_readings: 'vital_readings',
      medications: 'medications',
      appointments: 'appointments'
    };
    this.initializeCollections();
  }

  initializeCollections() {
    // Initialize collections in localStorage if they don't exist
    Object.values(this.collections).forEach(collection => {
      const key = `${this.dbName}_${collection}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
  }

  getCollection(name) {
    const key = `${this.dbName}_${name}`;
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      console.error(`Error reading collection ${name}:`, error);
      return [];
    }
  }

  saveCollection(name, data) {
    const key = `${this.dbName}_${name}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving collection ${name}:`, error);
      return false;
    }
  }

  // Simulate MongoDB operations
  async findOne(collection, query) {
    const data = this.getCollection(collection);
    return data.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async find(collection, query = {}) {
    const data = this.getCollection(collection);
    if (Object.keys(query).length === 0) {
      return { 
        sort: (sortObj) => ({
          limit: (limitNum) => data.slice(0, limitNum),
          toArray: () => Promise.resolve(data)
        }),
        toArray: () => Promise.resolve(data)
      };
    }
    
    const filtered = data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });

    return {
      sort: (sortObj) => ({
        limit: (limitNum) => filtered.slice(0, limitNum),
        toArray: () => Promise.resolve(filtered)
      }),
      toArray: () => Promise.resolve(filtered)
    };
  }

  async insertOne(collection, document) {
    const data = this.getCollection(collection);
    const newDoc = {
      _id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...document,
      created_at: new Date().toISOString()
    };
    data.push(newDoc);
    this.saveCollection(collection, data);
    return { insertedId: newDoc._id };
  }

  async updateOne(collection, query, update, options = {}) {
    const data = this.getCollection(collection);
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });

    if (index === -1 && options.upsert) {
      // Create new document
      const newDoc = {
        _id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...query,
        ...update.$set,
        created_at: new Date().toISOString()
      };
      data.push(newDoc);
    } else if (index !== -1) {
      // Update existing document
      if (update.$set) {
        data[index] = { ...data[index], ...update.$set };
      }
    }

    this.saveCollection(collection, data);
    return { modifiedCount: index !== -1 ? 1 : 0 };
  }

  async deleteOne(collection, query) {
    const data = this.getCollection(collection);
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });

    if (index !== -1) {
      data.splice(index, 1);
      this.saveCollection(collection, data);
      return { deletedCount: 1 };
    }

    return { deletedCount: 0 };
  }

  // Initialize with sample data
  async initializeSampleData() {
    const sampleUserId = 'demo-user-123';
    
    // Check if sample data already exists
    const existingProfile = await this.findOne('user_profiles', { id: sampleUserId });
    if (existingProfile) {
      return; // Sample data already exists
    }

    // Create sample user profile
    await this.insertOne('user_profiles', {
      id: sampleUserId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      dateOfBirth: '1990-01-01',
      phone: '+1-555-0123',
      address: '123 Health St, Wellness City, WC 12345',
      emergencyContact: 'Jane Doe',
      allergies: ['Peanuts', 'Shellfish'],
      medications: ['Lisinopril', 'Metformin'],
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      subscription_tier: 'free',
      health_status: 'good'
    });

    // Create sample vital readings
    const vitalTypes = [
      { type: 'blood_pressure_systolic', value: 120, unit: 'mmHg' },
      { type: 'blood_pressure_diastolic', value: 80, unit: 'mmHg' },
      { type: 'heart_rate', value: 72, unit: 'bpm' },
      { type: 'temperature', value: 98.6, unit: '°F' },
      { type: 'weight', value: 175, unit: 'lbs' }
    ];

    for (let i = 0; i < 10; i++) {
      const randomVital = vitalTypes[Math.floor(Math.random() * vitalTypes.length)];
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      await this.insertOne('vital_readings', {
        user_id: sampleUserId,
        type: randomVital.type,
        value: randomVital.value + (Math.random() * 10 - 5), // Add some variation
        unit: randomVital.unit,
        timestamp: date.toISOString(),
        notes: i === 0 ? 'Latest reading' : ''
      });
    }

    // Create sample medications
    const sampleMeds = [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: '2024-01-01',
        adherence: 95,
        instructions: 'Take with food'
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: '2024-01-01',
        adherence: 88,
        instructions: 'Take with meals'
      }
    ];

    for (const med of sampleMeds) {
      await this.insertOne('medications', {
        user_id: sampleUserId,
        ...med,
        start_date: med.startDate,
        is_active: true
      });
    }

    console.log('Sample data initialized successfully');
  }
}

// Create singleton instance
const mockDB = new MockDatabase();

// Export functions that match the MongoDB interface
export const connectToDatabase = async () => {
  await mockDB.initializeSampleData();
  return { 
    client: mockDB, 
    db: {
      collection: (name) => ({
        findOne: (query) => mockDB.findOne(name, query),
        find: (query) => mockDB.find(name, query),
        insertOne: (doc) => mockDB.insertOne(name, doc),
        updateOne: (query, update, options) => mockDB.updateOne(name, query, update, options),
        deleteOne: (query) => mockDB.deleteOne(name, query)
      })
    }
  };
};

export const getDatabase = async () => {
  const { db } = await connectToDatabase();
  return db;
};

export const closeConnection = async () => {
  // No-op for localStorage implementation
  return Promise.resolve();
};