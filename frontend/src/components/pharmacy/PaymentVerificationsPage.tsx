import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Filter,
  Clock,
  User,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MedicationRequest {
  _id: string;
  requestId?: string;
  patientInfo: {
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
  paymentReceiptURL?: string;
  payment: {
    method: string;
    amount?: number;
    status: string;
    receiptUrl?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentVerificationsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Safety check - ensure component always renders
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please log in to view payment verifications</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPaymentVerifications();
  }, []);

  const fetchPaymentVerifications = async () => {
    try {
      console.log('🔵 PaymentVerificationsPage: API CALLED - fetchPaymentVerifications');
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!user?.userId) {
        console.warn('PaymentVerificationsPage: User not authenticated');
        setLoading(false);
        setRequests([]);
        return;
      }

      // Fetch all requests for this pharmacy
      console.log(`🔵 PaymentVerificationsPage: Fetching from ${API_BASE_URL}/pharmacy/${user.userId}/requests`);
      const response = await fetch(`${API_BASE_URL}/pharmacy/${user.userId}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Filter requests that have payment receipts
        const requestsWithReceipts = (data.data || []).filter(
          (req: MedicationRequest) => req.paymentReceiptURL || req.payment?.receiptUrl
        );
        setRequests(requestsWithReceipts);
      } else {
        throw new Error(data.message || 'Failed to fetch payment verifications');
      }
    } catch (error: any) {
      console.error('Error fetching payment verifications:', error);
      const errorMessage = error?.message || 'Unknown error';
      console.error('PaymentVerificationsPage fetch error:', errorMessage);
      // Don't show toast on initial load to avoid spam
      if (requests.length === 0) {
        console.warn('Failed to load payment verifications:', errorMessage);
      } else {
        toast.error('Failed to load payment verifications: ' + errorMessage);
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/pharmacy/medical-request/${requestId}/verify-payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: 'Payment verified by pharmacy'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Payment verified successfully!');
        fetchPaymentVerifications();
      } else {
        throw new Error(data.message || 'Failed to verify payment');
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting-payment':
        return 'bg-orange-100 text-orange-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.patientInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.patientInfo?.phone?.includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      request.status === statusFilter ||
      (statusFilter === 'awaiting-verification' && request.payment?.status === 'pending');

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading payment verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Payment Verifications</h2>
        <p className="text-gray-600 text-sm">
          Review and verify payment receipts from patients
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by patient name, phone, or request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="awaiting-verification">Awaiting Verification</SelectItem>
                <SelectItem value="awaiting-payment">Awaiting Payment</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 font-medium">No payment receipts found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Payment receipts will appear here when patients upload them'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredRequests.map((request) => {
            const receiptUrl = request.paymentReceiptURL || request.payment?.receiptUrl;
            const needsVerification = 
              request.payment?.status === 'pending' || 
              request.status === 'awaiting-payment';

            return (
              <Card key={request._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Left: Receipt Preview */}
                    <div className="w-full lg:w-48 flex-shrink-0">
                      {receiptUrl ? (
                        <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          {receiptUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={receiptUrl}
                              alt="Payment Receipt"
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(receiptUrl, '_blank')}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-black/50 text-white text-xs">
                              Receipt
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="h-40 bg-orange-50 rounded-lg border-2 border-orange-200 flex items-center justify-center">
                          <AlertCircle className="w-12 h-12 text-orange-400" />
                        </div>
                      )}
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                              {request.patientInfo?.name?.charAt(0).toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {request.patientInfo?.name || 'Unknown Patient'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Request #{request.requestId || request._id.slice(-8)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace(/-/g, ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getPaymentStatusColor(request.payment?.status || 'pending')}>
                            {request.payment?.status?.toUpperCase() || 'PENDING'}
                          </Badge>
                        </div>
                      </div>

                      {/* Patient Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{request.patientInfo?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(request.createdAt)}</span>
                        </div>
                        {request.payment?.amount && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            <span>${request.payment.amount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <CreditCard className="w-4 h-4" />
                          <span>{request.payment?.method?.toUpperCase() || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        {receiptUrl && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(receiptUrl, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Receipt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = receiptUrl;
                                link.download = `receipt_${request.requestId || request._id}.jpg`;
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </>
                        )}
                        {needsVerification && (
                          <Button
                            className="bg-green-600 hover:bg-green-700 ml-auto"
                            size="sm"
                            onClick={() => handleVerifyPayment(request._id)}
                            disabled={processingId === request._id}
                          >
                            {processingId === request._id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Verify Payment
                          </Button>
                        )}
                        {request.payment?.status === 'completed' && (
                          <Badge className="bg-green-100 text-green-800 ml-auto">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

