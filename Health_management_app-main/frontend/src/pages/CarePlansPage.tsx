import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useCarePlans } from '@/hooks/useCarePlans';
import { toast } from 'sonner';

interface Task {
  id: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

interface CarePlan {
  _id?: string;
  id?: string;
  userId?: string;
  title: string;
  description: string;
  category: 'medication' | 'exercise' | 'diet' | 'monitoring' | 'lifestyle';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused';
  progress: number;
  startDate: string;
  endDate?: string;
  goals: string[];
  tasks: Task[];
  createdBy: string;
}

export default function CarePlansPage() {
  const { user } = useAuth();
  const { carePlans: apiCarePlans, createCarePlan, updateCarePlan, deleteCarePlan, isLoading } = useCarePlans();
  
  // Convert API data to local format
  const carePlans: CarePlan[] = apiCarePlans?.map((plan: any) => ({
    ...plan,
    id: plan._id || plan.id
  })) || [];
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CarePlan | null>(null);
  
  const [newPlan, setNewPlan] = useState<CarePlan>({
    title: '',
    description: '',
    category: 'monitoring',
    priority: 'medium',
    status: 'active',
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    goals: [],
    tasks: [],
    createdBy: user?.name || 'Self'
  });

  const [editPlan, setEditPlan] = useState<CarePlan>({
    title: '',
    description: '',
    category: 'monitoring',
    priority: 'medium',
    status: 'active',
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    goals: [],
    tasks: [],
    createdBy: ''
  });

  const [newGoal, setNewGoal] = useState('');
  const [newTask, setNewTask] = useState({ description: '', dueDate: '' });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return <Pill className="w-4 h-4" />;
      case 'exercise': return <Activity className="w-4 h-4" />;
      case 'diet': return <Heart className="w-4 h-4" />;
      case 'monitoring': return <FileText className="w-4 h-4" />;
      case 'lifestyle': return <Star className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medication': return 'bg-purple-100 text-purple-600';
      case 'exercise': return 'bg-green-100 text-green-600';
      case 'diet': return 'bg-orange-100 text-orange-600';
      case 'monitoring': return 'bg-blue-100 text-blue-600';
      case 'lifestyle': return 'bg-pink-100 text-pink-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'paused': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddPlan = async () => {
    if (!newPlan.title.trim()) {
      toast.error('Please enter a plan title');
      return;
    }

    try {
      await createCarePlan.mutateAsync({
        ...newPlan,
        userId: user?.userId
      });
      toast.success('Care plan created successfully!');
      setNewPlan({
        title: '',
        description: '',
        category: 'monitoring',
        priority: 'medium',
        status: 'active',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        goals: [],
        tasks: [],
        createdBy: user?.name || 'Self'
      });
      setShowAddForm(false);
    } catch (error) {
      toast.error('Failed to create care plan');
    }
  };

  const handleEditClick = (plan: CarePlan) => {
    setEditPlan(plan);
    setSelectedPlan(plan);
    setShowEditForm(true);
  };

  const handleUpdatePlan = async () => {
    if (!editPlan.title.trim()) {
      toast.error('Please enter a plan title');
      return;
    }

    try {
      const planId = editPlan._id || editPlan.id;
      if (!planId) {
        toast.error('Invalid plan ID');
        return;
      }

      await updateCarePlan.mutateAsync({
        id: planId,
        data: editPlan
      });
      toast.success('Care plan updated successfully!');
      setShowEditForm(false);
      setSelectedPlan(null);
    } catch (error) {
      toast.error('Failed to update care plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this care plan?')) {
      return;
    }

    try {
      await deleteCarePlan.mutateAsync(planId);
      toast.success('Care plan deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete care plan');
    }
  };

  const handleViewProgress = (plan: CarePlan) => {
    setSelectedPlan(plan);
    setShowProgressModal(true);
  };

