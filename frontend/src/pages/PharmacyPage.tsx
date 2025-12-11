import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Building,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Upload,
  CreditCard,
  Loader2,
  CheckCircle,
  Star,
  ArrowLeft,
  Send,
  X
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import io, { Socket } from 'socket.io-client';

interface Pharmacy {
  _id: string;
  name: string;
  pharmacyName: string;
  email: string;
  phone: string;
  address: string;
  image?: string;
  chatRoomId: string;
}

interface ChatMessage {
  _id: string;
  senderId: string;
  message: string;
  createdAt: string;
  senderModel: string;
}

export default function PharmacyPage() {
  const { id: pharmacyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    prescriptionFile: null as File | null,
    prescriptionFileURL: '',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    paymentMethod: 'card',
    paymentAmount: '',
    deliveryNotes: '',
    notes: ''
  });

  // Fetch pharmacy details
  useEffect(() => {
    if (pharmacyId) {
      fetchPharmacy();
    }
  }, [pharmacyId]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!user || !pharmacyId) return;

    // Get Socket.IO URL based on environment (same pattern as useRealtimeUpdates)
    const getSocketUrl = () => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5001';
      }
      return 'https://health-management-app-joj5.onrender.com';
    };

    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO');
      // Authenticate with user ID
      newSocket.emit('authenticate', user.userId || user._id);
    });

    newSocket.on('authenticated', () => {
      console.log('✅ Socket authenticated');
      // Join pharmacy chat room
      if (pharmacyId && user.userId) {
        const roomId = `pharmacy_${pharmacyId}_patient_${user.userId}`;
        newSocket.emit('joinPharmacyChatRoom', {
          pharmacyId,
          patientId: user.userId || user._id
        });
        setChatRoomId(roomId);
      }
    });

    newSocket.on('pharmacy-chat-room-joined', ({ roomId }: { roomId: string }) => {
      console.log('💊 Joined pharmacy chat room:', roomId);
      setChatRoomId(roomId);
      // Fetch chat history after joining room
      setTimeout(() => fetchChatHistory(roomId), 500);
    });

    newSocket.on('pharmacy-chat-message', (message: ChatMessage) => {
      console.log('💊 Received message:', message);
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.some(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    // Also listen for generic new-message event
    newSocket.on('new-message', (message: ChatMessage) => {
      console.log('💊 Received new-message:', message);
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    newSocket.on('chat-error', (error: { message: string }) => {
      toast.error(error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, pharmacyId]);

  const fetchPharmacy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}`);
      const data = await response.json();

      if (data.success) {
        setPharmacy(data.data);
        // Pre-fill delivery address from user profile if available
        if (user?.address) {
          setFormData(prev => ({
            ...prev,
            deliveryAddress: {
              street: user.address?.street || '',
              city: user.address?.city || '',
              state: user.address?.state || '',
              zipCode: user.address?.zipCode || ''
            }
          }));
        }
      } else {
        toast.error('Pharmacy not found');
        navigate('/medication-request');
      }
    } catch (error: any) {
      console.error('Error fetching pharmacy:', error);
      toast.error('Failed to load pharmacy details');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (roomId?: string) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      // Use patientId (which is actually the other party - pharmacy) to fetch chat
      const chatParticipantId = pharmacyId || user?.userId;
      if (!chatParticipantId) return;
      
      const response = await fetch(`${API_BASE_URL}/chats/${chatParticipantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success || data.data) {
        const chatMessages = data.data || data.messages || [];
        setMessages(Array.isArray(chatMessages) ? chatMessages : []);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Upload file
    const formData = new FormData();
    formData.append('file', file);

    const uploadFile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/file-attachments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        if (data.success || response.ok) {
          setFormData(prev => ({
            ...prev,
            prescriptionFile: file,
            prescriptionFileURL: data.fileUrl || data.data?.fileUrl
          }));
          toast.success('Prescription uploaded successfully');
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      } catch (error: any) {
        toast.error('Failed to upload prescription: ' + error.message);
      }
    };

    uploadFile();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prescriptionFileURL) {
      toast.error('Please upload your prescription');
      return;
    }

    if (!formData.deliveryAddress.street || !formData.deliveryAddress.city) {
      toast.error('Please enter a complete delivery address');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      console.log('📤 Submitting medication request to pharmacy:', pharmacyId);
      console.log('📤 Form data:', {
        prescriptionFileURL: formData.prescriptionFileURL,
        deliveryAddress: formData.deliveryAddress,
        paymentMethod: formData.paymentMethod
      });

      const response = await fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prescriptionFileURL: formData.prescriptionFileURL,
          deliveryAddress: `${formData.deliveryAddress.street}, ${formData.deliveryAddress.city}, ${formData.deliveryAddress.state} ${formData.deliveryAddress.zipCode}`,
          paymentMethod: formData.paymentMethod,
          paymentAmount: parseFloat(formData.paymentAmount) || 0,
          deliveryNotes: formData.deliveryNotes,
          notes: formData.notes,
          patientPhone: user?.phone || '',
          patientName: user?.name || '',
          patientEmail: user?.email || ''
        })
      });

      console.log('📤 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📤 Response data:', data);

      if (data.success) {
        toast.success('Medication request submitted successfully!');
        // Open chat automatically
        setShowChat(true);
        // Reset form
        setFormData({
          prescriptionFile: null,
          prescriptionFileURL: '',
          deliveryAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          paymentMethod: 'card',
          paymentAmount: '',
          deliveryNotes: '',
          notes: ''
        });
      } else {
        throw new Error(data.message || 'Failed to submit request');
      }
    } catch (error: any) {
      console.error('❌ Error submitting request:', error);
      toast.error('Failed to submit request: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !pharmacyId || !user) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      // Send via REST API (which will also emit Socket.IO event)
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: pharmacyId,
          receiverModel: 'User',
          senderModel: 'User',
          message: messageText
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Message will appear via Socket.IO event
        // Also add to local state immediately for instant feedback
        const newMsg: ChatMessage = {
          _id: data.data._id || `temp_${Date.now()}`,
          senderId: user.userId || user._id || '',
          message: messageText,
          createdAt: new Date().toISOString(),
          senderModel: 'User'
        };
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      } else {
        throw new Error(data.message || 'Failed to send message');
      }

      // Also emit via Socket.IO for real-time delivery
      if (socket && socket.connected) {
        socket.emit('patientToPharmacyMessage', {
          pharmacyId,
          message: messageText,
          requestId: null
        });
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message: ' + error.message);
      // Restore message if sending failed
      setNewMessage(messageText);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Pharmacy not found</p>
            <Button onClick={() => navigate('/medication-request')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Medication Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/medication-request')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Medication Requests
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Pharmacy Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {pharmacy.image ? (
                      <AvatarImage src={pharmacy.image} alt={pharmacy.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl">
                      {pharmacy.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{pharmacy.name}</CardTitle>
                    {pharmacy.pharmacyName && pharmacy.pharmacyName !== pharmacy.name && (
                      <CardDescription>{pharmacy.pharmacyName}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pharmacy.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <a href={`tel:${pharmacy.phone}`} className="hover:text-purple-600">
                      {pharmacy.phone}
                    </a>
                  </div>
                )}
                {pharmacy.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <a href={`mailto:${pharmacy.email}`} className="hover:text-purple-600">
                      {pharmacy.email}
                    </a>
                  </div>
                )}
                {pharmacy.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span>{pharmacy.address}</span>
                  </div>
                )}
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => setShowChat(true)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with Customer Care
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Request Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Medication Request</CardTitle>
                <CardDescription>
                  Submit your prescription to {pharmacy.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Prescription Upload */}
                  <div>
                    <Label htmlFor="prescription">Prescription File *</Label>
                    <div className="mt-2">
                      <Input
                        id="prescription"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {formData.prescriptionFileURL && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Prescription uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <Label>Delivery Address *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Input
                          placeholder="Street Address"
                          value={formData.deliveryAddress.street}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            deliveryAddress: { ...prev.deliveryAddress, street: e.target.value }
                          }))}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="City"
                          value={formData.deliveryAddress.city}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            deliveryAddress: { ...prev.deliveryAddress, city: e.target.value }
                          }))}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="State"
                          value={formData.deliveryAddress.state}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            deliveryAddress: { ...prev.deliveryAddress, state: e.target.value }
                          }))}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="ZIP Code"
                          value={formData.deliveryAddress.zipCode}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            deliveryAddress: { ...prev.deliveryAddress, zipCode: e.target.value }
                          }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <select
                      id="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 mt-2"
                      required
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="insurance">Insurance</option>
                      <option value="cash">Cash on Delivery</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Payment Amount (Optional) */}
                  <div>
                    <Label htmlFor="paymentAmount">Estimated Amount (Optional)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.paymentAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: e.target.value }))}
                      className="mt-2"
                    />
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="deliveryNotes"
                      placeholder="Any special delivery instructions..."
                      value={formData.deliveryNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting || !formData.prescriptionFileURL || !formData.deliveryAddress.street}
                    className={`w-full ${
                      submitting || !formData.prescriptionFileURL || !formData.deliveryAddress.street
                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    } text-white font-semibold py-3 rounded-lg transition-all duration-200`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                  {(!formData.prescriptionFileURL || !formData.deliveryAddress.street) && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      {!formData.prescriptionFileURL && 'Please upload your prescription. '}
                      {!formData.deliveryAddress.street && 'Please enter delivery address.'}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chat Dialog */}
        <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="max-w-2xl h-[600px] p-0 flex flex-col">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                Chat with {pharmacy.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ maxHeight: '400px' }}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isPatient = msg.senderId === (user?.userId || user?._id);
                  return (
                    <div
                      key={msg._id || `msg-${msg.createdAt}`}
                      className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isPatient
                            ? 'bg-green-500 text-white rounded-br-sm'
                            : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isPatient ? 'text-green-100' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
                disabled={!socket || !socket.connected}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || !socket || !socket.connected}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

