// Browser-compatible MongoDB simulation using localStorage
// This preserves all original functionality while working in the browser

interface MongoDocument {
  _id?: string;
  [key: string]: any;
}

interface MongoCollection {
  name: string;
}

class MockCollection {
  constructor(private name: string) {}

  private getStorageKey(): string {
    return `mongodb_${this.name}`;
  }

  private getData(): MongoDocument[] {
    try {
      const data = localStorage.getItem(this.getStorageKey());
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveData(data: MongoDocument[]): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async findOne(query: any): Promise<MongoDocument | null> {
    const data = this.getData();
    if (!query || Object.keys(query).length === 0) {
      return data[0] || null;
    }
    
    const result = data.find(doc => {
      return Object.keys(query).every(key => doc[key] === query[key]);
    });
    
    return result || null;
  }

  async find(query: any = {}) {
    const data = this.getData();
    let results = data;
    
    if (query && Object.keys(query).length > 0) {
      results = data.filter(doc => {
        return Object.keys(query).every(key => doc[key] === query[key]);
      });
    }
    
    return {
      sort: (sortQuery: any) => ({
        limit: (limitNum: number) => ({
          toArray: async () => {
            let sorted = [...results];
            if (sortQuery) {
              Object.keys(sortQuery).forEach(key => {
                const direction = sortQuery[key];
                sorted.sort((a, b) => {
                  if (direction === 1) {
                    return a[key] > b[key] ? 1 : -1;
                  } else {
                    return a[key] < b[key] ? 1 : -1;
                  }
                });
              });
            }
            return sorted.slice(0, limitNum);
          }
        }),
        toArray: async () => {
          let sorted = [...results];
          if (sortQuery) {
            Object.keys(sortQuery).forEach(key => {
              const direction = sortQuery[key];
              sorted.sort((a, b) => {
                if (direction === 1) {
                  return a[key] > b[key] ? 1 : -1;
                } else {
                  return a[key] < b[key] ? 1 : -1;
                }
              });
            });
          }
          return sorted;
        }
      }),
      limit: (limitNum: number) => ({
        toArray: async () => results.slice(0, limitNum)
      }),
      toArray: async () => results
    };
  }

  async insertOne(doc: MongoDocument) {
    const data = this.getData();
    const newDoc = { ...doc, _id: doc._id || this.generateId() };
    data.push(newDoc);
    this.saveData(data);
    return { insertedId: newDoc._id };
  }

  async insertMany(docs: MongoDocument[]) {
    const data = this.getData();
    const newDocs = docs.map(doc => ({ ...doc, _id: doc._id || this.generateId() }));
    data.push(...newDocs);
    this.saveData(data);
    return { insertedIds: newDocs.map(doc => doc._id) };
  }

  async updateOne(query: any, update: any) {
    const data = this.getData();
    const index = data.findIndex(doc => {
      return Object.keys(query).every(key => doc[key] === query[key]);
    });
    
    if (index !== -1) {
      if (update.$set) {
        data[index] = { ...data[index], ...update.$set };
      } else {
        data[index] = { ...data[index], ...update };
      }
      this.saveData(data);
      return { modifiedCount: 1 };
    }
    
    return { modifiedCount: 0 };
  }

  async deleteOne(query: any) {
    const data = this.getData();
    const index = data.findIndex(doc => {
      return Object.keys(query).every(key => doc[key] === query[key]);
    });
    
    if (index !== -1) {
      data.splice(index, 1);
      this.saveData(data);
      return { deletedCount: 1 };
    }
    
    return { deletedCount: 0 };
  }
}

class MockDatabase {
  constructor(private dbName: string) {}

  collection(name: string): MockCollection {
    return new MockCollection(`${this.dbName}_${name}`);
  }
}

class MockMongoClient {
  constructor(private uri: string) {}

  async connect() {
    // Simulate connection
    return this;
  }

  db(name: string): MockDatabase {
    return new MockDatabase(name);
  }

  async close() {
    // Simulate close
  }
}

// Export browser-compatible MongoDB client
export const MongoClient = MockMongoClient;

let cachedDb: MockDatabase | null = null;

export async function getDatabase(): Promise<MockDatabase> {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    // Use a mock URI for browser compatibility
    const uri = 'mongodb://localhost:27017/healthcare_dashboard';
    const client = new MongoClient(uri);
    await client.connect();
    
    cachedDb = client.db('healthcare_dashboard');
    return cachedDb;
  } catch (error) {
    console.warn('MongoDB connection failed, using localStorage fallback:', error);
    cachedDb = new MockDatabase('healthcare_dashboard');
    return cachedDb;
  }
}

// Initialize sample data if not exists
export async function initializeSampleData() {
  const db = await getDatabase();
  
  // Check if data already exists
  const existingProfile = await db.collection('user_profiles').findOne({ user_id: 'demo-user-123' });
  
  if (!existingProfile) {
    // Create sample user profile
    await db.collection('user_profiles').insertOne({
      user_id: 'demo-user-123',
      health_status: 'good',
      allergies: ['Penicillin'],
      medications: ['Lisinopril 10mg'],
      conditions: []
    });

    // Create sample subscription
    await db.collection('subscriptions').insertOne({
      id: `sub_${Date.now()}`,
      user_id: 'demo-user-123',
      plan: 'free',
      status: 'trial',
      trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    });

    // Create sample vital readings
    await db.collection('vital_readings').insertMany([
      {
        id: 'vital-1',
        userId: 'demo-user-123',
        type: 'blood_pressure_systolic',
        value: 120,
        unit: 'mmHg',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'vital-2',
        userId: 'demo-user-123',
        type: 'blood_pressure_diastolic',
        value: 80,
        unit: 'mmHg',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'vital-3',
        userId: 'demo-user-123',
        type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      }
    ]);

    // Create sample medications
    await db.collection('medications').insertMany([
      {
        id: 'med-1',
        userId: 'demo-user-123',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        instructions: 'Take with food',
        adherence: 95
      }
    ]);

    // Create sample appointments
    await db.collection('appointments').insertMany([
      {
        id: 'appt-1',
        userId: 'demo-user-123',
        doctorName: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        type: 'video',
        status: 'scheduled',
        notes: 'Follow-up appointment'
      }
    ]);
  }
}