  const toggleTask = async (plan: CarePlan, taskId: string) => {
    const updatedTasks = plan.tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const completedTasks = updatedTasks.filter(task => task.completed).length;
    const progress = Math.round((completedTasks / updatedTasks.length) * 100);
    
    const updatedPlan = {
      ...plan,
      tasks: updatedTasks,
      progress: progress
    };

    try {
      const planId = plan._id || plan.id;
      if (!planId) return;

      await updateCarePlan.mutateAsync({
        id: planId,
        data: updatedPlan
      });
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const addGoalToNewPlan = () => {
    if (newGoal.trim()) {
      setNewPlan(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const addTaskToNewPlan = () => {
    if (newTask.description.trim() && newTask.dueDate) {
      setNewPlan(prev => ({
        ...prev,
        tasks: [
          ...prev.tasks,
          {
            id: Date.now().toString(),
            description: newTask.description.trim(),
            completed: false,
            dueDate: newTask.dueDate
          }
        ]
      }));
      setNewTask({ description: '', dueDate: '' });
    }
  };

  const addGoalToEditPlan = () => {
    if (newGoal.trim()) {
      setEditPlan(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const addTaskToEditPlan = () => {
    if (newTask.description.trim() && newTask.dueDate) {
      setEditPlan(prev => ({
        ...prev,
        tasks: [
          ...prev.tasks,
          {
            id: Date.now().toString(),
            description: newTask.description.trim(),
            completed: false,
            dueDate: newTask.dueDate
          }
        ]
      }));
      setNewTask({ description: '', dueDate: '' });
    }
  };

  const removeGoalFromEdit = (index: number) => {
    setEditPlan(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const removeTaskFromEdit = (taskId: string) => {
    setEditPlan(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Care Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your personalized care plans and health goals</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Care Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Care Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Plan Title *</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPlan.category}
                    onValueChange={(value: any) => setNewPlan(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="diet">Diet</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newPlan.priority}
                    onValueChange={(value: any) => setNewPlan(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newPlan.startDate}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newPlan.endDate || ''}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Goals</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add a goal"
                    onKeyPress={(e) => e.key === 'Enter' && addGoalToNewPlan()}
                  />
                  <Button type="button" onClick={addGoalToNewPlan} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <ul className="space-y-1">
                  {newPlan.goals.map((goal, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Target className="w-3 h-3 mr-2 text-blue-500" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Label>Tasks</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description"
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-40"
                  />
                  <Button type="button" onClick={addTaskToNewPlan} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {newPlan.tasks.map((task) => (
                    <div key={task.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
                      <span>{task.description}</span>
                      <span className="text-xs">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddPlan} className="flex-1" disabled={createCarePlan.isPending}>
                  {createCarePlan.isPending ? 'Creating...' : 'Create Plan'}
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
      {carePlans.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Care Plans Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first care plan to start tracking your health goals</p>
          <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-500">
            <Plus className="w-4 h-4 mr-2" />
            Create Care Plan
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {carePlans.map((plan) => (
            <Card key={plan._id || plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(plan.category)}`}>
                      {getCategoryIcon(plan.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{plan.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>

                {/* Goals */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goals</h4>
                  <ul className="space-y-1">
                    {plan.goals.slice(0, 3).map((goal, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Target className="w-3 h-3 mr-2 text-blue-500" />
                        {goal}
                      </li>
                    ))}
                    {plan.goals.length > 3 && (
                      <li className="text-sm text-gray-500 dark:text-gray-400">
                        +{plan.goals.length - 3} more goals
                      </li>
                    )}
                  </ul>
                </div>

                {/* Tasks */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks</h4>
                  <div className="space-y-2">
                    {plan.tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleTask(plan, task.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            task.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <span className={`text-sm ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {task.description}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {plan.tasks.length > 3 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        +{plan.tasks.length - 3} more tasks
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(plan)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewProgress(plan)}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    View Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePlan(plan._id || plan.id || '')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Care Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Plan Title *</Label>
              <Input
                id="edit-title"
                value={editPlan.title}
                onChange={(e) => setEditPlan(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter plan title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editPlan.description}
                onChange={(e) => setEditPlan(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the care plan"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editPlan.category}
                  onValueChange={(value: any) => setEditPlan(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="diet">Diet</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={editPlan.priority}
                  onValueChange={(value: any) => setEditPlan(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editPlan.status}
                  onValueChange={(value: any) => setEditPlan(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-endDate">End Date (Optional)</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editPlan.endDate || ''}
                  onChange={(e) => setEditPlan(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Goals</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a goal"
                  onKeyPress={(e) => e.key === 'Enter' && addGoalToEditPlan()}
                />
                <Button type="button" onClick={addGoalToEditPlan} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <ul className="space-y-1">
                {editPlan.goals.map((goal, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="w-3 h-3 mr-2 text-blue-500" />
                      {goal}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoalFromEdit(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Label>Tasks</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description"
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-40"
                />
                <Button type="button" onClick={addTaskToEditPlan} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {editPlan.tasks.map((task) => (
                  <div key={task.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-3 h-3 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} />
                      <span>{task.description}</span>
                      <span className="text-xs">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTaskFromEdit(task.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleUpdatePlan} className="flex-1" disabled={updateCarePlan.isPending}>
                {updateCarePlan.isPending ? 'Updating...' : 'Update Plan'}
              </Button>
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Modal */}
      <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Progress Details</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedPlan.title}</h3>
                <div className="inline-flex items-center gap-2 mb-4">
                  <Badge className={getCategoryColor(selectedPlan.category)}>
                    {selectedPlan.category}
                  </Badge>
                  <Badge className={getPriorityColor(selectedPlan.priority)}>
                    {selectedPlan.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedPlan.status)}>
                    {selectedPlan.status}
                  </Badge>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {selectedPlan.progress}%
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Overall Progress</p>
                </div>
                <Progress value={selectedPlan.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Goals</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan.goals.length}</p>
                      </div>
                      <Target className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan.tasks.length}</p>
                      </div>
                      <FileText className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedPlan.tasks.filter(t => t.completed).length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {selectedPlan.tasks.filter(t => !t.completed).length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Goals</h4>
                <ul className="space-y-2">
                  {selectedPlan.goals.map((goal, index) => (
                    <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                      <Target className="w-4 h-4 mr-2 text-blue-500 mt-0.5" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Task Breakdown</h4>
                <div className="space-y-2">
                  {selectedPlan.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} />
                        <div>
                          <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {task.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {task.completed && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Complete
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedPlan.startDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedPlan.endDate && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedPlan.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedPlan.createdBy}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      {carePlans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{carePlans.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Plans</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {carePlans.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed Tasks</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Progress</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {carePlans.length > 0
                      ? Math.round(carePlans.reduce((acc, plan) => acc + plan.progress, 0) / carePlans.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
