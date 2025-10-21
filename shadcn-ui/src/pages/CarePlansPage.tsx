import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Target, 
  Heart, 
  Activity, 
  Pill, 
  Edit, 
  Trash2,
  Star,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

interface CarePlan {
  id: string;
  title: string;
  description: string;
  category: 'medication' | 'exercise' | 'diet' | 'monitoring' | 'lifestyle';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused';
  progress: number;
  startDate: string;
  endDate?: string;
  goals: string[];
  tasks: {
    id: string;
    description: string;
    completed: boolean;
    dueDate: string;
  }[];
  createdBy: string;
}

export default function CarePlansPage() {
  const { user } = useAuth();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([
    {
      id: '1',
      title: 'Blood Pressure Management',
      description: 'Comprehensive plan to manage and monitor blood pressure levels',
      category: 'monitoring',
      priority: 'high',
      status: 'active',
      progress: 75,
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      goals: [
        'Maintain BP below 140/90 mmHg',
        'Take medication as prescribed',
        'Monitor daily readings'
      ],
      tasks: [
        { id: '1', description: 'Take morning medication', completed: true, dueDate: '2024-01-20' },
        { id: '2', description: 'Record BP reading', completed: true, dueDate: '2024-01-20' },
        { id: '3', description: 'Exercise for 30 minutes', completed: false, dueDate: '2024-01-21' },
        { id: '4', description: 'Follow low-sodium diet', completed: true, dueDate: '2024-01-21' }
      ],
      createdBy: 'Dr. Michael Chen'
    },
    {
      id: '2',
      title: 'Diabetes Management',
      description: 'Daily care plan for managing diabetes and blood sugar levels',
      category: 'medication',
      priority: 'high',
      status: 'active',
      progress: 60,
      startDate: '2024-01-10',
      goals: [
        'Maintain HbA1c below 7%',
        'Check blood sugar 4 times daily',
        'Follow diabetic diet'
      ],
      tasks: [
        { id: '1', description: 'Check blood sugar before breakfast', completed: true, dueDate: '2024-01-21' },
        { id: '2', description: 'Take insulin as prescribed', completed: true, dueDate: '2024-01-21' },
        { id: '3', description: 'Check blood sugar before dinner', completed: false, dueDate: '2024-01-21' },
        { id: '4', description: 'Record all readings in app', completed: true, dueDate: '2024-01-21' }
      ],
      createdBy: 'Dr. Sarah Johnson'
    },
    {
      id: '3',
      title: 'Cardiac Rehabilitation',
      description: 'Exercise and lifestyle program for heart health recovery',
      category: 'exercise',
      priority: 'medium',
      status: 'active',
      progress: 40,
      startDate: '2024-01-05',
      endDate: '2024-03-05',
      goals: [
        'Improve cardiovascular fitness',
        'Reduce risk of future cardiac events',
        'Maintain healthy weight'
      ],
      tasks: [
        { id: '1', description: 'Walk 30 minutes daily', completed: true, dueDate: '2024-01-21' },
        { id: '2', description: 'Attend cardiac rehab session', completed: false, dueDate: '2024-01-22' },
        { id: '3', description: 'Practice stress management', completed: false, dueDate: '2024-01-21' },
        { id: '4', description: 'Follow heart-healthy diet', completed: true, dueDate: '2024-01-21' }
      ],
      createdBy: 'Dr. Emily Rodriguez'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    category: 'monitoring' as CarePlan['category'],
    priority: 'medium' as CarePlan['priority'],
    goals: [] as string[]
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return <Pill className="w-4 h-4" />;
      case 'exercise': return <Activity className="w-4 h-4" />;
      case 'diet': return <Heart className="w-4 h-4" />;
      case 'monitoring': return <Target className="w-4 h-4" />;
      case 'lifestyle': return <Star className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medication': return 'bg-blue-100 text-blue-800';
      case 'exercise': return 'bg-green-100 text-green-800';
      case 'diet': return 'bg-orange-100 text-orange-800';
      case 'monitoring': return 'bg-purple-100 text-purple-800';
      case 'lifestyle': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddPlan = () => {
    if (!newPlan.title || !newPlan.description) return;
    
    const plan: CarePlan = {
      id: Date.now().toString(),
      ...newPlan,
      status: 'active',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      tasks: [],
      createdBy: user?.name || 'You'
    };
    
    setCarePlans(prev => [...prev, plan]);
    setNewPlan({
      title: '',
      description: '',
      category: 'monitoring',
      priority: 'medium',
      goals: []
    });
    setShowAddForm(false);
  };

  const toggleTask = (planId: string, taskId: string) => {
    setCarePlans(prev => prev.map(plan => {
      if (plan.id === planId) {
        const updatedTasks = plan.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const completedTasks = updatedTasks.filter(task => task.completed).length;
        const progress = Math.round((completedTasks / updatedTasks.length) * 100);
        
        return {
          ...plan,
          tasks: updatedTasks,
          progress: progress
        };
      }
      return plan;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Care Plans
          </h1>
          <p className="text-gray-600 mt-1">Manage your personalized care plans and health goals</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Care Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Care Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Plan Title</Label>
                <Input
                  id="title"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter plan title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the care plan"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddPlan} className="flex-1">
                  Create Plan
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Care Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {carePlans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(plan.category)}`}>
                    {getCategoryIcon(plan.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getPriorityColor(plan.priority)}>
                    {plan.priority}
                  </Badge>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{plan.progress}%</span>
                </div>
                <Progress value={plan.progress} className="h-2" />
              </div>

              {/* Goals */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Goals</h4>
                <ul className="space-y-1">
                  {plan.goals.map((goal, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Target className="w-3 h-3 mr-2 text-blue-500" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tasks */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tasks</h4>
                <div className="space-y-2">
                  {plan.tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleTask(plan.id, task.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          task.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {task.completed && <CheckCircle className="w-3 h-3" />}
                      </button>
                      <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {task.description}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  View Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Plans</p>
                <p className="text-lg font-semibold">{carePlans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Plans</p>
                <p className="text-lg font-semibold">
                  {carePlans.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Tasks</p>
                <p className="text-lg font-semibold">
                  {carePlans.reduce((acc, plan) => 
                    acc + plan.tasks.filter(task => task.completed).length, 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Progress</p>
                <p className="text-lg font-semibold">
                  {Math.round(carePlans.reduce((acc, plan) => acc + plan.progress, 0) / carePlans.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
