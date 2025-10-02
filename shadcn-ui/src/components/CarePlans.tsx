import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  Target,
  Activity,
  Heart,
  Pill,
  Utensils,
  Dumbbell,
  Brain,
  Eye,
  X,
  Edit,
  Save
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (replace with your actual credentials)
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

interface CarePlan {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  tasks: Task[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function CarePlans() {
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showFullPlanModal, setShowFullPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CarePlan | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    assigned_by: 'Dr. Sarah Johnson'
  });

  const taskCategories = [
    { value: 'medication', label: 'Medication', icon: Pill },
    { value: 'exercise', label: 'Exercise', icon: Dumbbell },
    { value: 'diet', label: 'Diet & Nutrition', icon: Utensils },
    { value: 'monitoring', label: 'Health Monitoring', icon: Activity },
    { value: 'appointment', label: 'Medical Appointment', icon: Calendar },
    { value: 'therapy', label: 'Therapy', icon: Brain },
    { value: 'lifestyle', label: 'Lifestyle', icon: Heart }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // In production, these would be actual Supabase queries
      // For now, using sample data
      const sampleCarePlans: CarePlan[] = [
        {
          id: '1',
          title: 'Diabetes Management Plan',
          description: 'Comprehensive diabetes care plan focusing on blood sugar control, medication adherence, and lifestyle modifications.',
          start_date: '2024-01-01',
          end_date: '2024-06-30',
          status: 'active',
          progress: 75,
          tasks: [],
          created_by: 'Dr. Sarah Johnson',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          title: 'Hypertension Control Plan',
          description: 'Blood pressure management through medication, diet, and regular monitoring.',
          start_date: '2024-01-15',
          end_date: '2024-07-15',
          status: 'active',
          progress: 60,
          tasks: [],
          created_by: 'Dr. Michael Chen',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z'
        }
      ];

      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Take Morning Medication',
          description: 'Take Metformin 500mg with breakfast',
          category: 'medication',
          priority: 'high',
          status: 'completed',
          due_date: '2024-01-20',
          assigned_by: 'Dr. Sarah Johnson',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-20T08:00:00Z'
        },
        {
          id: '2',
          title: 'Blood Sugar Check',
          description: 'Check blood glucose levels before lunch',
          category: 'monitoring',
          priority: 'high',
          status: 'pending',
          due_date: '2024-01-20',
          assigned_by: 'Dr. Sarah Johnson',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z'
        },
        {
          id: '3',
          title: '30-minute Walk',
          description: 'Take a brisk 30-minute walk in the neighborhood',
          category: 'exercise',
          priority: 'medium',
          status: 'in-progress',
          due_date: '2024-01-20',
          assigned_by: 'Dr. Sarah Johnson',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z'
        }
      ];

      setCarePlans(sampleCarePlans);
      setTasks(sampleTasks);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      const taskData: Task = {
        id: Date.now().toString(),
        ...newTask,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // In production, this would be a Supabase insert
      setTasks(prev => [taskData, ...prev]);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        due_date: '',
        assigned_by: 'Dr. Sarah Johnson'
      });
      
      setShowAddTaskModal(false);
      alert('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding task. Please try again.');
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      // In production, this would be a Supabase update
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = taskCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : FileText;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading care plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Care Plans</h2>
          <p className="text-gray-600 mt-1">Manage your personalized healthcare plans and tasks</p>
        </div>
        
        {/* Add New Task Button */}
        <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  placeholder="Enter task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newTask.category} onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddTaskModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask} disabled={!newTask.title || !newTask.category}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Care Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {carePlans.map((plan) => (
          <Card key={plan.id} className="shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span>{plan.title}</span>
                <Badge className={getStatusColor(plan.status)}>
                  {plan.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <p className="font-medium">{new Date(plan.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">End Date:</span>
                  <p className="font-medium">{new Date(plan.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Created by:</span>
                  <p className="font-medium">{plan.created_by}</p>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <p className="font-medium">{new Date(plan.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* View Full Care Plan Button */}
              <Dialog open={showFullPlanModal && selectedPlan?.id === plan.id} onOpenChange={(open) => {
                setShowFullPlanModal(open);
                if (!open) setSelectedPlan(null);
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Care Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>{selectedPlan?.title}</span>
                    </DialogTitle>
                  </DialogHeader>
                  
                  {selectedPlan && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Plan Overview</h3>
                        <p className="text-blue-700">{selectedPlan.description}</p>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-blue-600">Duration:</span>
                            <p className="font-medium">{new Date(selectedPlan.start_date).toLocaleDateString()} - {new Date(selectedPlan.end_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-blue-600">Progress:</span>
                            <p className="font-medium">{selectedPlan.progress}% Complete</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-4">Associated Tasks</h3>
                        <div className="space-y-3">
                          {tasks.length > 0 ? tasks.map((task) => {
                            const IconComponent = getCategoryIcon(task.category);
                            return (
                              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <IconComponent className="w-4 h-4 text-blue-600" />
                                    <h4 className="font-medium">{task.title}</h4>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getPriorityColor(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                    <Badge className={getStatusColor(task.status)}>
                                      {task.status}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                  <span>Assigned by: {task.assigned_by}</span>
                                </div>
                              </div>
                            );
                          }) : (
                            <p className="text-gray-500 text-center py-4">No tasks associated with this care plan yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Tasks */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Today's Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => {
                const IconComponent = getCategoryIcon(task.category);
                return (
                  <div key={task.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className={`p-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-100' :
                      task.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        task.status === 'completed' ? 'text-green-600' :
                        task.status === 'in-progress' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        <span>Assigned by: {task.assigned_by}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {task.status !== 'completed' && (
                        <>
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTaskStatusUpdate(task.id, 'in-progress')}
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              Start
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        </>
                      )}
                      {task.status === 'completed' && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="w-5 h-5 mr-1" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks for today. Great job staying on top of your care plan!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-blue-800">{carePlans.length}</h3>
          <p className="text-blue-600 text-sm">Active Plans</p>
        </Card>

        <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-800">{tasks.filter(t => t.status === 'completed').length}</h3>
          <p className="text-green-600 text-sm">Completed Tasks</p>
        </Card>

        <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-orange-800">{tasks.filter(t => t.status === 'pending').length}</h3>
          <p className="text-orange-600 text-sm">Pending Tasks</p>
        </Card>

        <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-purple-800">{tasks.filter(t => t.status === 'in-progress').length}</h3>
          <p className="text-purple-600 text-sm">In Progress</p>
        </Card>
      </div>
    </div>
  );
}