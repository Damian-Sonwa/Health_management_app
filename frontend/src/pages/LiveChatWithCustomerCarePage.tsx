import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  ArrowLeft, 
  Loader2,
  Search,
  Building2
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

interface Pharmacy {
  _id: string;
  name: string;
  pharmacyName?: string;
  image?: string;
  unreadCount?: number;
}

interface Message {
  _id: string;
  message: string;
  senderRole: 'patient' | 'pharmacy';
  senderId: string;
  senderName: string;
  timestamp: Date | string;
  createdAt: Date | string;
  pharmacyId?: string;
  patientId?: string;
  orderId?: string;
}

export default function LiveChatWithCustomerCarePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const patientId = user?.id || user?._id;

  // Setup Socket.IO
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
      console.log('💬 LiveChat: Socket.IO connected');
      setIsConnected(true);
      if (patientId) {
        const patId = patientId.toString();
        socketRef.current?.emit('authenticate', patId);
        socketRef.current?.emit('joinPatientRoom', patId);
        console.log('💬 LiveChat: Authenticated and joined patient room:', patId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('💬 LiveChat: Socket.IO disconnected');
      setIsConnected(false);
    });

    // Listen for new messages - handle both general and order-specific chats
    socketRef.current.on('newMessage', (message: any) => {
      console.log('💬 LiveChat: New message received:', message);
      if (!selectedPharmacy || !patientId) {
        return;
      }
      
      // Normalize IDs to strings for comparison
      const msgPharmacyId = message.pharmacyId?.toString();
      const msgPatientId = message.patientId?.toString() || message.senderId?.toString() || message.receiverId?.toString();
      const selectedPharmacyId = selectedPharmacy._id?.toString();
      const currentPatientId = patientId.toString();
      
      // Check if message is for this pharmacy-patient pair
      const isPharmacyMatch = msgPharmacyId === selectedPharmacyId || 
                              message.receiverId?.toString() === selectedPharmacyId ||
                              message.senderId?.toString() === selectedPharmacyId;
      const isPatientMatch = msgPatientId === currentPatientId || 
                            message.receiverId?.toString() === currentPatientId ||
                            message.senderId?.toString() === currentPatientId;
      
      // For general chats: no orderId/medicalRequestId (this page is for general chats only)
      const isGeneralChat = !message.orderId && !message.medicalRequestId && !message.requestId;
      
      if (isPharmacyMatch && isPatientMatch && isGeneralChat) {
        console.log('💬 LiveChat: Message matches current chat, adding to UI');
        setMessages(prev => {
          // Remove temp messages that match this real message
          const filteredPrev = prev.filter(m => {
            if (m._id?.toString().startsWith('temp_')) {
              return !(m.message === message.message);
            }
            return true;
          });
          
          // Check if message already exists
          const msgId = message._id?.toString() || message._id;
          if (filteredPrev.some(m => {
            const mId = m._id?.toString() || m._id;
            return mId === msgId;
          })) {
            return filteredPrev;
          }
          
          return [...filteredPrev, message];
        });
        scrollToBottom();
        // Update unread count for this pharmacy
        setPharmacies(prev => prev.map(p => 
          p._id === selectedPharmacy._id 
            ? { ...p, unreadCount: (p.unreadCount || 0) + 1 }
            : p
        ));
      } else {
        console.log('💬 LiveChat: Message does not match current chat, skipping');
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [patientId, selectedPharmacy]);

  // Fetch pharmacies the patient has ordered from
  useEffect(() => {
    fetchPharmacies();
  }, [patientId]);

  // Load chat history when pharmacy is selected
  useEffect(() => {
    if (selectedPharmacy && patientId && socketRef.current && socketRef.current.connected) {
      fetchChatHistory(selectedPharmacy._id);
      
      // Join the general chat room (roomId format: sorted IDs)
      const roomId = [patientId, selectedPharmacy._id].sort().join('_');
      socketRef.current.emit('join-chat-room', { roomId });
      
      // Also join pharmacy-specific room for compatibility
      socketRef.current.emit('joinPharmacyChatRoom', {
        pharmacyId: selectedPharmacy._id,
        patientId: patientId
      });
      
      console.log('💬 LiveChat: Joined chat room:', roomId);
    }
  }, [selectedPharmacy, patientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchPharmacies = async () => {
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
        const requests = data.requests || [];
        // Extract unique pharmacies from requests
        const pharmacyMap = new Map<string, Pharmacy>();
        
        requests.forEach((req: any) => {
          const pharmacyId = req.pharmacyID || req.pharmacy?._id;
          if (pharmacyId && !pharmacyMap.has(pharmacyId)) {
            pharmacyMap.set(pharmacyId, {
              _id: pharmacyId,
              name: req.pharmacy?.name || req.pharmacyName || 'Pharmacy',
              pharmacyName: req.pharmacy?.pharmacyName || req.pharmacyName,
              image: req.pharmacy?.image,
              unreadCount: 0
            });
          }
        });

        setPharmacies(Array.from(pharmacyMap.values()));
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast.error('Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (pharmacyId: string) => {
    try {
      setChatLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch general chat messages between patient and this pharmacy (not order-specific)
      // This uses the unified endpoint that supports pharmacyId + patientId filtering
      const response = await fetch(`${API_BASE_URL}/chats/messages?pharmacyId=${pharmacyId}&patientId=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const messagesData = (data.messages || data.data || [])
          .sort((a: Message, b: Message) => {
            const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
            const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
            return dateA - dateB;
          });
        setMessages(messagesData);
        scrollToBottom();
      } else {
        toast.error(data.message || 'Failed to load chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPharmacy || !patientId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const tempMessage: Message = {
      _id: `temp_${Date.now()}`,
      message: messageText,
      senderRole: 'patient',
      senderId: patientId,
      senderName: user?.name || 'Patient',
      timestamp: new Date(),
      createdAt: new Date(),
      pharmacyId: selectedPharmacy._id,
      patientId: patientId
    };
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      if (socketRef.current && socketRef.current.connected) {
        // Use unified patientToPharmacyMessage event (general chat, no orderId)
        socketRef.current.emit('patientToPharmacyMessage', {
          pharmacyId: selectedPharmacy._id,
          patientId: patientId,
          message: messageText,
          senderId: patientId
          // No orderId - this is a general chat message
        });

        // Remove temp message after delay
        setTimeout(() => {
          setMessages(prev => prev.filter(m => !m._id.startsWith('temp_')));
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
            receiverId: selectedPharmacy._id,
            receiverModel: 'User',
            message: messageText,
            senderName: user?.name || 'Patient',
            pharmacyId: selectedPharmacy._id,
            patientId: patientId,
            senderRole: 'patient'
          })
        });

        const data = await response.json();
        if (data.success) {
          setMessages(prev => {
            const filtered = prev.filter(m => !m._id.startsWith('temp_'));
            return [...filtered, data.data || data.message];
          });
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      }
    } catch (error: any) {
      setMessages(prev => prev.filter(m => !m._id.startsWith('temp_')));
      toast.error('Failed to send message: ' + error.message);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.pharmacyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/medication-request')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Medication Requests
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Live Chat with Customer Care
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Chat with pharmacies about your medication requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Pharmacy List Sidebar */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search pharmacies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <CardTitle className="text-lg">Pharmacies</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {filteredPharmacies.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No pharmacies found</p>
                <p className="text-xs mt-1">Place an order to start chatting</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredPharmacies.map((pharmacy) => (
                  <button
                    key={pharmacy._id}
                    onClick={() => {
                      setSelectedPharmacy(pharmacy);
                      setMessages([]);
                      // Reset unread count when opening chat
                      setPharmacies(prev => prev.map(p => 
                        p._id === pharmacy._id ? { ...p, unreadCount: 0 } : p
                      ));
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedPharmacy?._id === pharmacy._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {pharmacy.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {pharmacy.pharmacyName || pharmacy.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {pharmacy.name}
                        </p>
                      </div>
                      {pharmacy.unreadCount && pharmacy.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {pharmacy.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedPharmacy ? (
            <>
              <CardHeader className="border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedPharmacy.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedPharmacy.pharmacyName || selectedPharmacy.name}
                      </CardTitle>
                      {isConnected ? (
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          Online
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">Offline</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                  {chatLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isPatient = message.senderRole === 'patient' || message.senderId === patientId;
                      const timestamp = formatTime(message.timestamp || message.createdAt);
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] ${isPatient ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isPatient
                                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-br-none'
                                  : 'bg-green-500 text-white rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm break-words">{message.message}</p>
                            </div>
                            <p className={`text-xs mt-1 px-1 ${isPatient ? 'text-right text-gray-500' : 'text-left text-gray-400'}`}>
                              {timestamp}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={sendMessage} className="border-t p-3 bg-white dark:bg-gray-800 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a pharmacy to start chatting</p>
                <p className="text-sm mt-2">Choose a pharmacy from the list to view your conversation</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

