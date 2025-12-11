import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar,
  Target,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { useCarePlans } from '@/hooks/useCarePlans';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/hooks/use-toast';

interface CarePlanFormData {
  title: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const CATEGORY_OPTIONS = [
  { value: 'medication', label: 'Medication' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'diet', label: 'Diet' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'other', label: 'Other' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function CarePlans() {
  const { toast } = useToast();
  const { carePlans, isLoading, createCarePlan, updateCarePlan, deleteCarePlan, isCreating, isUpdating, isDeleting } = useCarePlans();
  const { awardPoints } = useGamification();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState<CarePlanFormData>({
    title: '',
    category: 'lifestyle',
    description: '',
    status: 'active',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCarePlan(formData);
      
      // Award points for creating care plan
      await awardPoints('care_task', 15, 'care_plan_created');
      
      toast({
        title: 'Success!',
        description: 'Care plan created successfully',
      });
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create care plan',
        variant: 'destructive',
      });
    }
  };

  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPlan) return;

    try {
      await updateCarePlan({ id: editingPlan._id, data: formData });
      toast({
        title: 'Success!',
        description: 'Care plan updated successfully',
      });
      setEditingPlan(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update care plan',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this care plan?')) return;

    try {
      await deleteCarePlan(id);
      toast({
        title: 'Success!',
        description: 'Care plan deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete care plan',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      category: plan.category,
      description: plan.description || '',
      status: plan.status,
      priority: plan.priority,
      startDate: new Date(plan.startDate).toISOString().split('T')[0],
      endDate: plan.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : '',
      notes: plan.notes || ''
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'lifestyle',
      description: '',
      status: 'active',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: ''
    });
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setShowAddForm(false);
    resetForm();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'paused': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Care Plans</h2>
          <p className="text-gray-600 mt-1">Manage your health management plans</p>
        </div>
        {!showAddForm && !editingPlan && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-teal-600 hover:bg-teal-700"
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Care Plan
          </Button>
        )}
        </div>
        
      {/* Add/Edit Form */}
      {(showAddForm || editingPlan) && (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingPlan ? 'Edit Care Plan' : 'Create New Care Plan'}</span>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
            </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingPlan ? handleEditPlan : handleAddPlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Plan Title *</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Blood Pressure Management"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your care plan..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
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
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              
                          <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
                      </div>
                      
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                                  </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Care Plans List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2 text-gray-500">Loading care plans...</span>
                        </div>
        ) : carePlans.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No care plans created yet.</p>
              <p className="text-sm">Click "New Care Plan" to create your first plan.</p>
            </CardContent>
          </Card>
        ) : (
          carePlans.map(plan => (
            <Card key={plan._id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold text-xl">{plan.title}</h3>
                      <Badge className={`${getPriorityColor(plan.priority)} text-white capitalize`}>
                        {plan.priority}
                          </Badge>
                      <Badge className={`${getStatusColor(plan.status)} text-white capitalize`}>
                        {plan.status}
                          </Badge>
                        </div>
                    <p className="text-sm text-gray-600 capitalize mb-2">
                      Category: {plan.category}
                    </p>
                    {plan.description && (
                      <p className="text-sm text-gray-700 mb-3">{plan.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                      </div>
                      {plan.endDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>End: {new Date(plan.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {plan.notes && (
                      <p className="text-sm text-gray-500 italic mt-2">
                        Notes: {plan.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEdit(plan)}
                      disabled={isUpdating}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeletePlan(plan._id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
            </div>
            </div>
        </CardContent>
      </Card>
          ))
        )}
      </div>
    </div>
  );
}
