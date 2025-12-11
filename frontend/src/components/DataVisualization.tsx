import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Heart, Droplet, Calendar, AlertCircle, CheckCircle2, Info, BarChart3, Award, Target, Zap } from 'lucide-react';
import { useVitals } from '@/hooks/useVitals';
import { useMedications } from '@/hooks/useMedications';
import { useAppointments } from '@/hooks/useAppointments';
import { format, subDays, isAfter, isBefore } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export default function DataVisualization() {
  const queryClient = useQueryClient();
  const { vitals, isLoading: vitalsLoading, refetch: refetchVitals } = useVitals();
  const { medications, isLoading: medsLoading, refetch: refetchMeds } = useMedications();
  const { appointments, isLoading: apptLoading, refetch: refetchAppts } = useAppointments();
  
  const loading = vitalsLoading || medsLoading || apptLoading;

  // Socket.IO for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!userId || !token) return;

    // Get Socket URL based on environment
    const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001'
      : 'https://health-management-app-joj5.onrender.com';

    const socket: Socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('📊 Analytics connected to Socket.IO');
      socket.emit('authenticate', { userId, token });
    });

    socket.on('data-updated', (data: { type: string }) => {
      console.log('📊 Data updated:', data.type);
      
      // Refetch relevant data
      if (data.type === 'vital' || data.type === 'all') {
        refetchVitals();
      }
      if (data.type === 'medication' || data.type === 'all') {
        refetchMeds();
      }
      if (data.type === 'appointment' || data.type === 'all') {
        refetchAppts();
      }

      // Invalidate all queries to ensure fresh data
      queryClient.invalidateQueries();
    });

    socket.on('disconnect', () => {
      console.log('📊 Analytics disconnected from Socket.IO');
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, refetchVitals, refetchMeds, refetchAppts]);

  // Calculate weekly summary (last 7 days)
  const weeklySummary = React.useMemo(() => {
    if (!vitals || vitals.length === 0) return null;
    
    const sevenDaysAgo = subDays(new Date(), 7);
    const weeklyVitals = vitals.filter(v => {
      const date = v.recordedAt || v.createdAt;
      return date && isAfter(new Date(date), sevenDaysAgo);
    });
    
    const bpReadings = weeklyVitals.filter(v => v.type === 'Blood Pressure');
    const glucoseReadings = weeklyVitals.filter(v => v.type === 'Blood Sugar');
    
    // Calculate average BP
    let avgSystolic = 0, avgDiastolic = 0;
    if (bpReadings.length > 0) {
      const bpValues = bpReadings
        .filter(v => typeof v.value === 'string' && v.value.includes('/'))
        .map(v => {
          const [sys, dia] = String(v.value).split('/').map(Number);
          return { sys, dia };
        });
      if (bpValues.length > 0) {
        avgSystolic = Math.round(bpValues.reduce((sum, v) => sum + v.sys, 0) / bpValues.length);
        avgDiastolic = Math.round(bpValues.reduce((sum, v) => sum + v.dia, 0) / bpValues.length);
      }
    }
    
    // Calculate average glucose
    let avgGlucose = 0;
    if (glucoseReadings.length > 0) {
      avgGlucose = Math.round(glucoseReadings.reduce((sum, v) => sum + Number(v.value), 0) / glucoseReadings.length);
    }
    
    return {
      totalReadings: weeklyVitals.length,
      bpReadings: bpReadings.length,
      glucoseReadings: glucoseReadings.length,
      avgSystolic,
      avgDiastolic,
      avgGlucose,
      daysTracked: new Set(weeklyVitals.map(v => {
        const date = v.recordedAt || v.createdAt;
        return date ? format(new Date(date), 'yyyy-MM-dd') : '';
      }).filter(Boolean)).size
    };
  }, [vitals]);

  // Badge calculation
  const badges = React.useMemo(() => {
    const earnedBadges = [];
    
    if (weeklySummary) {
      // Consistency Badge
      if (weeklySummary.daysTracked >= 7) {
        earnedBadges.push({
          name: '7-Day Streak',
          description: 'Tracked health data every day this week',
          icon: Zap,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700'
        });
      } else if (weeklySummary.daysTracked >= 5) {
        earnedBadges.push({
          name: '5-Day Warrior',
          description: 'Tracked health data 5 days this week',
          icon: Target,
          color: 'bg-blue-500',
          textColor: 'text-blue-700'
        });
      }
      
      // BP Control Badge
      if (weeklySummary.bpReadings >= 7 && weeklySummary.avgSystolic < 130 && weeklySummary.avgDiastolic < 85) {
        earnedBadges.push({
          name: 'BP Champion',
          description: 'Maintained healthy blood pressure all week',
          icon: Heart,
          color: 'bg-red-500',
          textColor: 'text-red-700'
        });
      }
      
      // Glucose Control Badge
      if (weeklySummary.glucoseReadings >= 7 && weeklySummary.avgGlucose < 110) {
        earnedBadges.push({
          name: 'Sugar Master',
          description: 'Maintained healthy glucose levels all week',
          icon: Droplet,
          color: 'bg-blue-500',
          textColor: 'text-blue-700'
        });
      }
      
      // Active Tracker Badge
      if (weeklySummary.totalReadings >= 14) {
        earnedBadges.push({
          name: 'Super Tracker',
          description: 'Recorded 14+ health readings this week',
          icon: Award,
          color: 'bg-purple-500',
          textColor: 'text-purple-700'
        });
      }
    }
    
    return earnedBadges;
  }, [weeklySummary]);

  // Process Blood Pressure trends (last 7 readings)
  const bloodPressureTrends = React.useMemo(() => {
    if (!vitals || vitals.length === 0) return [];
    
    const bpReadings = vitals
      .filter(v => v.type === 'Blood Pressure' && typeof v.value === 'string' && v.value.includes('/'))
      .slice(0, 7)
      .reverse();
    
    return bpReadings.map((v, idx) => {
      const [systolic, diastolic] = String(v.value).split('/').map(Number);
      const date = v.recordedAt || v.createdAt;
      return {
        reading: `Reading ${idx + 1}`,
        date: date ? format(new Date(date), 'MMM dd') : 'N/A',
        Systolic: systolic,
        Diastolic: diastolic,
        'Normal Range': 120,
      };
    });
  }, [vitals]);

  // Process Blood Glucose trends (last 7 readings)
  const bloodGlucoseTrends = React.useMemo(() => {
    if (!vitals || vitals.length === 0) return [];
    
    const glucoseReadings = vitals
      .filter(v => v.type === 'Blood Sugar')
      .slice(0, 7)
      .reverse();
    
    return glucoseReadings.map((v, idx) => {
      const date = v.recordedAt || v.createdAt;
      return {
        reading: `Reading ${idx + 1}`,
        date: date ? format(new Date(date), 'MMM dd') : 'N/A',
        'Blood Glucose': Number(v.value),
        'Target': 100,
      };
    });
  }, [vitals]);

  // Latest vitals summary cards
  const latestVitalCards = React.useMemo(() => {
    if (!vitals || vitals.length === 0) {
      return [
        { type: 'Blood Pressure', value: 'No data', icon: Heart, color: 'bg-red-100 text-red-600' },
        { type: 'Blood Glucose', value: 'No data', icon: Droplet, color: 'bg-blue-100 text-blue-600' },
      ];
    }
    
    const bpVital = vitals.find(v => v.type === 'Blood Pressure');
    const glucoseVital = vitals.find(v => v.type === 'Blood Sugar');
    
    const bpDate = bpVital ? (bpVital.recordedAt || bpVital.createdAt) : null;
    const glucoseDate = glucoseVital ? (glucoseVital.recordedAt || glucoseVital.createdAt) : null;
    
    return [
      { 
        type: 'Blood Pressure', 
        value: bpVital?.value ? String(bpVital.value) : 'No data',
        unit: 'mmHg',
        date: bpDate ? format(new Date(bpDate), 'MMM dd, yyyy') : '',
        icon: Heart,
        color: 'bg-red-100 text-red-600'
      },
      { 
        type: 'Blood Glucose', 
        value: glucoseVital?.value ? String(glucoseVital.value) : 'No data',
        unit: 'mg/dL',
        date: glucoseDate ? format(new Date(glucoseDate), 'MMM dd, yyyy') : '',
        icon: Droplet,
        color: 'bg-blue-100 text-blue-600'
      },
    ];
  }, [vitals]);

  // Medication status pie chart
  const medicationStatus = React.useMemo(() => {
    if (!medications || medications.length === 0) {
      return [
        { name: 'No Medications', value: 1, color: '#e5e7eb' }
      ];
    }
    
    const active = medications.filter(m => m.isActive).length;
    const inactive = medications.length - active;
    
    const data = [];
    if (active > 0) data.push({ name: 'Active Medications', value: active, color: '#10b981' });
    if (inactive > 0) data.push({ name: 'Inactive/Completed', value: inactive, color: '#9ca3af' });
    
    return data;
  }, [medications]);

  // Health insights
  const healthInsights = React.useMemo(() => {
    const insights = [];
    
    // Check blood pressure readings
    if (bloodPressureTrends.length > 0) {
      const latestBP = bloodPressureTrends[bloodPressureTrends.length - 1];
      if (latestBP.Systolic > 140 || latestBP.Diastolic > 90) {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'High Blood Pressure Detected',
          message: `Your latest reading (${latestBP.Systolic}/${latestBP.Diastolic} mmHg) is above normal. Consider consulting your doctor.`,
          color: 'border-red-500 bg-red-50'
        });
      } else if (latestBP.Systolic >= 120 && latestBP.Systolic <= 140) {
        insights.push({
          type: 'info',
          icon: Info,
          title: 'Blood Pressure in Good Range',
          message: `Your blood pressure is within normal range. Keep up with your healthy habits!`,
          color: 'border-blue-500 bg-blue-50'
        });
      }
    }
    
    // Check glucose readings
    if (bloodGlucoseTrends.length > 0) {
      const latestGlucose = bloodGlucoseTrends[bloodGlucoseTrends.length - 1];
      if (latestGlucose['Blood Glucose'] > 140) {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'Elevated Blood Glucose',
          message: `Your latest glucose reading (${latestGlucose['Blood Glucose']} mg/dL) is above target. Monitor your diet and medications.`,
          color: 'border-orange-500 bg-orange-50'
        });
      } else {
        insights.push({
          type: 'success',
          icon: CheckCircle2,
          title: 'Blood Glucose Under Control',
          message: `Great job! Your glucose levels are well-maintained.`,
          color: 'border-green-500 bg-green-50'
        });
      }
    }
    
    // Check medication adherence
    if (medications && medications.length > 0) {
      const activeCount = medications.filter(m => m.isActive).length;
      insights.push({
        type: 'info',
        icon: Info,
        title: 'Medication Management',
        message: `You're currently taking ${activeCount} active medication${activeCount !== 1 ? 's' : ''}. Stay consistent with your schedule!`,
        color: 'border-purple-500 bg-purple-50'
      });
    }
    
    return insights;
  }, [bloodPressureTrends, bloodGlucoseTrends, medications]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasNoData = (!vitals || vitals.length === 0) && (!medications || medications.length === 0) && (!appointments || appointments.length === 0);

  if (hasNoData) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              Start tracking your health by recording vitals, medications, and appointments.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => window.location.href = '/vitals'}>
                Record Vitals
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/medications'}>
                Add Medication
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Health Analytics</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your progress and earn badges for consistent health monitoring</p>
      </div>

      {/* Weekly Summary & Badges */}
      {weeklySummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Summary Card */}
          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-6 w-6" />
                This Week's Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm text-teal-100">Total Readings</p>
                  <p className="text-3xl font-bold">{weeklySummary.totalReadings}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm text-teal-100">Days Tracked</p>
                  <p className="text-3xl font-bold">{weeklySummary.daysTracked}/7</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm text-teal-100">Avg BP</p>
                  <p className="text-xl font-bold">{weeklySummary.avgSystolic}/{weeklySummary.avgDiastolic}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm text-teal-100">Avg Glucose</p>
                  <p className="text-xl font-bold">{weeklySummary.avgGlucose}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                Earned Badges
              </CardTitle>
              <CardDescription>Keep tracking to earn more badges!</CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="space-y-3">
                  {badges.map((badge, idx) => {
                    const IconComponent = badge.icon;
                    return (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${badge.color} bg-opacity-10 border-2 border-${badge.color.replace('bg-', '')}`}>
                        <div className={`p-2 rounded-full ${badge.color}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${badge.textColor}`}>{badge.name}</p>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">No badges yet. Keep tracking your health!</p>
                  <p className="text-sm text-gray-500 mt-2">Track for 7 consecutive days to earn your first badge</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Latest Readings - Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {latestVitalCards.map((vital, index) => {
          const IconComponent = vital.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${vital.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{vital.type}</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{vital.value}</p>
                    {vital.unit && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{vital.unit}</p>}
                    {vital.date && <p className="text-xs text-gray-500 mt-2">Last recorded: {vital.date}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Blood Pressure Trends */}
      {bloodPressureTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Blood Pressure Trend
            </CardTitle>
            <CardDescription>
              Your last {bloodPressureTrends.length} blood pressure readings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bloodPressureTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    label={{ value: 'mmHg', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Systolic" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Diastolic" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Normal Range" 
                    stroke="#9ca3af" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Systolic (Top Number)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Diastolic (Bottom Number)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blood Glucose Trends */}
      {bloodGlucoseTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-600" />
              Blood Glucose Trend
            </CardTitle>
            <CardDescription>
              Your last {bloodGlucoseTrends.length} blood glucose readings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bloodGlucoseTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    label={{ value: 'mg/dL', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="Blood Glucose" 
                    fill="#3b82f6" 
                    radius={[8, 8, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Target" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Your Reading</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500" style={{ borderTop: '2px dashed #10b981', height: '0px', width: '16px' }}></div>
                <span className="text-gray-600">Target Level</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication Status & Health Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medication Status */}
        {medications && medications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Medication Status
              </CardTitle>
              <CardDescription>
                Overview of your current medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={medicationStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {medicationStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Insights */}
        {healthInsights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Health Insights
              </CardTitle>
              <CardDescription>
                Personalized insights based on your recent data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthInsights.slice(0, 3).map((insight, idx) => {
                  const IconComponent = insight.icon;
                  return (
                    <div key={idx} className={`p-3 rounded-lg border-l-4 ${insight.color}`}>
                      <div className="flex items-start gap-3">
                        <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${insight.color.replace('bg-', 'text-').replace('-50', '-600')}`} />
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${insight.color.replace('bg-', 'text-').replace('-50', '-900')}`}>
                            {insight.title}
                          </h4>
                          <p className={`text-xs mt-1 ${insight.color.replace('bg-', 'text-').replace('-50', '-700')}`}>
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
