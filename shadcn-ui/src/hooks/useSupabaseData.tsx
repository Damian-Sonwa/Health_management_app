import { useState, useEffect } from 'react';
import { 
  vitals, 
  medications, 
  users, 
  dashboard, 
  carePlans, 
  telehealth, 
  wellness, 
  devices,
  subscription,
  settings
} from '../api.js';

// Custom hook for fetching user data from backend API
export const useSupabaseData = () => {
  const [user, setUser] = useState<any>(null);
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [medicationsData, setMedicationsData] = useState<any[]>([]);
  const [carePlansData, setCarePlansData] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [wellnessData, setWellnessData] = useState<any>(null);
  const [devicesData, setDevicesData] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // Get user from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Fetch all data with proper error handling
      const results = await Promise.allSettled([
        vitals.getAll(),
        medications.getAll(),
        carePlans.getAll(),
        telehealth.getAll(),
        wellness.getAll(),
        devices.getAll(),
        subscription.getCurrent(),
        settings.getAll(),
        dashboard.getStats()
      ]);

      // Handle vitals
      if (results[0].status === 'fulfilled' && results[0].value.success) {
        setVitalsData(results[0].value.data || []);
      } else {
        console.warn('Failed to fetch vitals');
        setVitalsData([]);
      }

      // Handle medications
      if (results[1].status === 'fulfilled' && results[1].value.success) {
        setMedicationsData(results[1].value.data || []);
      } else {
        console.warn('Failed to fetch medications');
        setMedicationsData([]);
      }

      // Handle care plans
      if (results[2].status === 'fulfilled' && results[2].value.success) {
        setCarePlansData(results[2].value.data || []);
      } else {
        console.warn('Failed to fetch care plans');
        setCarePlansData([]);
      }

      // Handle telehealth appointments
      if (results[3].status === 'fulfilled' && results[3].value.success) {
        setAppointments(results[3].value.data || []);
      } else {
        console.warn('Failed to fetch appointments');
        setAppointments([]);
      }

      // Handle wellness data
      if (results[4].status === 'fulfilled' && results[4].value.success) {
        setWellnessData(results[4].value.data);
      } else {
        console.warn('Failed to fetch wellness data');
        setWellnessData(null);
      }

      // Handle devices
      if (results[5].status === 'fulfilled' && results[5].value.success) {
        setDevicesData(results[5].value.data || []);
      } else {
        console.warn('Failed to fetch devices');
        setDevicesData([]);
      }

      // Handle subscription
      if (results[6].status === 'fulfilled' && results[6].value.success) {
        setSubscriptionData(results[6].value.data);
      } else {
        console.warn('Failed to fetch subscription');
        setSubscriptionData(null);
      }

      // Handle settings
      if (results[7].status === 'fulfilled' && results[7].value.success) {
        setSettingsData(results[7].value.data);
      } else {
        console.warn('Failed to fetch settings');
        setSettingsData(null);
      }

      // Handle dashboard stats
      if (results[8].status === 'fulfilled' && results[8].value.success) {
        setDashboardStats(results[8].value.data);
      } else {
        console.warn('Failed to fetch dashboard stats');
        setDashboardStats(null);
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for vitals
  const addVital = async (vitalData: any) => {
    try {
      const response = await vitals.create(vitalData);
      if (response.success) {
        setVitalsData(prev => [response.data, ...prev]);
        await refreshDashboard();
        return response.data;
      }
    } catch (err: any) {
      console.error('Error adding vital:', err);
      throw err;
    }
  };

  const updateVital = async (id: string, vitalData: any) => {
    try {
      const response = await vitals.update(id, vitalData);
      if (response.success) {
        setVitalsData(prev => prev.map(v => v._id === id ? response.data : v));
        await refreshDashboard();
        return response.data;
      }
    } catch (err: any) {
      console.error('Error updating vital:', err);
      throw err;
    }
  };

  const deleteVital = async (id: string) => {
    try {
      await vitals.delete(id);
      setVitalsData(prev => prev.filter(v => v._id !== id));
      await refreshDashboard();
    } catch (err: any) {
      console.error('Error deleting vital:', err);
      throw err;
    }
  };

  // CRUD operations for medications
  const addMedication = async (medicationData: any) => {
    try {
      const response = await medications.create(medicationData);
      if (response.success) {
        setMedicationsData(prev => [response.data, ...prev]);
        await refreshDashboard();
        return response.data;
      }
    } catch (err: any) {
      console.error('Error adding medication:', err);
      throw err;
    }
  };

  const updateMedication = async (id: string, medicationData: any) => {
    try {
      const response = await medications.update(id, medicationData);
      if (response.success) {
        setMedicationsData(prev => prev.map(m => m._id === id ? response.data : m));
        return response.data;
      }
    } catch (err: any) {
      console.error('Error updating medication:', err);
      throw err;
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      await medications.delete(id);
      setMedicationsData(prev => prev.filter(m => m._id !== id));
      await refreshDashboard();
    } catch (err: any) {
      console.error('Error deleting medication:', err);
      throw err;
    }
  };

  // User profile operations
  const updateProfile = async (profileData: any) => {
    try {
      const response = await users.updateProfile(profileData);
      if (response.success) {
        const updatedUser = { ...user, ...response.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  // Care plan operations
  const addCarePlan = async (carePlanData: any) => {
    try {
      const response = await carePlans.create(carePlanData);
      if (response.success) {
        setCarePlansData(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (err: any) {
      console.error('Error adding care plan:', err);
      throw err;
    }
  };

  // Telehealth operations
  const scheduleAppointment = async (appointmentData: any) => {
    try {
      const response = await telehealth.scheduleAppointment(appointmentData);
      if (response.success) {
        setAppointments(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (err: any) {
      console.error('Error scheduling appointment:', err);
      throw err;
    }
  };

  // Wellness operations
  const updateWellnessGoals = async (goalsData: any) => {
    try {
      const response = await wellness.updateGoals(goalsData);
      if (response.success) {
        setWellnessData(prev => ({ ...prev, goals: response.data }));
        return response.data;
      }
    } catch (err: any) {
      console.error('Error updating wellness goals:', err);
      throw err;
    }
  };

  // Device operations
  const connectDevice = async (deviceData: any) => {
    try {
      const response = await devices.connect(deviceData);
      if (response.success) {
        setDevicesData(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (err: any) {
      console.error('Error connecting device:', err);
      throw err;
    }
  };

  const syncDevice = async (deviceId: string) => {
    try {
      const response = await devices.sync(deviceId);
      if (response.success) {
        await refreshVitals();
        return response.data;
      }
    } catch (err: any) {
      console.error('Error syncing device:', err);
      throw err;
    }
  };

  // Settings operations
  const updateSettings = async (settingsData: any) => {
    try {
      const response = await settings.update(settingsData);
      if (response.success) {
        setSettingsData(response.data);
        return response.data;
      }
    } catch (err: any) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  // Subscription operations
  const upgradeSubscription = async (planData: any) => {
    try {
      const response = await subscription.upgrade(planData);
      if (response.success) {
        setSubscriptionData(response.data);
        return response.data;
      }
    } catch (err: any) {
      console.error('Error upgrading subscription:', err);
      throw err;
    }
  };

  // Refresh functions
  const refreshVitals = async () => {
    try {
      const response = await vitals.getAll();
      if (response.success) {
        setVitalsData(response.data || []);
      }
    } catch (err) {
      console.error('Error refreshing vitals:', err);
    }
  };

  const refreshMedications = async () => {
    try {
      const response = await medications.getAll();
      if (response.success) {
        setMedicationsData(response.data || []);
      }
    } catch (err) {
      console.error('Error refreshing medications:', err);
    }
  };

  const refreshDashboard = async () => {
    try {
      const response = await dashboard.getStats();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await users.getProfile();
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  // Refresh all data
  const refreshData = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    // Data - using renamed variables to avoid conflicts
    user,
    vitals: vitalsData,
    medications: medicationsData,
    carePlans: carePlansData,
    appointments,
    wellness: wellnessData,
    devices: devicesData,
    subscription: subscriptionData,
    settings: settingsData,
    dashboardStats,
    loading,
    error,
    
    // Vitals operations
    addVital,
    updateVital,
    deleteVital,
    
    // Medications operations
    addMedication,
    updateMedication,
    deleteMedication,
    
    // User operations
    updateProfile,
    
    // Care plan operations
    addCarePlan,
    
    // Telehealth operations
    scheduleAppointment,
    
    // Wellness operations
    updateWellnessGoals,
    
    // Device operations
    connectDevice,
    syncDevice,
    
    // Settings operations
    updateSettings,
    
    // Subscription operations
    upgradeSubscription,
    
    // Refresh functions
    refreshData,
    refreshVitals,
    refreshMedications,
    refreshDashboard,
    refreshProfile,
    
    // State setters
    setUser,
    setVitals: setVitalsData,
    setMedications: setMedicationsData,
  };
};

export default useSupabaseData;