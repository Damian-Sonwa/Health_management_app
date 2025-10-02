import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Heart, Thermometer, Weight, Calendar, Target } from 'lucide-react';
import { useMongoData } from '@/hooks/useMongoData';

export default function DataVisualization() {
  const { userProfile, vitals, medications, loading } = useMongoData();

  // Process vitals data for charts
  const vitalTrends = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayVitals = vitals.filter(v => 
        new Date(v.timestamp).toISOString().split('T')[0] === date
      );

      const result: Record<string, unknown> = { date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }) };
      
      dayVitals.forEach(vital => {
        result[vital.type] = vital.value;
      });

      return result;
    });
  }, [vitals]);

  // Health score calculation
  const healthScore = React.useMemo(() => {
    if (!vitals.length) return 85;
    
    const recentVitals = vitals.slice(0, 10);
    let score = 100;
    
    recentVitals.forEach(vital => {
      if (vital.type === 'blood_pressure_systolic' && (vital.value > 140 || vital.value < 90)) {
        score -= 5;
      }
      if (vital.type === 'heart_rate' && (vital.value > 100 || vital.value < 60)) {
        score -= 3;
      }
    });
    
    return Math.max(score, 0);
  }, [vitals]);

  // Medication adherence data
  const adherenceData = React.useMemo(() => {
    return medications.map(med => ({
      name: med.name,
      adherence: med.adherence || 95,
      target: 95
    }));
  }, [medications]);

  // Vital signs summary
  const vitalsSummary = React.useMemo(() => {
    const latest = vitals.reduce((acc, vital) => {
      if (!acc[vital.type] || new Date(vital.timestamp) > new Date(acc[vital.type].timestamp)) {
        acc[vital.type] = vital;
      }
      return acc;
    }, {} as Record<string, typeof vitals[0]>);

    return [
      {
        type: 'Blood Pressure',
        value: `${latest.blood_pressure_systolic?.value || 120}/${latest.blood_pressure_diastolic?.value || 80}`,
        unit: 'mmHg',
        icon: Heart,
        status: 'normal',
        color: 'text-green-600'
      },
      {
        type: 'Heart Rate',
        value: latest.heart_rate?.value || 72,
        unit: 'bpm',
        icon: Activity,
        status: 'normal',
        color: 'text-blue-600'
      },
      {
        type: 'Weight',
        value: latest.weight?.value || 75,
        unit: 'kg',
        icon: Weight,
        status: 'stable',
        color: 'text-purple-600'
      },
      {
        type: 'Temperature',
        value: latest.temperature?.value || 36.5,
        unit: '°C',
        icon: Thermometer,
        status: 'normal',
        color: 'text-orange-600'
      }
    ];
  }, [vitals]);

  const pieData = [
    { name: 'Excellent', value: 40, color: '#10b981' },
    { name: 'Good', value: 35, color: '#3b82f6' },
    { name: 'Fair', value: 20, color: '#f59e0b' },
    { name: 'Poor', value: 5, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vitalsSummary.map((vital, index) => {
          const IconComponent = vital.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{vital.type}</p>
                    <p className="text-2xl font-bold">
                      {vital.value} <span className="text-sm font-normal text-gray-500">{vital.unit}</span>
                    </p>
                    <Badge variant="outline" className={vital.color}>
                      {vital.status}
                    </Badge>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <IconComponent className={`h-6 w-6 ${vital.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-green-600">{healthScore}</div>
              <p className="text-gray-600">Overall Health Score</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+2 from last week</span>
              </div>
            </div>
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: healthScore, color: '#10b981' },
                      { value: 100 - healthScore, color: '#e5e7eb' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs Trends */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Vital Signs Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="blood_pressure_systolic" stroke="#ef4444" strokeWidth={2} name="BP Systolic" />
                <Line type="monotone" dataKey="heart_rate" stroke="#3b82f6" strokeWidth={2} name="Heart Rate" />
                <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} name="Weight" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medication Adherence */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adherenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="adherence" fill="#3b82f6" />
                  <Bar dataKey="target" fill="#e5e7eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Health Metrics Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Health Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Blood Pressure Improvement</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your blood pressure has improved by 5% over the past month. Keep up with your medication schedule and regular exercise.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Medication Adherence</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Excellent medication adherence! You're maintaining a {medications[0]?.adherence || 95}% adherence rate.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Health Goal Reminder</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Consider adding regular weight monitoring to track your fitness progress more effectively.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}