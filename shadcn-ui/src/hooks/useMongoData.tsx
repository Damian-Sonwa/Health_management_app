import { useState, useEffect } from 'react';
import { getDatabase } from '../lib/db.js';

export interface UserProfile {
  _id?: string;
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  subscription_tier?: 'free' | 'premium';
  health_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VitalReading {
  _id?: string;
  id?: string;
  user_id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}

export interface Medication {
  _id?: string;
  id?: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate?: string;
  start_date?: string;
  end_date?: string;
  instructions?: string;
  is_active: boolean;
  adherence?: number;
}

export const useMongoData = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = 'demo-user-123'; // Demo user ID

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const db = await getDatabase();
      const profile = await db.collection('user_profiles').findOne({ id: userId });
      if (profile) {
        setUserProfile(profile as UserProfile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile');
    }
  };

  // Fetch vital readings
  const fetchVitals = async () => {
    try {
      const db = await getDatabase();
      const readings = await db.collection('vital_readings')
        .find({ user_id: userId })
        .sort({ timestamp: -1 })
        .limit(50);
      const vitalsArray = await readings.toArray();
      setVitals(vitalsArray as VitalReading[]);
    } catch (err) {
      console.error('Error fetching vitals:', err);
      setError('Failed to fetch vitals');
    }
  };

  // Fetch medications
  const fetchMedications = async () => {
    try {
      const db = await getDatabase();
      const meds = await db.collection('medications')
        .find({ user_id: userId, is_active: true })
        .sort({ start_date: -1 });
      const medsArray = await meds.toArray();
      setMedications(medsArray as Medication[]);
    } catch (err) {
      console.error('Error fetching medications:', err);
      setError('Failed to fetch medications');
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      const db = await getDatabase();
      await db.collection('user_profiles').updateOne(
        { id: userId },
        { 
          $set: { 
            ...updates, 
            updated_at: new Date().toISOString() 
          } 
        },
        { upsert: true }
      );
      await fetchUserProfile();
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw new Error('Failed to update user profile');
    }
  };

  // Add vital reading
  const addVital = async (vital: Omit<VitalReading, '_id' | 'id'>) => {
    try {
      const db = await getDatabase();
      const newVital = {
        ...vital,
        user_id: userId,
        timestamp: new Date().toISOString()
      };
      await db.collection('vital_readings').insertOne(newVital);
      await fetchVitals();
    } catch (err) {
      console.error('Error adding vital:', err);
      throw new Error('Failed to add vital reading');
    }
  };

  // Add medication
  const addMedication = async (medication: Omit<Medication, '_id' | 'id'>) => {
    try {
      const db = await getDatabase();
      const newMedication = {
        ...medication,
        user_id: userId,
        is_active: true,
        start_date: new Date().toISOString()
      };
      await db.collection('medications').insertOne(newMedication);
      await fetchMedications();
    } catch (err) {
      console.error('Error adding medication:', err);
      throw new Error('Failed to add medication');
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchVitals(),
          fetchMedications()
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return {
    userProfile,
    vitals,
    medications,
    loading,
    error,
    updateUserProfile,
    addVital,
    addMedication,
    refetch: () => {
      fetchUserProfile();
      fetchVitals();
      fetchMedications();
    }
  };
};