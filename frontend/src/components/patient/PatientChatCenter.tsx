import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  message: string;
  senderRole: 'patient' | 'pharmacy';
  senderName: string;
  timestamp: Date | string;
  createdAt: Date | string;
}

interface ChatSession {
  _id: string;
  medicalRequestId: string;
  requestId: string;
  pharmacyName: string;
  pharmacyId: string;
  status: string;
  roomId: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: Date | string;
  isOrderSpecific?: boolean; // true for order-specific chats, false for general chats
}

export default function PatientChatCenter() {
  const { user } = useAuth();
  const patientId = user?.id || user?._id || (user as any)?.userId;
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Check for orderId in URL or sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId') || sessionStorage.getItem('selectedChatOrderId');
    if (orderId && chatSessions.length > 0) {
      const chat = chatSessions.find(s => s.medicalRequestId === orderId);
      if (chat) {
        setSelectedChat(chat);
        sessionStorage.removeItem('selectedChatOrderId');
      }
    }
  }, [chatSessions]);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    
    fetchChatSessions();
    const cleanup = setupSocketIO();

    return () => {
      if (cleanup) cleanup();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [patientId]);

  useEffect(() => {
    if (selectedChat && patientId && socketRef.current && socketRef.current.connected) {
      fetchChatHistory(selectedChat);
      
      // Join unified rooms
      if (selectedChat.isOrderSpecific && selectedChat.medicalRequestId) {
        // Join order-specific room
        socketRef.current.emit('joinOrderRoom', selectedChat.medicalRequestId);
      }
      console.log('👤 PatientChatCenter: Joined unified rooms');
    }
  }, [selectedChat, patientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSessions = async () => {
    try {
      if (!patientId) {
        console.error('👤 PatientChatCenter: No patientId available');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('👤 PatientChatCenter: No auth token');
        setLoading(false);
        return;
      }

      console.log('👤 PatientChatCenter: Fetching chat sessions for patient:', patientId);
      
      // Fetch medication requests for this patient (order-specific chats)
      const requestsResponse = await fetch(`${API_BASE_URL}/medication-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!requestsResponse.ok) {
        throw new Error(`HTTP ${requestsResponse.status}: ${requestsResponse.statusText}`);
      }

      const requestsData = await requestsResponse.json();
      console.log('👤 PatientChatCenter: Requests API Response:', requestsData);
      
      const sessions: ChatSession[] = [];
      
      if (requestsData.success) {
        const requests = requestsData.requests || requestsData.data || [];
        console.log(`👤 PatientChatCenter: Found ${requests.length} order-specific requests`);
        
        // Add order-specific chat sessions
        requests.forEach((req: any) => {
          const pharmacyId = req.pharmacyID || req.pharmacy?._id;
          const pharmacyName = req.pharmacy?.name || req.pharmacyName || 'Pharmacy';
          const roomId = `pharmacy_${pharmacyId}_request_${req._id}`;
          sessions.push({
            _id: req._id,
            medicalRequestId: req._id,
            requestId: req.requestId || req._id,
            pharmacyName: pharmacyName,
            pharmacyId: pharmacyId,
            status: req.status || 'pending',
            roomId: roomId,
            isOrderSpecific: true // Flag to identify order-specific chats
          });
        });
      }

      // Fetch general patient chats (not order-specific)
      // Get unique pharmacy IDs from all messages with this patient
      try {
        // Fetch all chats where this patient is involved
        const generalChatsResponse = await fetch(`${API_BASE_URL}/chats?patientId=${patientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (generalChatsResponse.ok) {
          const generalChatsData = await generalChatsResponse.json();
          if (generalChatsData.success) {
            // Extract unique pharmacy IDs from general chats (messages without orderId)
            const generalMessages = generalChatsData.messages || [];
            const uniquePharmacies = new Map<string, any>();
            
            generalMessages.forEach((msg: any) => {
              // Include messages without orderId/medicalRequestId (general chats)
              const msgPharmacyId = msg.pharmacyId?.toString();
              const msgPatientId = msg.patientId?.toString() || 
                                  (msg.senderRole === 'patient' ? msg.senderId?._id?.toString() || msg.senderId?.toString() : null) ||
                                  (msg.receiverRole === 'patient' ? msg.receiverId?._id?.toString() || msg.receiverId?.toString() : null);
              
              if (msgPharmacyId && msgPatientId === patientId.toString() && 
                  !msg.orderId && !msg.medicalRequestId && !msg.requestId) {
                if (!uniquePharmacies.has(msgPharmacyId)) {
                  uniquePharmacies.set(msgPharmacyId, {
                    pharmacyId: msgPharmacyId,
                    pharmacyName: (msg.senderRole === 'pharmacy' ? msg.senderId?.name : msg.receiverId?.name) || 
                                 msg.senderName || 
                                 msg.receiverName || 
                                 'Pharmacy',
                    lastMessage: msg.message,
                    lastMessageTime: msg.createdAt || msg.timestamp
                  });
                }
              }
            });

            // Add general chat sessions (only if pharmacy doesn't already have an order-specific chat)
            uniquePharmacies.forEach((pharmacyInfo, pharmacyId) => {
              const hasOrderChat = sessions.some(s => s.pharmacyId === pharmacyId);
              if (!hasOrderChat) {
                const roomId = [patientId, pharmacyId].sort().join('_');
                sessions.push({
                  _id: `general_${pharmacyId}`,
                  medicalRequestId: '',
                  requestId: '',
                  pharmacyName: pharmacyInfo.pharmacyName,
                  pharmacyId: pharmacyId,
                  status: 'general',
                  roomId: roomId,
                  isOrderSpecific: false, // Flag for general chats
                  lastMessage: pharmacyInfo.lastMessage,
                  lastMessageTime: pharmacyInfo.lastMessageTime
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn('👤 PatientChatCenter: Error fetching general chats:', error);
        // Continue with order-specific chats only
      }
      
      setChatSessions(sessions);
    } catch (error: any) {
      console.error('👤 PatientChatCenter: Error fetching chat sessions:', error);
      toast.error('Failed to load chat sessions: ' + (error.message || 'Unknown error'));
      setChatSessions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (chatSession: ChatSession) => {
    try {
      const token = localStorage.getItem('authToken');
      let response;
      
      // Use unified endpoint
      if (chatSession.isOrderSpecific && chatSession.medicalRequestId) {
        // Order-specific: GET /api/chats?medicalRequestId=X
        response = await fetch(`${API_BASE_URL}/chats?medicalRequestId=${chatSession.medicalRequestId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // General chat: GET /api/chats?pharmacyId=X&patientId=Y
        response = await fetch(`${API_BASE_URL}/chats?pharmacyId=${chatSession.pharmacyId}&patientId=${patientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      const data = await response.json();
      if (data.success) {
        const messagesData = (data.messages || data.data || []).sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
          const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
          return dateA - dateB;
        });
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    }
  };

  const setupSocketIO = () => {
    if (!patientId) return;
    
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
      console.log('👤 PatientChatCenter: Socket.IO connected');
      setIsConnected(true);
      if (patientId) {
        socketRef.current?.emit('authenticate', patientId);
        socketRef.current?.emit('joinPatientRoom', patientId);
        console.log('👤 PatientChatCenter: Authenticated and joined patient room');
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('👤 PatientChatCenter: Socket.IO disconnected');
      setIsConnected(false);
    });

    // Listen for new messages - Filter by orderId (medicalRequestId) or pharmacyId (general chat)
    const handleNewMessage = (message: any) => {
      console.log('👤 PatientChatCenter: New message received:', message);
      if (!selectedChat || !patientId) {
        // Still update chat sessions even if no chat selected
        fetchChatSessions();
        return;
      }
      
      // Normalize IDs to strings for comparison
      const msgPharmacyId = message.pharmacyId?.toString();
      const msgPatientId = message.patientId?.toString() || message.receiverId?.toString() || message.senderId?.toString();
      const msgOrderId = message.medicalRequestId?.toString() || message.requestId?.toString() || message.orderId?.toString();
      const msgRoomId = message.roomId?.toString();
      const currentPharmacyId = selectedChat.pharmacyId?.toString();
      const currentPatientId = patientId.toString();
      const currentOrderId = selectedChat.medicalRequestId?.toString();
      const currentRoomId = selectedChat.roomId?.toString();
      
      // Check if message is for this pharmacy
      const isPharmacyMatch = msgPharmacyId === currentPharmacyId || 
                              message.receiverId?.toString() === currentPharmacyId ||
                              message.senderId?.toString() === currentPharmacyId;
      
      // Check if message is for this patient
      const isPatientMatch = msgPatientId === currentPatientId || 
                            message.receiverId?.toString() === currentPatientId ||
                            message.senderId?.toString() === currentPatientId;
      
      // Check room match
      const isRoomMatch = msgRoomId === currentRoomId;
      
      // For order-specific chats, match by orderId
      // For general chats, match by pharmacyId and patientId and no orderId
      let shouldDisplay = false;
      
      if (selectedChat.isOrderSpecific) {
        // Order-specific: must match orderId AND pharmacy AND patient
        shouldDisplay = isPharmacyMatch && isPatientMatch && 
                       (msgOrderId === currentOrderId || isRoomMatch);
      } else {
        // General chat: must match pharmacy AND patient AND no orderId
        shouldDisplay = isPharmacyMatch && isPatientMatch && 
                       !msgOrderId && !message.medicalRequestId && !message.requestId && !message.orderId;
      }
      
      if (shouldDisplay) {
        console.log('👤 PatientChatCenter: Message matches current chat, adding to UI');
        setMessages(prev => {
          // Remove any optimistic temp messages for this message
          const filteredPrev = prev.filter(m => {
            // Remove temp messages that match this real message content
            if (m._id?.toString().startsWith('temp_')) {
              return !(m.message === message.message && 
                       (m.senderRole === message.senderRole || 
                        (m.senderRole === 'patient' && message.senderRole === 'patient') ||
                        (m.senderRole === 'pharmacy' && message.senderRole === 'pharmacy')));
            }
            return true;
          });
          
          // Check if real message already exists
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
      } else {
        console.log('👤 PatientChatCenter: Message does not match current chat, skipping');
      }
      
      // Always update chat sessions to show new messages in list
      fetchChatSessions();
    };

    // Only listen for unified newMessage event
    socketRef.current.on('newMessage', handleNewMessage);
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage', handleNewMessage);
      }
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const optimisticMessage: Message = {
      _id: `temp_${Date.now()}`,
      message: messageText,
      senderRole: 'patient',
      senderName: user?.name || 'Patient',
      timestamp: new Date(),
      createdAt: new Date()
    };
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      if (socketRef.current && socketRef.current.connected) {
        // Use unified patientToPharmacyMessage event
        socketRef.current.emit('patientToPharmacyMessage', {
          pharmacyId: selectedChat.pharmacyId,
          message: messageText,
          medicalRequestId: selectedChat.isOrderSpecific ? selectedChat.medicalRequestId : undefined,
          orderId: selectedChat.isOrderSpecific ? selectedChat.medicalRequestId : undefined
          // No medicalRequestId for general chats
        });
        
        // Don't remove optimistic message - let socket handler replace it with real message
        // The socket handler will add the real message and we'll rely on deduplication
        
        // Refresh chat sessions after a short delay to pick up new chats
        setTimeout(() => {
          fetchChatSessions();
        }, 500);
      } else {
        // Fallback to HTTP API - use unified endpoint
        const token = localStorage.getItem('authToken');
        const requestBody: any = {
          pharmacyId: selectedChat.pharmacyId,
          patientId: patientId,
          message: messageText
        };
        
        // Include medicalRequestId only for order-specific chats
        if (selectedChat.isOrderSpecific && selectedChat.medicalRequestId) {
          requestBody.medicalRequestId = selectedChat.medicalRequestId;
        }
        
        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        if (data.success) {
          setMessages(prev => {
            // Remove optimistic temp messages and add real message
            const filtered = prev.filter(m => {
              if (m._id?.toString().startsWith('temp_')) {
                // Remove temp messages that match this real message content
                const realMsg = data.data || data.message;
                return !(m.message === realMsg.message && 
                         m.senderRole === realMsg.senderRole);
              }
              return true;
            });
            
            // Check if message already exists
            const realMsg = data.data || data.message;
            if (!filtered.some(m => {
              const mId = m._id?.toString() || m._id;
              const msgId = realMsg._id?.toString() || realMsg._id;
              return mId === msgId;
            })) {
              return [...filtered, realMsg];
            }
            return filtered;
          });
          scrollToBottom();
          
          // Refresh chat sessions to pick up new chats
          fetchChatSessions();
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      }
    } catch (error: any) {
      // Only remove optimistic message on error
      setMessages(prev => {
        const filtered = prev.filter(m => !m._id.toString().startsWith('temp_'));
        return filtered;
      });
      toast.error('Failed to send message: ' + error.message);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'awaiting-payment': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading chat sessions...</p>
        </div>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Patient ID not found</p>
          <p className="text-sm text-gray-500">Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Chat List Sidebar */}
        <Card className="w-80 flex-shrink-0 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Chat Sessions</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {chatSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No active chats</p>
            </div>
          ) : (
            <div className="divide-y">
              {chatSessions.map((session) => (
                <div
                  key={session._id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedChat?._id === session._id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                  onClick={() => setSelectedChat(session)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {session.pharmacyName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm truncate">{session.pharmacyName}</p>
                        <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {session.isOrderSpecific ? `Request #${session.requestId.slice(-8)}` : 'General Chat'}
                      </p>
                      {session.lastMessage && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {session.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {selectedChat.pharmacyName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedChat.pharmacyName}</CardTitle>
                    <p className="text-xs text-gray-500">
                      {selectedChat.isOrderSpecific ? `Request #${selectedChat.requestId.slice(-8)}` : 'General Chat'}
                    </p>
                  </div>
                </div>
                {isConnected && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages area - WhatsApp style */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isPatient = message.senderRole === 'patient';
                    const timestamp = formatTime(message.timestamp || message.createdAt);
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isPatient ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isPatient
                                ? 'bg-green-500 text-white rounded-tr-none'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'
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

              {/* Input area - fixed at bottom */}
              <form onSubmit={sendMessage} className="border-t p-3 bg-white dark:bg-gray-800">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a chat session to start messaging</p>
            </div>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}

