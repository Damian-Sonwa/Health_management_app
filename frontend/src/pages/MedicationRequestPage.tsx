import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Upload, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Truck, 
  Package,
  Shield,
  User,
  Phone,
  Mail,
  Plus,
  Eye,
  X,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/components/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import PharmacySelect from '@/components/PharmacySelect';
import { toast } from 'sonner';
import EmbeddedRequestChat from '@/components/EmbeddedRequestChat';
import { io, Socket } from 'socket.io-client';

interface MedicationRequest {
  _id?: string;
  id: string;
  patientInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  prescriptionFile?: File | null;
  pharmacy?: {
    name: string;
  } | string;
  deliveryAddress?: {
    street: string;
  } | string;
  paymentMethod?: string;
  paymentReceipt?: File | null;
  status: 'pending' | 'processing' | 'verified' | 'dispensing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: Date | string;
  notes?: string;
}

export default function MedicationRequestPage() {
  const { user, isPharmacy, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<MedicationRequest | null>(null);
  const [selectedRequestForChat, setSelectedRequestForChat] = useState<MedicationRequest | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = React.useRef<Socket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [newRequest, setNewRequest] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    prescriptionFile: null as File | null,
    pharmacy: '',
    deliveryAddress: '',
    paymentMethod: 'card',
    paymentReceipt: null as File | null,
    notes: ''
  });

  // Fetch medication requests based on role
  useEffect(() => {
    fetchRequests();
  }, [user]);

  // Setup Socket.IO connection
  useEffect(() => {
    const getSocketUrl = () => {
      const apiUrl = API_BASE_URL.replace('/api', '');
      if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
        return 'http://localhost:5001';
      }
      return apiUrl.replace('https://', 'https://').replace('http://', 'http://');
    };

    const socketUrl = getSocketUrl();
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('💬 MedicationRequestPage: Socket.IO connected');
      setIsSocketConnected(true);
      const userId = user?.id || user?._id;
      if (userId) {
        socketRef.current?.emit('authenticate', userId);
        // Join patient room
        socketRef.current?.emit('joinPatientRoom', userId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('💬 MedicationRequestPage: Socket.IO disconnected');
      setIsSocketConnected(false);
    });

    // Listen for new messages - unified event
    socketRef.current.on('newMessage', (message: any) => {
      console.log('💬 MedicationRequestPage: New message received:', message);
      // Filter by orderId/medicalRequestId/requestId
      const messageOrderId = message.orderId || message.medicalRequestId || message.requestId;
      if (messageOrderId === activeOrderId) {
        setChatMessages(prev => {
          if (prev.some(m => {
            const mId = m._id?.toString() || m._id;
            const msgId = message._id?.toString() || message._id;
            return mId === msgId;
          })) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToChatBottom();
      }
    });

    // Also listen for pharmacy chat message event (backward compatibility)
    socketRef.current.on('newPharmacyChatMessage', (data: any) => {
      const message = data.message || data;
      const messageOrderId = message.orderId || message.medicalRequestId || message.requestId;
      if (messageOrderId === activeOrderId) {
        setChatMessages(prev => {
          if (prev.some(m => {
            const mId = m._id?.toString() || m._id;
            const msgId = message._id?.toString() || message._id;
            return mId === msgId;
          })) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToChatBottom();
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, activeOrderId]);

  const scrollToChatBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Function to open chat room for specific order
  const openChatRoom = async (orderId: string) => {
    setActiveOrderId(orderId);
    setShowChat(true);
    setChatLoading(true);

    // Join socket room for this order - Use joinOrderChatRoom
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('joinOrderChatRoom', orderId);
      
      // Also emit joinPharmacyChatRoom for compatibility (extract pharmacyId if needed)
      const request = requests.find(r => (r._id || r.id) === orderId);
      const pharmacyId = typeof request?.pharmacy === 'string' 
        ? request.pharmacy 
        : request?.pharmacyID || '';
      
      if (pharmacyId) {
        socketRef.current.emit('joinPharmacyChatRoom', {
          pharmacyId: pharmacyId,
          medicalRequestId: orderId,
          orderId: orderId
        });
      }
    }

    // Load message history
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/chats/history/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const messagesData = (data.messages || data.data || []).sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
          const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
          return dateA - dateB;
        });
        setChatMessages(messagesData);
        scrollToChatBottom();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setChatLoading(false);
    }
  };

  // Function to send chat message
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !activeOrderId || !user?.id) return;

    const messageText = newChatMessage.trim();
    setNewChatMessage('');

    // Optimistic update
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      message: messageText,
      senderRole: 'patient',
      senderName: user.name || 'Patient',
      timestamp: new Date(),
      createdAt: new Date(),
      medicalRequestId: activeOrderId
    };
    setChatMessages(prev => [...prev, tempMessage]);
    scrollToChatBottom();

    try {
      // Get pharmacy ID from request
      const request = requests.find(r => (r._id || r.id) === activeOrderId);
      const pharmacyId = typeof request?.pharmacy === 'string' 
        ? request.pharmacy 
        : request?.pharmacyID || '';

      if (socketRef.current && socketRef.current.connected && pharmacyId) {
        // Send via socket - include orderId as specified
        socketRef.current.emit('patientSendMessage', {
          pharmacyId: pharmacyId,
          medicalRequestId: activeOrderId,
          orderId: activeOrderId, // Explicitly include orderId
          patientId: user.id,
          sender: user.id, // Also include sender as specified
          message: messageText
        });

        // Remove temp message after a delay (will be replaced by real message)
        setTimeout(() => {
          setChatMessages(prev => prev.filter(m => !m._id.startsWith('temp_')));
        }, 1000);
      } else {
        // Fallback to HTTP API
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            receiverId: pharmacyId,
            receiverModel: 'Pharmacy',
            message: messageText,
            senderName: user.name || 'Patient',
            medicalRequestId: activeOrderId,
            pharmacyId: pharmacyId,
            patientId: user.id,
            senderRole: 'patient'
          })
        });

        const data = await response.json();
        if (data.success) {
          setChatMessages(prev => {
            const filtered = prev.filter(m => !m._id.startsWith('temp_'));
            return [...filtered, data.data || data.message];
          });
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      }
    } catch (error: any) {
      setChatMessages(prev => prev.filter(m => !m._id.startsWith('temp_')));
      toast.error('Failed to send message: ' + error.message);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/medication-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string, notes?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/medication-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, notes })
      });
      const data = await response.json();
      if (data.success) {
        await fetchRequests();
        alert('Request status updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating request:', error);
      alert('Failed to update request: ' + error.message);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get auth token
      const token = localStorage.getItem('authToken');
      
      // Validate required fields
      if (!newRequest.pharmacy || newRequest.pharmacy.trim() === '') {
        alert('Please select a pharmacy');
        return;
      }

      if (!newRequest.prescriptionFile) {
        alert('Please upload a prescription file');
        return;
      }

      if (!newRequest.patientName || newRequest.patientName.trim() === '') {
        alert('Please enter patient name');
        return;
      }

      console.log('📤 Submitting medication request with:', {
        hasPharmacy: !!newRequest.pharmacy,
        pharmacy: newRequest.pharmacy,
        hasPrescriptionFile: !!newRequest.prescriptionFile,
        prescriptionFileName: newRequest.prescriptionFile?.name,
        hasPatientName: !!newRequest.patientName,
        patientName: newRequest.patientName
      });

      // Upload prescription file first
      const prescriptionFormData = new FormData();
      prescriptionFormData.append('file', newRequest.prescriptionFile);
      prescriptionFormData.append('patientId', user?.id || user?._id || '');
      prescriptionFormData.append('description', `Prescription for medication request`);

      let prescriptionFileURL = '';
      try {
        console.log('📤 Uploading prescription file:', newRequest.prescriptionFile.name);
        const fileResponse = await fetch(`${API_BASE_URL}/file-attachments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: prescriptionFormData
        });
        
        console.log('📤 File upload response status:', fileResponse.status);
        
        if (!fileResponse.ok) {
          const errorText = await fileResponse.text();
          console.error('❌ File upload failed:', errorText);
          throw new Error(`Failed to upload prescription file: ${fileResponse.status} ${errorText}`);
        }
        
        const fileData = await fileResponse.json();
        console.log('📤 File upload response:', fileData);
        
        // Handle different response formats
        if (fileData.success) {
          // Check multiple possible locations for fileUrl
          prescriptionFileURL = fileData.data?.fileUrl || 
                              fileData.data?.file?.fileUrl ||
                              fileData.fileUrl || 
                              fileData.file?.fileUrl;
          
          if (prescriptionFileURL) {
            // Ensure URL is absolute if it's relative
            if (prescriptionFileURL.startsWith('/')) {
              prescriptionFileURL = `${API_BASE_URL}${prescriptionFileURL}`;
            }
            console.log('✅ Prescription file uploaded:', prescriptionFileURL);
          } else {
            console.error('❌ File URL not found in response:', JSON.stringify(fileData, null, 2));
            throw new Error(`File uploaded but no file URL returned. Response: ${JSON.stringify(fileData)}`);
          }
        } else {
          const errorMsg = fileData.message || fileData.error || 'Failed to upload prescription file';
          console.error('❌ File upload failed:', fileData);
          throw new Error(errorMsg);
        }
      } catch (fileError: any) {
        console.error('❌ Error uploading prescription:', fileError);
        alert('Failed to upload prescription file: ' + (fileError.message || 'Unknown error'));
        return;
      }

      // Upload payment receipt if provided
      let paymentReceiptURL = '';
      if (newRequest.paymentReceipt) {
        const receiptFormData = new FormData();
        receiptFormData.append('file', newRequest.paymentReceipt);
        receiptFormData.append('patientId', user?.id || '');
        receiptFormData.append('description', `Payment receipt for medication request`);

        try {
          const receiptResponse = await fetch(`${API_BASE_URL}/file-attachments`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: receiptFormData
          });
          const receiptData = await receiptResponse.json();
          if (receiptData.success) {
            // Check multiple possible locations for fileUrl
            paymentReceiptURL = receiptData.data?.fileUrl || 
                               receiptData.fileUrl || 
                               receiptData.data?.file?.fileUrl ||
                               receiptData.file?.fileUrl;
            if (paymentReceiptURL) {
              console.log('✅ Payment receipt uploaded:', paymentReceiptURL);
            }
          }
        } catch (receiptError) {
          console.error('Error uploading payment receipt:', receiptError);
          // Don't fail the request if receipt upload fails
        }
      }

      // Create request data with proper field names
      const requestData = {
        pharmacyID: newRequest.pharmacy, // Backend expects pharmacyID
        patientInfo: {
          name: newRequest.patientName || user?.name || '',
          phone: newRequest.patientPhone || user?.phone || '',
          email: newRequest.patientEmail || user?.email || '',
          address: {
            street: newRequest.deliveryAddress || '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA'
          },
          deliveryNotes: newRequest.notes || ''
        },
        prescriptionFileURL: prescriptionFileURL,
        paymentReceiptURL: paymentReceiptURL || undefined,
        deliveryAddress: {
          street: newRequest.deliveryAddress || '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        payment: {
          method: newRequest.paymentMethod || 'card',
          amount: 0,
          currency: 'USD',
          status: 'pending'
        },
        notes: newRequest.notes || ''
      };

      console.log('📤 Submitting medication request:', requestData);
      console.log('📤 Request payload:', JSON.stringify(requestData, null, 2));

      // Submit to API
      const response = await fetch(`${API_BASE_URL}/medication-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('📤 Response status:', response.status, response.statusText);
      console.log('📤 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          const text = await response.text();
          console.error('❌ Failed to parse JSON response:', parseError);
          console.error('❌ Response text:', text);
          throw new Error(`Server returned invalid JSON: ${text.substring(0, 200)}`);
        }
      } else {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
      }
      
      console.log('📤 Response data:', data);
      
      if (!response.ok) {
        const errorMessage = data.message || data.error || `Failed to submit request (${response.status})`;
        console.error('❌ Request failed:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          fullResponse: data
        });
        throw new Error(errorMessage);
      }

      // Success - refresh requests list
      await fetchRequests();
      
      // Capture orderId from response - try multiple possible response formats
      const orderId = data.data?._id || data.request?._id || data._id;
      
      if (orderId) {
        // Set active order ID and prepare chat
        setActiveOrderId(orderId);
        
        // Reset form
        setNewRequest({
          patientName: '',
          patientPhone: '',
          patientEmail: '',
          prescriptionFile: null,
          pharmacy: '',
          deliveryAddress: '',
          paymentMethod: 'card',
          paymentReceipt: null,
          notes: ''
        });
        setShowNewRequestForm(false);
        
        toast.success('Medication request submitted successfully! Click "Chat with Customer Care" to start chatting.');
      } else {
        // Fallback if orderId not found
        setNewRequest({
          patientName: '',
          patientPhone: '',
          patientEmail: '',
          prescriptionFile: null,
          pharmacy: '',
          deliveryAddress: '',
          paymentMethod: 'card',
          paymentReceipt: null,
          notes: ''
        });
        setShowNewRequestForm(false);
        toast.success('Medication request submitted successfully!');
      }
    } catch (error: any) {
      console.error('❌ Error submitting request:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to submit request. Please try again.';
      alert('Failed to submit request: ' + errorMessage);
    }
  };

  const handleFileUpload = (field: 'prescriptionFile' | 'paymentReceipt', file: File) => {
    setNewRequest(prev => ({ ...prev, [field]: file }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
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
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isPharmacyView = isPharmacy || (isAdmin && location.pathname === '/pharmacy-dashboard');
  const canCreateRequest = !isPharmacyView; // Only patients and admin can create requests
  const showChatPanel = !isPharmacyView && selectedRequestForChat && selectedRequestForChat._id;
  const showRightColumn = !isPharmacyView; // Always show right column for patients (chat or placeholder)

  return (
    <div className={showRightColumn ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
      {/* Left Column: Form and Request List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isPharmacyView ? 'Pharmacy Dashboard' : 'Medication Request'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isPharmacyView 
                ? 'Review and manage medication requests' 
                : 'Submit prescriptions and track medication deliveries'}
            </p>
          </div>
          {canCreateRequest && (
            <Button 
              onClick={() => setShowNewRequestForm(true)} 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Secure & Private</p>
                <p className="text-xs text-green-600">All prescriptions and payment receipts are encrypted and HIPAA compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {showNewRequestForm && canCreateRequest && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Submit New Medication Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="patientName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Patient Name
                    </Label>
                    <Input
                      id="patientName"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRequest.patientName}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientPhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="patientPhone"
                      type="tel"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRequest.patientPhone}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, patientPhone: e.target.value }))}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRequest.patientEmail}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, patientEmail: e.target.value }))}
                      placeholder="Email address"
                      required
                    />
                  </div>
                </div>

                {/* Prescription Upload */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4" />
                    Prescription Upload
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('prescriptionFile', file);
                      }}
                      className="hidden"
                      id="prescription-upload"
                    />
                    <label htmlFor="prescription-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {newRequest.prescriptionFile 
                          ? `Selected: ${newRequest.prescriptionFile.name}`
                          : 'Click to upload prescription (PDF, JPG, PNG)'
                        }
                      </p>
                    </label>
                  </div>
                </div>

                {/* Pharmacy Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pharmacy" className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4" />
                      Preferred Pharmacy *
                    </Label>
                    <PharmacySelect
                      value={newRequest.pharmacy}
                      onChange={(pharmacyId) => {
                        console.log('🔵 Pharmacy selected:', pharmacyId);
                        setNewRequest(prev => ({ ...prev, pharmacy: pharmacyId || '' }));
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Select an approved pharmacy for your medication request
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </Label>
                    <select
                      id="paymentMethod"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={newRequest.paymentMethod}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="insurance">Insurance</option>
                      <option value="cash">Cash on Delivery</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <Label htmlFor="deliveryAddress" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </Label>
                  <Textarea
                    id="deliveryAddress"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newRequest.deliveryAddress}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    placeholder="Enter complete delivery address"
                    rows={3}
                    required
                  />
                </div>

                {/* Payment Receipt Upload */}
                {newRequest.paymentMethod !== 'cash' && (
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4" />
                      Payment Receipt (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('paymentReceipt', file);
                        }}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {newRequest.paymentReceipt 
                            ? `Selected: ${newRequest.paymentReceipt.name}`
                            : 'Upload payment receipt (optional)'
                          }
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special instructions or notes"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !newRequest.patientName?.trim() || 
                      !newRequest.prescriptionFile || 
                      !newRequest.pharmacy || 
                      newRequest.pharmacy.trim() === ''
                    }
                    onClick={(e) => {
                      const isDisabled = !newRequest.patientName?.trim() || 
                        !newRequest.prescriptionFile || 
                        !newRequest.pharmacy || 
                        newRequest.pharmacy.trim() === '';
                      
                      console.log('🔵 Submit button clicked:', {
                        isDisabled,
                        hasPatientName: !!newRequest.patientName?.trim(),
                        patientName: newRequest.patientName,
                        hasPrescriptionFile: !!newRequest.prescriptionFile,
                        prescriptionFileName: newRequest.prescriptionFile?.name,
                        hasPharmacy: !!newRequest.pharmacy && newRequest.pharmacy.trim() !== '',
                        pharmacy: newRequest.pharmacy
                      });
                      
                      if (isDisabled) {
                        e.preventDefault();
                        console.warn('⚠️ Form submission prevented - missing required fields');
                        alert('Please fill in all required fields: Patient Name, Prescription File, and Pharmacy');
                        return false;
                      }
                      console.log('✅ Submit button clicked - form is valid, submitting...');
                    }}
                    title={
                      !newRequest.patientName?.trim() ? 'Patient name is required' :
                      !newRequest.prescriptionFile ? 'Prescription file is required' :
                      !newRequest.pharmacy || newRequest.pharmacy.trim() === '' ? 'Please select a pharmacy' :
                      'Submit medication request'
                    }
                  >
                    Submit Request
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewRequestForm(false)}
                    className="hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              {/* Success message with Chat button */}
              {activeOrderId && !showChat && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium mb-3">
                    ✅ Medication request submitted successfully!
                  </p>
                  <Button
                    onClick={() => openChatRoom(activeOrderId)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Customer Care
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isPharmacyView ? 'Medication Requests' : 'Your Medication Requests'}
          </h2>
          
          {loading ? (
            <Card className="border-0 shadow-xl">
              <CardContent className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading requests...</p>
              </CardContent>
            </Card>
          ) : requests.length === 0 ? (
            <Card className="border-0 shadow-xl">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Medication Requests</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Submit your first prescription request to get medications delivered to your doorstep.
                </p>
                <Button 
                  onClick={() => setShowNewRequestForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit First Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => {
                const requestId = request._id || request.id;
                const patientName = request.patientInfo?.name || request.patientName || 'Unknown';
                const patientPhone = request.patientInfo?.phone || request.patientPhone || '';
                const patientEmail = request.patientInfo?.email || request.patientEmail || '';
                const pharmacyName = typeof request.pharmacy === 'string' 
                  ? request.pharmacy 
                  : request.pharmacy?.name || 'Unknown';
                const pharmacyId = typeof request.pharmacy === 'string' 
                  ? request.pharmacy 
                  : request.pharmacy?._id || request.pharmacy?.id || '';
                const deliveryAddress = typeof request.deliveryAddress === 'string'
                  ? request.deliveryAddress
                  : request.deliveryAddress?.street || '';
                const createdAt = request.createdAt 
                  ? (typeof request.createdAt === 'string' ? new Date(request.createdAt) : request.createdAt)
                  : new Date();

                return (
                  <Card key={requestId} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{patientName}</h3>
                          <p className="text-sm text-gray-500">Request #{String(requestId).slice(-6)}</p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{formatStatus(request.status)}</span>
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="capitalize">{pharmacyName.replace(/_/g, ' ')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{createdAt.toLocaleDateString()}</span>
                        </div>

                        {request.paymentMethod && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            <span className="capitalize">{request.paymentMethod.replace(/_/g, ' ')}</span>
                          </div>
                        )}

                        {request.notes && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 italic">"{request.notes}"</p>
                          </div>
                        )}

                        <div className="pt-2 space-y-2">
                          {!isPharmacyView && requestId && (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                              onClick={() => {
                                // Use openChatRoom function
                                openChatRoom(requestId);
                                // Scroll to chat panel
                                setTimeout(() => {
                                  const chatPanel = document.querySelector('[data-chat-panel]');
                                  if (chatPanel) {
                                    chatPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 100);
                              }}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Chat with Customer Care
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                            onClick={() => setViewingRequest(request)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          
                          {isPharmacyView && request.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleUpdateStatus(requestId, 'processing')}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleUpdateStatus(requestId, 'cancelled')}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                          
                          {isPharmacyView && request.status === 'processing' && (
                            <Button 
                              size="sm" 
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleUpdateStatus(requestId, 'dispensing')}
                            >
                              Mark as Dispensing
                            </Button>
                          )}
                          
                          {isPharmacyView && request.status === 'dispensing' && (
                            <Button 
                              size="sm" 
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => handleUpdateStatus(requestId, 'out_for_delivery')}
                            >
                              Mark as Out for Delivery
                            </Button>
                          )}
                          
                          {isPharmacyView && request.status === 'out_for_delivery' && (
                            <Button 
                              size="sm" 
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleUpdateStatus(requestId, 'delivered')}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Embedded Chat Panel - NEW IMPLEMENTATION */}
      {showChat && activeOrderId && (
        <div className="lg:sticky lg:top-6" data-chat-panel>
          <Card className="h-[80vh] max-h-[800px] flex flex-col shadow-xl">
            <CardHeader className="border-b pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    Chat with Customer Care
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Order #{activeOrderId.slice(-8)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isSocketConnected ? (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      Offline
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowChat(false);
                      setChatMessages([]);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {chatLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((message) => {
                    const isPatient = message.senderRole === 'patient';
                    const timestamp = new Date(message.timestamp || message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isPatient ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isPatient
                                ? 'bg-green-500 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm'
                            }`}
                          >
                            <p className="text-sm break-words">{message.message}</p>
                          </div>
                          <p className={`text-xs mt-1 px-1 ${isPatient ? 'text-right text-gray-500' : 'text-left text-gray-400'}`}>
                            {message.senderName || (isPatient ? 'You' : 'Customer Care')} • {timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <form onSubmit={sendChatMessage} className="border-t p-3 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-2 rounded-lg"
                    disabled={!newChatMessage.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Right Column: Embedded Chat Panel - OLD IMPLEMENTATION (keep for compatibility) */}
      {!showChat && showChatPanel && selectedRequestForChat && (
        <div className="lg:sticky lg:top-6" data-chat-panel>
          {(() => {
            const requestId = selectedRequestForChat._id || selectedRequestForChat.id;
            const pharmacyId = typeof selectedRequestForChat.pharmacy === 'string' 
              ? selectedRequestForChat.pharmacy 
              : selectedRequestForChat.pharmacyID || '';
            const pharmacyName = typeof selectedRequestForChat.pharmacy === 'object' 
              ? selectedRequestForChat.pharmacy?.name || 'Pharmacy'
              : 'Pharmacy';
            const patientId = user?.id || user?._id || '';

            if (!requestId || !pharmacyId) {
              return (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Unable to load chat. Missing request or pharmacy information.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSelectedRequestForChat(null)}
                    >
                      Close
                    </Button>
                  </div>
                </Card>
              );
            }

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Chat Room</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedRequestForChat(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <EmbeddedRequestChat
                  medicalRequestId={requestId}
                  pharmacyId={pharmacyId}
                  patientId={patientId}
                  pharmacyName={pharmacyName}
                  requestStatus={selectedRequestForChat.status}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* Show placeholder when no chat is selected - Always show on large screens for patients */}
      {showRightColumn && !showChatPanel && (
        <div className="lg:sticky lg:top-6" style={{ minHeight: '600px' }}>
          <Card className="h-full min-h-[600px] flex items-center justify-center border-dashed border-2">
            <div className="text-center text-gray-500 p-6">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Chat Room</h3>
              <p className="text-sm mb-4">
                Submit your order to start a chat with customer care.
              </p>
              <p className="text-xs text-gray-400">
                Or select an existing order from the list to view its chat history.
              </p>
            </div>
          </Card>
        </div>
      )}

        {/* View Details Modal */}
        <Dialog open={!!viewingRequest} onOpenChange={() => setViewingRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Request Details
              </span>
              <Button variant="ghost" size="sm" onClick={() => setViewingRequest(null)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {viewingRequest && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Request ID</p>
                  <p className="font-semibold text-gray-900">{viewingRequest.id}</p>
                </div>
                <Badge className={getStatusColor(viewingRequest.status)}>
                  {getStatusIcon(viewingRequest.status)}
                  <span className="ml-1 capitalize">{formatStatus(viewingRequest.status)}</span>
                </Badge>
              </div>

              {/* Patient Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{viewingRequest.patientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{viewingRequest.patientPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{viewingRequest.patientEmail}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Request Details
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Pharmacy</p>
                    <p className="font-medium capitalize">{viewingRequest.pharmacy.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">{viewingRequest.paymentMethod.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Delivery Address</p>
                    <p className="font-medium">{viewingRequest.deliveryAddress}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="font-medium">{viewingRequest.createdAt.toLocaleDateString()} at {viewingRequest.createdAt.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {/* Files */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Attached Files
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Prescription File</span>
                    <Badge variant="outline">PDF</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Payment Receipt</span>
                    <Badge variant="outline">PDF</Badge>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingRequest.notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Additional Notes</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 italic">"{viewingRequest.notes}"</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Truck className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
  );
}