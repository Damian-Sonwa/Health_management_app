import { useState, useEffect } from 'react';
import { getDatabase } from '../lib/mongodb';

export interface UserProfile {
  _id?: string;
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  subscription_tier: 'free' | 'premium';
  created_at: Date;
  updated_at: Date;
}

export interface VitalReading {
  _id?: string;
  id: string;
  user_id: string;
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_sugar';
  value: string;
  unit: string;
  recorded_at: Date;
  notes?: string;
}

export interface Medication {
  _id?: string;
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: Date;
  end_date?: Date;
  instructions?: string;
  is_active: boolean;
}

export interface Appointment {
  _id?: string;
  id: string;
  user_id: string;
  doctor_name: string;
  specialty: string;
  date: Date;
  time: string;
  type: 'video' | 'in_person' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export const useMongoDBData = (userId: string) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vitalReadings, setVitalReadings] = useState<VitalReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const fetchVitalReadings = async () => {
    try {
      const db = await getDatabase();
      const readings = await db.collection('vital_readings')
        .find({ user_id: userId })
        .sort({ recorded_at: -1 })
        .limit(50)
        .toArray();
      setVitalReadings(readings as VitalReading[]);
    } catch (err) {
      console.error('Error fetching vital readings:', err);
      setError('Failed to fetch vital readings');
    }
  };

  // Fetch medications
  const fetchMedications = async () => {
    try {
      const db = await getDatabase();
      const meds = await db.collection('medications')
        .find({ user_id: userId, is_active: true })
        .sort({ start_date: -1 })
        .toArray();
      setMedications(meds as Medication[]);
    } catch (err) {
      console.error('Error fetching medications:', err);
      setError('Failed to fetch medications');
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const db = await getDatabase();
      const appts = await db.collection('appointments')
        .find({ user_id: userId })
        .sort({ date: 1 })
        .toArray();
      setAppointments(appts as Appointment[]);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
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
            updated_at: new Date() 
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
  const addVitalReading = async (reading: Omit<VitalReading, '_id' | 'id'>) => {
    try {
      const db = await getDatabase();
      const newReading = {
        ...reading,
        id: `vital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recorded_at: new Date()
      };
      await db.collection('vital_readings').insertOne(newReading);
      await fetchVitalReadings();
    } catch (err) {
      console.error('Error adding vital reading:', err);
      throw new Error('Failed to add vital reading');
    }
  };

  // Add medication
  const addMedication = async (medication: Omit<Medication, '_id' | 'id'>) => {
    try {
      const db = await getDatabase();
      const newMedication = {
        ...medication,
        id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        is_active: true
      };
      await db.collection('medications').insertOne(newMedication);
      await fetchMedications();
    } catch (err) {
      console.error('Error adding medication:', err);
      throw new Error('Failed to add medication');
    }
  };

  // Book appointment
  const bookAppointment = async (appointment: Omit<Appointment, '_id' | 'id'>) => {
    try {
      const db = await getDatabase();
      const newAppointment = {
        ...appointment,
        id: `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'scheduled' as const
      };
      await db.collection('appointments').insertOne(newAppointment);
      await fetchAppointments();
    } catch (err) {
      console.error('Error booking appointment:', err);
      throw new Error('Failed to book appointment');
    }
  };

  // Update subscription tier
  const updateSubscriptionTier = async (tier: 'free' | 'premium') => {
    try {
      await updateUserProfile({ subscription_tier: tier });
    } catch (err) {
      console.error('Error updating subscription tier:', err);
      throw new Error('Failed to update subscription tier');
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchVitalReadings(),
          fetchMedications(),
          fetchAppointments()
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  return {
    userProfile,
    vitalReadings,
    medications,
    appointments,
    loading,
    error,
    updateUserProfile,
    addVitalReading,
    addMedication,
    bookAppointment,
    updateSubscriptionTier,
    refetch: () => {
      fetchUserProfile();
      fetchVitalReadings();
      fetchMedications();
      fetchAppointments();
    }
  };
};