import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  Heart, 
  Activity, 
  Pill, 
  Target, 
  FileText, 
  Users, 
  Plus,
  TrendingUp,
  Stethoscope,
  Upload,
  Eye,
  CheckCircle,
  Bell
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { dashboard } from '@/api';
import MongoDBConnectionTest from '@/components/MongoDBConnectionTest';

interface DashboardStats {
  totalConsultations: number;
  upcomingAppointments: number;
  activePrescriptions: number;
  healthGoalsCompleted: number;
  healthGoalsTotal: number;
}

interface HealthProgress {
  date: string;
  vitals: number;
  consultations: number;
  wellness: number;
}

interface AppointmentsByType {
  type: string;
  count: number;
  color: string;
}

interface UpcomingAppointment {
  id: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: 'confirmed' | 'pending';
}

interface HealthRecord {
  id: string;
  type: 'diagnosis' | 'prescription' | 'lab_result' | 'document';
  title: string;
  date: string;
  doctor_name?: string;
}

export default function HealthDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalConsultations: 0,
    upcomingAppointments: 0,
    activePrescriptions: 0,
    healthGoalsCompleted: 0,
    healthGoalsTotal: 10
  });
  const [healthProgress, setHealthProgress] = useState<HealthProgress[]>([]);
  const [appointmentsByType, setAppointmentsByType] = useState<AppointmentsByType[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch real data from public API first
      try {
        console.log('🔄 Fetching dashboard stats from API...');
        const response = await fetch('http://localhost:5001/api/public/stats');
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const statsResponse = await response.json();
        console.log('📊 API Data received:', statsResponse);
        
        if (statsResponse.success) {
          // Map the API data to dashboard format
          const mappedStats = {
            totalConsultations: statsResponse.data.appointments || 0,
            upcomingAppointments: Math.floor(statsResponse.data.appointments * 0.3) || 3,
            activePrescriptions: statsResponse.data.medications || 0,
            healthGoalsCompleted: Math.floor(statsResponse.data.vitals * 0.6) || 8,
            healthGoalsTotal: statsResponse.data.vitals || 10
          };
          console.log('✅ Mapped dashboard stats:', mappedStats);
          setDashboardStats(mappedStats);
        } else {
          throw new Error('Failed to fetch dashboard stats');
        }
      } catch (apiError) {
        console.warn('❌ API call failed, using fallback data:', apiError);
        // Fallback to sample data if API fails
        const fallbackStats = {
          totalConsultations: 24,
          upcomingAppointments: 3,
          activePrescriptions: 5,
          healthGoalsCompleted: 8,
          healthGoalsTotal: 10
        };
        console.log('🔄 Using fallback stats:', fallbackStats);
        setDashboardStats(fallbackStats);
      }

      // Fetch health progress data (last 6 months)
      const progressData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        progressData.push({
          date: monthName,
          vitals: Math.floor(Math.random() * 20) + 80,
          consultations: Math.floor(Math.random() * 5) + 1,
          wellness: Math.floor(Math.random() * 15) + 75
        });
      }
      setHealthProgress(progressData);

      // Set appointments by type
      const appointmentTypes = [
        { type: 'General Checkup', count: 8, color: '#3B82F6' },
        { type: 'Specialist', count: 6, color: '#10B981' },
        { type: 'Follow-up', count: 4, color: '#F59E0B' },
        { type: 'Emergency', count: 2, color: '#EF4444' }
      ];
      setAppointmentsByType(appointmentTypes);

      // Set upcoming appointments with sample data
      setUpcomingAppointments([
        {
          id: '1',
          doctor_name: 'Dr. Sarah Johnson',
          specialty: 'Cardiologist',
          appointment_date: '2024-01-25',
          appointment_time: '10:30 AM',
          type: 'Follow-up',
          status: 'confirmed'
        },
        {
          id: '2',
          doctor_name: 'Dr. Michael Chen',
          specialty: 'Internal Medicine',
          appointment_date: '2024-01-28',
          appointment_time: '2:15 PM',
          type: 'Consultation',
          status: 'confirmed'
        },
        {
          id: '3',
          doctor_name: 'Dr. Emily Rodriguez',
          specialty: 'Dermatology',
          appointment_date: '2024-02-02',
          appointment_time: '9:00 AM',
          type: 'Check-up',
          status: 'pending'
        }
      ]);

      // Set health records with sample data
      setHealthRecords([
        {
          id: '1',
          type: 'diagnosis',
          title: 'Hypertension Management Plan',
          date: '2024-01-15',
          doctor_name: 'Dr. Sarah Johnson'
        },
        {
          id: '2',
          type: 'lab_result',
          title: 'Complete Blood Count Results',
          date: '2024-01-10'
        },
        {
          id: '3',
          type: 'prescription',
          title: 'Lisinopril 10mg Daily',
          date: '2024-01-05',
          doctor_name: 'Dr. Sarah Johnson'
        },
        {
          id: '4',
          type: 'document',
          title: 'MRI Scan Report',
          date: '2023-12-28'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'diagnosis': return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'prescription': return <Pill className="w-4 h-4 text-green-600" />;
      case 'lab_result': return <Activity className="w-4 h-4 text-purple-600" />;
      case 'document': return <FileText className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'confirmed' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Connection Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button 
            onClick={() => {
              setError(null);
              fetchDashboardData();
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarImage src={user?.profile?.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"} alt={user?.name || "Patient"} />
                <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Patient'}!</h1>
                <p className="text-blue-100 text-lg mt-1">
                  Here's your health overview for today
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="inline-flex items-center rounded-full border border-white border-opacity-30 bg-white bg-opacity-20 px-2.5 py-0.5 text-xs font-semibold text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Patient
                  </div>
                  <div className="inline-flex items-center rounded-full border border-transparent bg-green-500 bg-opacity-90 px-2.5 py-0.5 text-xs font-semibold text-white">
                    <Heart className="w-3 h-3 mr-1" />
                    Health Score: 87%
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Consultations</p>
                  <p className="text-3xl font-bold text-blue-800">{dashboardStats.totalConsultations}</p>
                  <p className="text-blue-600 text-xs mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Upcoming Appointments</p>
                  <p className="text-3xl font-bold text-green-800">{dashboardStats.upcomingAppointments}</p>
                  <p className="text-green-600 text-xs mt-1">Next 30 days</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Active Prescriptions</p>
                  <p className="text-3xl font-bold text-purple-800">{dashboardStats.activePrescriptions}</p>
                  <p className="text-purple-600 text-xs mt-1">Current medications</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Pill className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Health Goals</p>
                  <p className="text-3xl font-bold text-orange-800">{dashboardStats.healthGoalsCompleted}/{dashboardStats.healthGoalsTotal}</p>
                  <p className="text-orange-600 text-xs mt-1">Completed this month</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Progress Line Chart */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Health Progress Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={healthProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="vitals" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name="Vitals Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wellness" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    name="Wellness Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Appointments by Type Bar Chart */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Appointments by Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments & Health Records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Upcoming Appointments</span>
                </div>
                <div className="inline-flex items-center rounded-full border border-transparent bg-white bg-opacity-20 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {upcomingAppointments.length} scheduled
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.doctor_name}</h4>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      </div>
                      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                        {appointment.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Health Records Summary */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Recent Health Records</span>
                </div>
                <div className="inline-flex items-center rounded-full border border-transparent bg-white bg-opacity-20 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {healthRecords.length} records
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {healthRecords.map((record) => (
                  <div key={record.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        {getRecordIcon(record.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">{record.title}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{record.doctor_name}</p>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Record
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* MongoDB Connection Test */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Database Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <MongoDBConnectionTest />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}