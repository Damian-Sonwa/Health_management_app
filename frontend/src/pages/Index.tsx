import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, TrendingUp, Heart, Activity, Thermometer, Droplets, User, Bell, Settings } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">HealthCare Dashboard</h1>
              </div>
            </div>
            
            {/* Medical Device Images */}
            <div className="flex items-center space-x-4">
              <img 
                src="/images/bp-machine.jpg" 
                alt="Blood Pressure Machine" 
                className="w-16 h-16 object-cover rounded-lg shadow-md"
              />
              <img 
                src="/images/glucose-machine.jpg" 
                alt="Glucose Machine" 
                className="w-16 h-16 object-cover rounded-lg shadow-md"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Blood Pressure</p>
                  <p className="text-2xl font-bold">120/80</p>
                  <p className="text-red-100 text-xs">mmHg</p>
                </div>
                <Heart className="h-8 w-8 text-red-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Blood Glucose</p>
                  <p className="text-2xl font-bold">95</p>
                  <p className="text-blue-100 text-xs">mg/dL</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Heart Rate</p>
                  <p className="text-2xl font-bold">72</p>
                  <p className="text-green-100 text-xs">bpm</p>
                </div>
                <Activity className="h-8 w-8 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Temperature</p>
                  <p className="text-2xl font-bold">98.6°F</p>
                  <p className="text-orange-100 text-xs">Normal</p>
                </div>
                <Thermometer className="h-8 w-8 text-orange-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Progress & Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Health Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Health Progress</span>
              </CardTitle>
              <CardDescription>Your health metrics over the past week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Blood Pressure Goal</span>
                  <span className="text-sm text-gray-500">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Glucose Control</span>
                  <span className="text-sm text-gray-500">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Medication Adherence</span>
                  <span className="text-sm text-gray-500">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Exercise Goals</span>
                  <span className="text-sm text-gray-500">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>Upcoming Appointments</span>
              </CardTitle>
              <CardDescription>Your scheduled healthcare visits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Dr. Sarah Johnson</p>
                  <p className="text-sm text-gray-500">Cardiology Consultation</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Tomorrow, 2:00 PM</span>
                  </div>
                </div>
                <Badge variant="secondary">Video Call</Badge>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Dr. Michael Chen</p>
                  <p className="text-sm text-gray-500">Diabetes Follow-up</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Friday, 10:30 AM</span>
                  </div>
                </div>
                <Badge variant="outline">In-Person</Badge>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Lab Work</p>
                  <p className="text-sm text-gray-500">Blood Panel & A1C</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Next Week</span>
                  </div>
                </div>
                <Badge variant="destructive">Overdue</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Health Records */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Health Records</CardTitle>
            <CardDescription>Latest entries and measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Blood Pressure Reading</p>
                    <p className="text-sm text-gray-500">120/80 mmHg</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Today, 8:30 AM</p>
                  <Badge variant="secondary" className="mt-1">Normal</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Blood Glucose</p>
                    <p className="text-sm text-gray-500">95 mg/dL</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Today, 7:00 AM</p>
                  <Badge variant="secondary" className="mt-1">Good</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Exercise Session</p>
                    <p className="text-sm text-gray-500">30 min walk</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Yesterday, 6:00 PM</p>
                  <Badge variant="secondary" className="mt-1">Completed</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;