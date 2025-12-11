import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  User,
  Loader2,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

interface MedicationRequest {
  _id: string;
  requestId: string;
  userId: string;
  patientInfo?: {
    name: string;
    phone: string;
    email: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    deliveryNotes?: string;
  };
  prescriptionFileURL: string;
  paymentReceiptURL?: string;
  pharmacyID: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'awaiting-payment' | 'completed';
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MedicalRequestsPageProps {
  onViewRequest: (request: MedicationRequest) => void;
}

export default function MedicalRequestsPage({ onViewRequest }: MedicalRequestsPageProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (user?.userId) {
      fetchRequests();
    } else {
      // If no user, still show the UI but with empty state
      setLoading(false);
      setRequests([]);
    }
  }, [filterStatus, dateFilter, user?.userId]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchRequests();
    };
    window.addEventListener('refreshRequests', handleRefresh);
    return () => window.removeEventListener('refreshRequests', handleRefresh);
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('🔵 MedicalRequestsPage: API CALLED - fetchRequests');
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!user?.userId) {
        console.warn('MedicalRequestsPage: User not authenticated');
        setLoading(false);
        setRequests([]);
        return;
      }

      const pharmacyId = user.userId;

      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (dateFilter) {
        params.append('date', dateFilter);
      }

      console.log(`🔵 MedicalRequestsPage: Fetching from ${API_BASE_URL}/pharmacy/${pharmacyId}/requests`);
      const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/requests?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success || data.data) {
        const requestsData = data.data || data.requests || [];
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      } else {
        // If no data but success is false, still set empty array
        setRequests([]);
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      const errorMessage = error?.message || 'Unknown error';
      // Only show toast if we had previous data
      if (requests.length > 0) {
        toast.error('Failed to refresh medical requests: ' + errorMessage);
      }
      // Always set empty array on error to ensure component renders
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'awaiting-payment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'awaiting-payment':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Ensure requests is always an array
  const safeRequests = Array.isArray(requests) ? requests : [];
  
  const filteredRequests = safeRequests.filter(request => {
    if (!request) return false;
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const patientName = request.patientInfo?.name || '';
    const requestId = request.requestId || request._id || '';
    const matchesSearch = searchQuery === '' ||
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      requestId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading medical requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Medical Requests</h2>
        <p className="text-gray-600 text-sm">Manage patient medication requests</p>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by patient name or request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="awaiting-payment">Awaiting Payment</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
                placeholder="Filter by date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="bg-white shadow-sm">
          <CardContent className="text-center py-16">
            <FileText className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Medication Requests</h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'all' || dateFilter
                ? 'No requests match your current filters.'
                : 'You don\'t have any medication requests yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredRequests.map((request) => {
            const patientName = request.patientInfo?.name || 'Unknown Patient';
            const patientPhone = request.patientInfo?.phone || 'N/A';
            const patientEmail = request.patientInfo?.email || 'N/A';
            const deliveryAddress = request.deliveryAddress || request.patientInfo?.address;
            const addressString = deliveryAddress
              ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipCode}`
              : 'Address not provided';

            return (
              <Card
                key={request._id}
                className="bg-white shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border-l-4 border-l-purple-500"
                onClick={() => onViewRequest(request)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {patientName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{patientName}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Request #{request.requestId || request._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{formatStatus(request.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prescription Preview */}
                  {request.prescriptionFileURL && (
                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                      {request.prescriptionFileURL.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={request.prescriptionFileURL}
                          alt="Prescription"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Prescription File</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Patient Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span>{patientPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-purple-600" />
                      <span className="truncate">{patientEmail}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                      <span className="line-clamp-2">{addressString}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(request.createdAt).toLocaleDateString()} at{' '}
                        {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRequest(request);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Request
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

