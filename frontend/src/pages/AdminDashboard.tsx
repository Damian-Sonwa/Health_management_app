import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Shield, 
  Users, 
  Calendar, 
  Pill, 
  Home,
  Bell, 
  Menu, 
  X,
  Search, 
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Activity,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Save,
  BarChart3,
  UserCheck,
  Building2,
  Stethoscope,
  Phone,
  MapPin,
  Mail
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';
import Dashboard from './Dashboard';
import DoctorDashboard from './DoctorDashboard';
import PharmacyDashboard from './PharmacyDashboard';
import ErrorBoundary from '@/components/ErrorBoundary';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'patient' | 'pharmacy' | 'doctor' | 'admin';
  specialty?: string;
  experience?: number;
  licenseId?: string;
  pharmacyName?: string;
  createdAt: string;
  isActive?: boolean;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalPharmacies: number;
  totalAppointments: number;
  totalMedicationRequests: number;
  pendingAppointments: number;
  pendingRequests: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'pharmacy-approval' | 'doctor-approval' | 'medication-requests' | 'patient' | 'doctor' | 'pharmacy'>('overview');
  const [pendingPharmacies, setPendingPharmacies] = useState<any[]>([]);
  const [allPharmacies, setAllPharmacies] = useState<any[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [isCreatePharmacyOpen, setIsCreatePharmacyOpen] = useState(false);
  const [isEditPharmacyOpen, setIsEditPharmacyOpen] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState<any | null>(null);
  const [newPharmacy, setNewPharmacy] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    pharmacyName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    licenseId: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [medicationRequests, setMedicationRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalPharmacies: 0,
    totalAppointments: 0,
    totalMedicationRequests: 0,
    pendingAppointments: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient' as 'patient' | 'pharmacy' | 'doctor' | 'admin',
    specialty: '',
    experience: '',
    licenseId: '',
    pharmacyName: ''
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [isAdmin, navigate]);

  const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 2): Promise<Response> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error('Request timeout - please check your connection');
          }
          throw fetchError;
        }
      } catch (error: any) {
        if (attempt < retries && (
          error.name === 'TypeError' || 
          error.message.includes('fetch') || 
          error.name === 'AbortError' ||
          error.message.includes('CORS') ||
          error.message.includes('NetworkError')
        )) {
          console.log(`⏳ Retrying ${url} (attempt ${attempt + 1}/${retries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Helper to safely fetch with fallback
      const safeFetch = async (url: string, options: RequestInit) => {
        try {
          return await fetchWithRetry(url, options);
        } catch (error) {
          // Return a mock response that can be parsed
          return {
            json: async () => ({ success: false, users: [], data: [], appointments: [], requests: [] }),
            ok: false,
            status: 0
          } as Response;
        }
      };
      
      const [usersRes, appointmentsRes, requestsRes, notificationsRes] = await Promise.all([
        safeFetch(`${API_BASE_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        safeFetch(`${API_BASE_URL}/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        safeFetch(`${API_BASE_URL}/medication-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        safeFetch(`${API_BASE_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const usersData = await usersRes.json();
      const appointmentsData = await appointmentsRes.json();
      const requestsData = await requestsRes.json();
      const notificationsData = await notificationsRes.json();

      if (usersData.success) {
        setUsers(usersData.users || []);
        const userList = usersData.users || [];
        setStats(prev => ({
          ...prev,
          totalUsers: userList.length,
          totalPatients: userList.filter((u: User) => u.role === 'patient').length,
          totalDoctors: userList.filter((u: User) => u.role === 'doctor').length,
          totalPharmacies: userList.filter((u: User) => u.role === 'pharmacy').length
        }));
      }

      const appointments = appointmentsData.data || appointmentsData.appointments || [];
      const requests = requestsData.requests || [];
      
      setMedicationRequests(requests);
      
      setStats(prev => ({
        ...prev,
        totalAppointments: appointments.length,
        totalMedicationRequests: requests.length,
        pendingAppointments: appointments.filter((a: any) => 
          ['scheduled', 'confirmed'].includes(a.status)
        ).length,
        pendingRequests: requests.filter((r: any) => 
          ['pending', 'processing'].includes(r.status)
        ).length
      }));

      if (notificationsData.success) {
        setNotifications(notificationsData.data || []);
        setUnreadCount((notificationsData.data || []).filter((n: Notification) => !n.isRead).length);
      } else {
        // If notifications fail, set empty array instead of showing error
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // Don't show error toast for network issues - just log and continue with cached/empty data
      if (!error.message?.includes('timeout') && !error.message?.includes('CORS') && !error.message?.includes('NetworkError')) {
        toast.error('Failed to load dashboard data');
      }
      // Set empty arrays to prevent UI errors
      setUsers([]);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (!error.message?.includes('timeout') && !error.message?.includes('CORS') && !error.message?.includes('NetworkError')) {
        toast.error('Failed to load users');
      }
      setUsers([]);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          phone: newUser.phone || undefined,
          role: newUser.role,
          specialty: newUser.role === 'doctor' ? newUser.specialty : undefined,
          experience: newUser.role === 'doctor' && newUser.experience ? parseInt(newUser.experience) : undefined,
          licenseId: newUser.role === 'doctor' ? newUser.licenseId : undefined,
          pharmacyName: newUser.role === 'pharmacy' ? newUser.pharmacyName : undefined
        })
      });
      
      const data = await response.json();
      if (data.success || response.ok) {
        toast.success('User created successfully');
        setIsAddUserOpen(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: 'patient',
          specialty: '',
          experience: '',
          licenseId: '',
          pharmacyName: ''
        });
        await fetchUsers();
        await fetchAllData();
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error: any) {
      toast.error('Failed to create user: ' + error.message);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/users/${selectedUser._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newUser.role })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('User updated successfully');
        setIsEditUserOpen(false);
        setSelectedUser(null);
        await fetchUsers();
        await fetchAllData();
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (error: any) {
      toast.error('Failed to update user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(userId);
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success || response.ok) {
        toast.success('User deleted successfully');
        await fetchUsers();
        await fetchAllData();
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error: any) {
      toast.error('Failed to delete user: ' + error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('User role updated successfully');
        await fetchUsers();
        await fetchAllData();
      } else {
        throw new Error(data.message || 'Failed to update role');
      }
    } catch (error: any) {
      toast.error('Failed to update role: ' + error.message);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetchWithRetry(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchAllData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Fetch pending pharmacies
  const fetchPendingPharmacies = async () => {
    try {
      setLoadingPharmacies(true);
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/pharmacies/admin/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPendingPharmacies(data.data || []);
      } else {
        setPendingPharmacies([]);
      }
    } catch (error: any) {
      console.error('Error fetching pending pharmacies:', error);
      setPendingPharmacies([]);
    } finally {
      setLoadingPharmacies(false);
    }
  };

  // Approve pharmacy
  const handleApprovePharmacy = async (pharmacyId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/pharmacies/admin/${pharmacyId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Pharmacy approved successfully');
        await fetchPendingPharmacies();
        await fetchAllData();
      } else {
        throw new Error(data.message || 'Failed to approve pharmacy');
      }
    } catch (error: any) {
      toast.error('Failed to approve pharmacy: ' + error.message);
    }
  };

  // Reject pharmacy
  const handleRejectPharmacy = async (pharmacyId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/pharmacies/admin/${pharmacyId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Rejected by admin' })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Pharmacy rejected');
        await fetchPendingPharmacies();
        await fetchAllData();
      } else {
        throw new Error(data.message || 'Failed to reject pharmacy');
      }
    } catch (error: any) {
      toast.error('Failed to reject pharmacy: ' + error.message);
    }
  };

  // Delete pharmacy
  const handleDeletePharmacy = async (pharmacyId: string) => {
    if (!confirm('Are you sure you want to delete this pharmacy? This will also delete the user account and all associated medication requests.')) {
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/pharmacies/admin/${pharmacyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Pharmacy deleted successfully');
        await fetchPendingPharmacies();
        await fetchAllData();
      } else {
        throw new Error(data.message || 'Failed to delete pharmacy');
      }
    } catch (error: any) {
      toast.error('Failed to delete pharmacy: ' + error.message);
    }
  };

  // Create pharmacy
  const handleCreatePharmacy = async (pharmacyData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/pharmacies/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pharmacyData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Pharmacy created successfully');
        await fetchPendingPharmacies();
        await fetchAllData();
        return true;
      } else {
        throw new Error(data.message || 'Failed to create pharmacy');
      }
    } catch (error: any) {
      toast.error('Failed to create pharmacy: ' + error.message);
      return false;
    }
  };

  // Edit pharmacy
  const handleEditPharmacy = async (pharmacyId: string, pharmacyData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/pharmacies/admin/${pharmacyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pharmacyData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Pharmacy updated successfully');
        await fetchPendingPharmacies();
        await fetchAllPharmacies();
        setIsEditPharmacyOpen(false);
        setEditingPharmacy(null);
        return true;
      } else {
        throw new Error(data.message || 'Failed to update pharmacy');
      }
    } catch (error: any) {
      toast.error('Failed to update pharmacy: ' + error.message);
      return false;
    }
  };

  // Open edit dialog
  const openEditPharmacy = (pharmacy: any) => {
    setEditingPharmacy(pharmacy);
    setNewPharmacy({
      name: pharmacy.name || '',
      email: pharmacy.email || '',
      password: '', // Don't pre-fill password
      phone: pharmacy.phone || '',
      pharmacyName: pharmacy.pharmacyName || '',
      address: typeof pharmacy.address === 'object' ? pharmacy.address : {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      licenseId: pharmacy.licenseId || ''
    });
    setIsEditPharmacyOpen(true);
  };

  // Fetch all pharmacies (for admin view)
  const fetchAllPharmacies = async () => {
    try {
      setLoadingPharmacies(true);
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/pharmacies?all=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAllPharmacies(data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching all pharmacies:', error);
    } finally {
      setLoadingPharmacies(false);
    }
  };

  // Handle delete medication request
  const handleDeleteMedicationRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/medication-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Medication request deleted successfully');
        setMedicationRequests(prev => prev.filter(r => r._id !== requestId));
        fetchAllData(); // Refresh data
      } else {
        throw new Error(data.message || 'Failed to delete medication request');
      }
    } catch (error: any) {
      toast.error('Failed to delete medication request: ' + error.message);
    }
  };

  // Handle update medication request status
  const handleUpdateMedicationRequest = async (requestId: string, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/medication-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Medication request updated successfully');
        fetchAllData(); // Refresh data
      } else {
        throw new Error(data.message || 'Failed to update medication request');
      }
    } catch (error: any) {
      toast.error('Failed to update medication request: ' + error.message);
    }
  };

  // Fetch pending pharmacies when pharmacy-approval view is active
  useEffect(() => {
    if (activeView === 'pharmacy-approval') {
      fetchPendingPharmacies();
      fetchAllPharmacies();
    }
  }, [activeView]);

  // Fetch pending doctors
  const fetchPendingDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/doctors?status=pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Filter for doctors with completed onboarding
        const pending = (data.data || []).filter((d: any) => d.onboardingCompleted && d.status === 'pending');
        setPendingDoctors(pending);
      }
    } catch (error: any) {
      console.error('Error fetching pending doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Fetch all doctors
  const fetchAllDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/doctors?all=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAllDoctors(data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching all doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Handle approve doctor
  const handleApproveDoctor = async (doctorId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'approved',
          isActive: true,
          available: true,
          isAvailable: true,
          approvedBy: user?.id || user?._id,
          approvedAt: new Date()
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Doctor approved successfully');
        fetchPendingDoctors();
        fetchAllDoctors();
        fetchAllData();
      } else {
        throw new Error(data.message || 'Failed to approve doctor');
      }
    } catch (error: any) {
      toast.error('Failed to approve doctor: ' + error.message);
    }
  };

  // Handle reject doctor
  const handleRejectDoctor = async (doctorId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithRetry(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected',
          isActive: false,
          available: false,
          isAvailable: false,
          rejectionReason: reason || null
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Doctor rejected');
        fetchPendingDoctors();
        fetchAllDoctors();
        fetchAllData();
      } else {
        throw new Error(data.message || 'Failed to reject doctor');
      }
    } catch (error: any) {
      toast.error('Failed to reject doctor: ' + error.message);
    }
  };

  // Fetch pending doctors when doctor-approval view is active
  useEffect(() => {
    if (activeView === 'doctor-approval') {
      fetchPendingDoctors();
      fetchAllDoctors();
    }
  }, [activeView]);

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = searchQuery === '' || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
    return matchesRole && matchesSearch;
  });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, view: 'overview' as const },
    { id: 'users', label: 'User Management', icon: Users, view: 'users' as const },
    { id: 'pharmacy-approval', label: 'Pharmacy Approval', icon: Building2, view: 'pharmacy-approval' as const },
    { id: 'doctor-approval', label: 'Doctor Approval', icon: Stethoscope, view: 'doctor-approval' as const },
    { id: 'medication-requests', label: 'Medication Requests', icon: Pill, view: 'medication-requests' as const },
    { id: 'patient', label: 'Patient Dashboard', icon: Home, view: 'patient' as const },
    { id: 'doctor', label: 'Doctor Dashboard', icon: Stethoscope, view: 'doctor' as const },
    { id: 'pharmacy', label: 'Pharmacy Dashboard', icon: Pill, view: 'pharmacy' as const }
  ];

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full">
      <div className="flex h-screen overflow-hidden w-full">
        {/* Desktop Sidebar */}
        <aside className={`
          hidden lg:flex
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          bg-white border-r border-gray-200 
          transition-all duration-300 
          flex-col
          shadow-lg
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Admin</h2>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.view);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className={`
              flex items-center gap-3 p-3 rounded-lg
              ${sidebarOpen ? 'bg-gray-50' : 'justify-center'}
            `}>
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <div className="flex flex-col h-full">
                      {/* Mobile Sidebar Header */}
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="font-bold text-gray-900">Admin</h2>
                            <p className="text-xs text-gray-500">Dashboard</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Mobile Navigation */}
                      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeView === item.view;
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveView(item.view);
                                setMobileMenuOpen(false);
                              }}
                              className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                transition-all duration-200
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                                  : 'text-gray-700 hover:bg-gray-100'
                                }
                              `}
                            >
                              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                              <span className="font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                      </nav>

                      {/* Mobile User Profile */}
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-600 text-white">
                              {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {navItems.find(item => item.view === activeView)?.label || 'Admin Dashboard'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
                    Welcome back, {user?.name || 'Admin'}
                  </p>
                </div>
              </div>
              
              {/* Notification Bell */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            notifications.forEach(n => {
                              if (!n.isRead) markNotificationAsRead(n._id);
                            });
                          }}
                        >
                          Mark all read
                        </Button>
                      </div>
                      <div className="divide-y">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification._id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                if (!notification.isRead) {
                                  markNotificationAsRead(notification._id);
                                }
                                setShowNotifications(false);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  !notification.isRead ? 'bg-blue-600' : 'bg-transparent'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 min-h-0">
            {/* Overview */}
            {activeView === 'overview' && (
              <div className="space-y-4 sm:space-y-6 w-full">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Users</p>
                          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                        </div>
                        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Appointments</p>
                          <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.totalAppointments}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stats.pendingAppointments} pending
                          </p>
                        </div>
                        <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Medication Requests</p>
                          <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.totalMedicationRequests}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stats.pendingRequests} pending
                          </p>
                        </div>
                        <Pill className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Providers</p>
                          <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                            {stats.totalDoctors + stats.totalPharmacies}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stats.totalDoctors} doctors, {stats.totalPharmacies} pharmacies
                          </p>
                        </div>
                        <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Role Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        Patients
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-blue-600">{stats.totalPatients}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-green-600" />
                        Doctors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-600">{stats.totalDoctors}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        Pharmacies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-purple-600">{stats.totalPharmacies}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Pharmacy Approval */}
            {activeView === 'pharmacy-approval' && (
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pharmacy Management</h2>
                    <p className="text-gray-600 text-sm">Review, approve, and manage pharmacy registrations</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Dialog open={isCreatePharmacyOpen} onOpenChange={setIsCreatePharmacyOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <UserPlus className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Add Pharmacy</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Pharmacy</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const success = await handleCreatePharmacy(newPharmacy);
                          if (success) {
                            setIsCreatePharmacyOpen(false);
                            setNewPharmacy({
                              name: '',
                              email: '',
                              password: '',
                              phone: '',
                              pharmacyName: '',
                              address: {
                                street: '',
                                city: '',
                                state: '',
                                zipCode: '',
                                country: 'USA'
                              },
                              licenseId: ''
                            });
                          }
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="pharmacy-name">Pharmacy Name *</Label>
                            <Input
                              id="pharmacy-name"
                              value={newPharmacy.pharmacyName}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, pharmacyName: e.target.value })}
                              placeholder="ABC Pharmacy"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="pharmacy-owner-name">Owner Name *</Label>
                            <Input
                              id="pharmacy-owner-name"
                              value={newPharmacy.name}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, name: e.target.value })}
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="pharmacy-email">Email *</Label>
                            <Input
                              id="pharmacy-email"
                              type="email"
                              value={newPharmacy.email}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, email: e.target.value })}
                              placeholder="pharmacy@example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="pharmacy-password">Password *</Label>
                            <Input
                              id="pharmacy-password"
                              type="password"
                              value={newPharmacy.password}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, password: e.target.value })}
                              placeholder="Minimum 6 characters"
                              required
                              minLength={6}
                            />
                          </div>
                          <div>
                            <Label htmlFor="pharmacy-phone">Phone *</Label>
                            <Input
                              id="pharmacy-phone"
                              type="tel"
                              value={newPharmacy.phone}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, phone: e.target.value })}
                              placeholder="+1234567890"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="pharmacy-license">License ID</Label>
                            <Input
                              id="pharmacy-license"
                              value={newPharmacy.licenseId}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, licenseId: e.target.value })}
                              placeholder="PH-001"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                              placeholder="Street"
                              value={newPharmacy.address.street}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, address: { ...newPharmacy.address, street: e.target.value } })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="City"
                                value={newPharmacy.address.city}
                                onChange={(e) => setNewPharmacy({ ...newPharmacy, address: { ...newPharmacy.address, city: e.target.value } })}
                              />
                              <Input
                                placeholder="State"
                                value={newPharmacy.address.state}
                                onChange={(e) => setNewPharmacy({ ...newPharmacy, address: { ...newPharmacy.address, state: e.target.value } })}
                              />
                            </div>
                            <Input
                              placeholder="Zip Code"
                              value={newPharmacy.address.zipCode}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, address: { ...newPharmacy.address, zipCode: e.target.value } })}
                            />
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreatePharmacyOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                              Create Pharmacy
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isEditPharmacyOpen} onOpenChange={setIsEditPharmacyOpen}>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Pharmacy</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          if (!editingPharmacy) return;
                          const updateData = { ...newPharmacy };
                          // Don't send password if it's empty (not being changed)
                          if (!updateData.password || updateData.password.trim() === '') {
                            delete updateData.password;
                          }
                          const success = await handleEditPharmacy(editingPharmacy._id, updateData);
                          if (success) {
                            setIsEditPharmacyOpen(false);
                            setEditingPharmacy(null);
                            setNewPharmacy({
                              name: '',
                              email: '',
                              password: '',
                              phone: '',
                              pharmacyName: '',
                              address: {
                                street: '',
                                city: '',
                                state: '',
                                zipCode: '',
                                country: 'USA'
                              },
                              licenseId: ''
                            });
                          }
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="edit-pharmacy-name">Pharmacy Name *</Label>
                            <Input
                              id="edit-pharmacy-name"
                              value={newPharmacy.pharmacyName}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, pharmacyName: e.target.value })}
                              placeholder="ABC Pharmacy"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-pharmacy-owner-name">Owner Name *</Label>
                            <Input
                              id="edit-pharmacy-owner-name"
                              value={newPharmacy.name}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, name: e.target.value })}
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-pharmacy-email">Email *</Label>
                            <Input
                              id="edit-pharmacy-email"
                              type="email"
                              value={newPharmacy.email}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, email: e.target.value })}
                              placeholder="pharmacy@example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-pharmacy-password">Password (leave blank to keep current)</Label>
                            <Input
                              id="edit-pharmacy-password"
                              type="password"
                              value={newPharmacy.password}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, password: e.target.value })}
                              placeholder="Leave blank to keep current password"
                              minLength={6}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-pharmacy-phone">Phone *</Label>
                            <Input
                              id="edit-pharmacy-phone"
                              type="tel"
                              value={newPharmacy.phone}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, phone: e.target.value })}
                              placeholder="+1234567890"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-pharmacy-license">License ID</Label>
                            <Input
                              id="edit-pharmacy-license"
                              value={newPharmacy.licenseId}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, licenseId: e.target.value })}
                              placeholder="PH-001"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                              placeholder="Street"
                              value={newPharmacy.address.street}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, address: { ...newPharmacy.address, street: e.target.value } })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="City"
                                value={newPharmacy.address.city}
                                onChange={(e) => setNewPharmacy({ ...newPharmacy, address: { ...newPharmacy.address, city: e.target.value } })}
                              />
                              <Input
                                placeholder="State"
                                value={newPharmacy.address.state}
                                onChange={(e) => setNewPharmacy({ ...newPharmacy, address: { ...newPharmacy.address, state: e.target.value } })}
                              />
                            </div>
                            <Input
                              placeholder="Zip Code"
                              value={newPharmacy.address.zipCode}
                              onChange={(e) => setNewPharmacy({ ...newPharmacy, address: { ...newPharmacy.address, zipCode: e.target.value } })}
                            />
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                              setIsEditPharmacyOpen(false);
                              setEditingPharmacy(null);
                            }}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                              Update Pharmacy
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      onClick={() => {
                        fetchPendingPharmacies();
                        fetchAllPharmacies();
                      }}
                      disabled={loadingPharmacies}
                    >
                      <Loader2 className={`w-4 h-4 mr-2 ${loadingPharmacies ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                {loadingPharmacies ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading pending pharmacies...</p>
                    </CardContent>
                  </Card>
                ) : pendingPharmacies.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Pharmacies</h3>
                      <p className="text-gray-600">All pharmacy registrations have been reviewed</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Pending Pharmacies */}
                    {pendingPharmacies.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          {pendingPharmacies.map((pharmacy) => (
                            <Card key={pharmacy._id} className="border-l-4 border-l-yellow-500">
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg">{pharmacy.pharmacyName}</CardTitle>
                                    <CardDescription className="mt-1">
                                      {pharmacy.name} • {pharmacy.email}
                                    </CardDescription>
                                  </div>
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                  {pharmacy.phone && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Phone className="w-4 h-4" />
                                      <span>{pharmacy.phone}</span>
                                    </div>
                                  )}
                                  {pharmacy.address && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                      <MapPin className="w-4 h-4 mt-0.5" />
                                      <span>
                                        {typeof pharmacy.address === 'object'
                                          ? `${pharmacy.address.street || ''}, ${pharmacy.address.city || ''}, ${pharmacy.address.state || ''} ${pharmacy.address.zipCode || ''}`.trim()
                                          : pharmacy.address}
                                      </span>
                                    </div>
                                  )}
                                  {pharmacy.licenseId && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <FileText className="w-4 h-4" />
                                      <span>License: {pharmacy.licenseId}</span>
                                    </div>
                                  )}
                                  {pharmacy.createdAt && (
                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                                      <Clock className="w-3 h-3" />
                                      <span>Registered: {new Date(pharmacy.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 pt-4 border-t flex-wrap">
                                  <Button
                                    onClick={() => handleApprovePharmacy(pharmacy._id)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    size="sm"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const reason = prompt('Enter rejection reason (optional):');
                                      if (reason !== null) {
                                        handleRejectPharmacy(pharmacy._id, reason || undefined);
                                      }
                                    }}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      console.log('Edit button clicked for pharmacy:', pharmacy);
                                      openEditPharmacy(pharmacy);
                                    }}
                                    variant="outline"
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                    size="sm"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      console.log('Delete button clicked for pharmacy:', pharmacy);
                                      if (confirm(`Are you sure you want to delete ${pharmacy.pharmacyName}? This action cannot be undone.`)) {
                                        handleDeletePharmacy(pharmacy._id);
                                      }
                                    }}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Pharmacies */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">All Pharmacies</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {allPharmacies.map((pharmacy) => (
                          <Card key={pharmacy._id} className={`border-l-4 ${
                            pharmacy.status === 'approved' ? 'border-l-green-500' :
                            pharmacy.status === 'rejected' ? 'border-l-red-500' :
                            'border-l-yellow-500'
                          }`}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{pharmacy.pharmacyName}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {pharmacy.name} • {pharmacy.email}
                                  </CardDescription>
                                </div>
                                <Badge className={
                                  pharmacy.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' :
                                  pharmacy.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                  'bg-yellow-100 text-yellow-800 border-yellow-300'
                                }>
                                  {pharmacy.status === 'approved' ? (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  ) : pharmacy.status === 'rejected' ? (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Clock className="w-3 h-3 mr-1" />
                                  )}
                                  {pharmacy.status.charAt(0).toUpperCase() + pharmacy.status.slice(1)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2 text-sm">
                                {pharmacy.phone && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{pharmacy.phone}</span>
                                  </div>
                                )}
                                {pharmacy.address && (
                                  <div className="flex items-start gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 mt-0.5" />
                                    <span>
                                      {typeof pharmacy.address === 'object'
                                        ? `${pharmacy.address.street || ''}, ${pharmacy.address.city || ''}, ${pharmacy.address.state || ''} ${pharmacy.address.zipCode || ''}`.trim()
                                        : pharmacy.address}
                                    </span>
                                  </div>
                                )}
                                {pharmacy.licenseId && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <FileText className="w-4 h-4" />
                                    <span>License: {pharmacy.licenseId}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 pt-4 border-t flex-wrap">
                                {pharmacy.status === 'pending' && (
                                  <>
                                    <Button
                                      onClick={() => handleApprovePharmacy(pharmacy._id)}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      size="sm"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const reason = prompt('Enter rejection reason (optional):');
                                        if (reason !== null) {
                                          handleRejectPharmacy(pharmacy._id, reason || undefined);
                                        }
                                      }}
                                      variant="destructive"
                                      size="sm"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  onClick={() => {
                                    console.log('Edit button clicked for pharmacy:', pharmacy);
                                    openEditPharmacy(pharmacy);
                                  }}
                                  variant="outline"
                                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                  size="sm"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => {
                                    console.log('Delete button clicked for pharmacy:', pharmacy);
                                    if (confirm(`Are you sure you want to delete ${pharmacy.pharmacyName}? This action cannot be undone.`)) {
                                      handleDeletePharmacy(pharmacy._id);
                                    }
                                  }}
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Medication Requests Management */}
            {activeView === 'medication-requests' && (
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Medication Requests</h2>
                    <p className="text-gray-600 text-sm">Manage all medication requests from patients</p>
                  </div>
                </div>

                {loadingRequests ? (
                  <div className="flex items-center justify-center py-12 min-h-[400px]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading medication requests...</p>
                    </div>
                  </div>
                ) : medicationRequests.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-16">
                      <Pill className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Medication Requests</h3>
                      <p className="text-gray-600">No medication requests found in the system.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {medicationRequests.map((request) => (
                      <Card key={request._id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                Request #{request.requestId || request._id}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                Patient: {request.patientInfo?.name || request.patientName || 'Unknown'} • 
                                Pharmacy: {typeof request.pharmacy === 'object' ? request.pharmacy.name : request.pharmacy || 'Unknown'}
                              </CardDescription>
                            </div>
                            <Badge className={
                              request.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                              request.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300' :
                              request.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }>
                              {request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Pending'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2 text-sm">
                            {request.patientInfo?.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{request.patientInfo.phone}</span>
                              </div>
                            )}
                            {request.patientInfo?.email && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{request.patientInfo.email}</span>
                              </div>
                            )}
                            {request.deliveryAddress && (
                              <div className="flex items-start gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <span>
                                  {typeof request.deliveryAddress === 'object'
                                    ? `${request.deliveryAddress.street || ''}, ${request.deliveryAddress.city || ''}, ${request.deliveryAddress.state || ''} ${request.deliveryAddress.zipCode || ''}`.trim()
                                    : request.deliveryAddress}
                                </span>
                              </div>
                            )}
                            {request.createdAt && (
                              <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-4 border-t flex-wrap">
                            <Select
                              value={request.status || 'pending'}
                              onValueChange={(value) => handleUpdateMedicationRequest(request._id, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete this medication request? This action cannot be undone.`)) {
                                  handleDeleteMedicationRequest(request._id);
                                }
                              }}
                              variant="destructive"
                              size="sm"
                              className="min-w-[100px]"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Doctor Approval */}
            {activeView === 'doctor-approval' && (
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Doctor Management</h2>
                    <p className="text-gray-600 text-sm">Review, approve, and manage doctor registrations</p>
                  </div>
                </div>

                {loadingDoctors ? (
                  <div className="flex items-center justify-center py-12 min-h-[400px]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading doctors...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Pending Doctors */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Pending Doctors</h3>
                      {pendingDoctors.length === 0 ? (
                        <Card>
                          <CardContent className="text-center py-12">
                            <Stethoscope className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Doctors</h3>
                            <p className="text-gray-600">All doctor registrations have been reviewed</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          {pendingDoctors.map((doctor) => (
                            <Card key={doctor._id} className="border-l-4 border-l-yellow-500">
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg">{doctor.name || doctor.fullName}</CardTitle>
                                    <CardDescription className="mt-1">
                                      {doctor.email} • {doctor.specialty}
                                    </CardDescription>
                                  </div>
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                  {doctor.phoneNumber && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Phone className="w-4 h-4" />
                                      <span>{doctor.phoneNumber}</span>
                                    </div>
                                  )}
                                  {doctor.licenseId && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <FileText className="w-4 h-4" />
                                      <span>License: {doctor.licenseId}</span>
                                    </div>
                                  )}
                                  {doctor.experience && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Clock className="w-4 h-4" />
                                      <span>{doctor.experience} years of experience</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 pt-4 border-t flex-wrap">
                                  <Button
                                    onClick={() => handleApproveDoctor(doctor._id)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    size="sm"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const reason = prompt('Enter rejection reason (optional):');
                                      if (reason !== null) {
                                        handleRejectDoctor(doctor._id, reason || undefined);
                                      }
                                    }}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* All Doctors */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">All Doctors</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {allDoctors.map((doctor) => (
                          <Card key={doctor._id} className={`border-l-4 ${
                            doctor.status === 'approved' ? 'border-l-green-500' :
                            doctor.status === 'rejected' ? 'border-l-red-500' :
                            'border-l-yellow-500'
                          }`}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{doctor.name || doctor.fullName}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {doctor.email} • {doctor.specialty}
                                  </CardDescription>
                                </div>
                                <Badge className={
                                  doctor.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' :
                                  doctor.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                  'bg-yellow-100 text-yellow-800 border-yellow-300'
                                }>
                                  {doctor.status === 'approved' ? (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  ) : doctor.status === 'rejected' ? (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Clock className="w-3 h-3 mr-1" />
                                  )}
                                  {doctor.status?.charAt(0).toUpperCase() + doctor.status?.slice(1) || 'Pending'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2 text-sm">
                                {doctor.phoneNumber && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{doctor.phoneNumber}</span>
                                  </div>
                                )}
                                {doctor.licenseId && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <FileText className="w-4 h-4" />
                                    <span>License: {doctor.licenseId}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 pt-4 border-t flex-wrap">
                                {doctor.status === 'pending' && (
                                  <>
                                    <Button
                                      onClick={() => handleApproveDoctor(doctor._id)}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      size="sm"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const reason = prompt('Enter rejection reason (optional):');
                                        if (reason !== null) {
                                          handleRejectDoctor(doctor._id, reason || undefined);
                                        }
                                      }}
                                      variant="destructive"
                                      size="sm"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* User Management */}
            {activeView === 'users' && (
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">User Management</h2>
                    <p className="text-gray-600 text-sm">Manage all user accounts and roles</p>
                  </div>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <UserPlus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Add User</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="user@example.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            placeholder="+1234567890"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role *</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value: 'patient' | 'pharmacy' | 'doctor' | 'admin') => 
                              setNewUser({ ...newUser, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="patient">Patient</SelectItem>
                              <SelectItem value="pharmacy">Pharmacy</SelectItem>
                              <SelectItem value="doctor">Doctor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {newUser.role === 'doctor' && (
                          <>
                            <div>
                              <Label htmlFor="specialty">Specialty</Label>
                              <Input
                                id="specialty"
                                value={newUser.specialty}
                                onChange={(e) => setNewUser({ ...newUser, specialty: e.target.value })}
                                placeholder="Cardiology, Pediatrics, etc."
                              />
                            </div>
                            <div>
                              <Label htmlFor="experience">Experience (years)</Label>
                              <Input
                                id="experience"
                                type="number"
                                value={newUser.experience}
                                onChange={(e) => setNewUser({ ...newUser, experience: e.target.value })}
                                placeholder="5"
                              />
                            </div>
                            <div>
                              <Label htmlFor="licenseId">License ID</Label>
                              <Input
                                id="licenseId"
                                value={newUser.licenseId}
                                onChange={(e) => setNewUser({ ...newUser, licenseId: e.target.value })}
                                placeholder="MD12345"
                              />
                            </div>
                          </>
                        )}
                        {newUser.role === 'pharmacy' && (
                          <div>
                            <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                            <Input
                              id="pharmacyName"
                              value={newUser.pharmacyName}
                              onChange={(e) => setNewUser({ ...newUser, pharmacyName: e.target.value })}
                              placeholder="ABC Pharmacy"
                            />
                          </div>
                        )}
                        <DialogFooter>
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            <Save className="w-4 h-4 mr-2" />
                            Create User
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddUserOpen(false)}
                          >
                            Cancel
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Filters */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Roles</option>
                          <option value="patient">Patient</option>
                          <option value="pharmacy">Pharmacy</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Users List */}
                {loading ? (
                  <div className="flex items-center justify-center py-12 min-h-[400px]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading users...</p>
                    </div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-16">
                      <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
                      <p className="text-gray-600">
                        {searchQuery || roleFilter !== 'all'
                          ? 'No users match your current filters.'
                          : 'No users found in the system.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((userItem) => (
                      <Card key={userItem._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-1 flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                                  {userItem.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-gray-900">{userItem.name}</p>
                                <p className="text-sm text-gray-600">{userItem.email}</p>
                                {userItem.phone && (
                                  <p className="text-xs text-gray-500">{userItem.phone}</p>
                                )}
                                {userItem.role === 'doctor' && userItem.specialty && (
                                  <p className="text-xs text-blue-600 mt-1">Specialty: {userItem.specialty}</p>
                                )}
                                {userItem.role === 'pharmacy' && userItem.pharmacyName && (
                                  <p className="text-xs text-purple-600 mt-1">{userItem.pharmacyName}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                              <Badge variant="outline" className="capitalize">
                                {userItem.role}
                              </Badge>
                              <select
                                value={userItem.role}
                                onChange={(e) => handleUpdateUserRole(userItem._id, e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="patient">Patient</option>
                                <option value="pharmacy">Pharmacy</option>
                                <option value="doctor">Doctor</option>
                                <option value="admin">Admin</option>
                              </select>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(userItem._id, userItem.name)}
                                disabled={isDeleting === userItem._id}
                                className="hover:bg-red-700"
                              >
                                {isDeleting === userItem._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Patient Dashboard View */}
            {activeView === 'patient' && (
              <ErrorBoundary>
                <div className="w-full">
                  <Dashboard />
                </div>
              </ErrorBoundary>
            )}

            {/* Doctor Dashboard View */}
            {activeView === 'doctor' && (
              <ErrorBoundary>
                <div className="w-full">
                  <DoctorDashboard />
                </div>
              </ErrorBoundary>
            )}

            {/* Pharmacy Dashboard View */}
            {activeView === 'pharmacy' && (
              <ErrorBoundary>
                <div className="w-full">
                  <PharmacyDashboard />
                </div>
              </ErrorBoundary>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
