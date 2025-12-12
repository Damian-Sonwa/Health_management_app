import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
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
  patientName: string;
  patientId: string;
  status: string;
  roomId: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: Date | string;
  isOrderSpecific?: boolean; // true for order-specific chats, false for general chats
}

export default function PharmacyChatCenter() {
  const { user } = useAuth();
  const pharmacyId = user?.id || user?._id || (user as any)?.userId;
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Check for requestId in URL or sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId') || sessionStorage.getItem('selectedChatRequestId');
    if (requestId && chatSessions.length > 0) {
      const chat = chatSessions.find(s => s.medicalRequestId === requestId);
      if (chat) {
        setSelectedChat(chat);
        sessionStorage.removeItem('selectedChatRequestId');
      }
    }
  }, [chatSessions]);

  useEffect(() => {
    if (!pharmacyId) {
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
  }, [pharmacyId]);

  useEffect(() => {
    if (selectedChat && pharmacyId && socketRef.current && socketRef.current.connected) {
      fetchChatHistory(selectedChat);
      
      // Always join the roomId for direct room messages
      socketRef.current.emit('join-chat-room', { roomId: selectedChat.roomId });
      console.log('💊 PharmacyChatCenter: Joined chat room:', selectedChat.roomId);
      
      if (selectedChat.isOrderSpecific) {
        joinChatRoom(selectedChat.roomId, selectedChat.medicalRequestId);
      }
    }
  }, [selectedChat, pharmacyId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSessions = async () => {
    try {
      if (!pharmacyId) {
        console.error('💊 PharmacyChatCenter: No pharmacyId available');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('💊 PharmacyChatCenter: No auth token');
        setLoading(false);
        return;
      }

      console.log('💊 PharmacyChatCenter: Fetching chat sessions for pharmacy:', pharmacyId);
      
      // Fetch medication requests for this pharmacy (order-specific chats)
      const requestsResponse = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!requestsResponse.ok) {
        throw new Error(`HTTP ${requestsResponse.status}: ${requestsResponse.statusText}`);
      }

      const requestsData = await requestsResponse.json();
      console.log('💊 PharmacyChatCenter: Requests API Response:', requestsData);
      
      const sessions: ChatSession[] = [];
      
      if (requestsData.success) {
        const requests = requestsData.requests || requestsData.data || [];
        console.log(`💊 PharmacyChatCenter: Found ${requests.length} order-specific requests`);
        
        // Add order-specific chat sessions
        requests.forEach((req: any) => {
          const patientInfo = req.patientInfo || {};
          const roomId = `pharmacy_${pharmacyId}_request_${req._id}`;
          sessions.push({
            _id: req._id,
            medicalRequestId: req._id,
            requestId: req.requestId || req._id,
            patientName: patientInfo.name || 'Unknown Patient',
            patientId: req.userId?.toString() || req.userId,
            status: req.status || 'pending',
            roomId: roomId,
            isOrderSpecific: true // Flag to identify order-specific chats
          });
        });
      }

      // Fetch general patient chats (not order-specific)
      // Get unique patient IDs from all messages with this pharmacy
      try {
        const generalChatsResponse = await fetch(`${API_BASE_URL}/chats/messages?pharmacyId=${pharmacyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (generalChatsResponse.ok) {
          const generalChatsData = await generalChatsResponse.json();
          if (generalChatsData.success) {
            // Extract unique patient IDs from general chats (messages without orderId)
            const generalMessages = generalChatsData.messages || [];
            const uniquePatients = new Map<string, any>();
            
            generalMessages.forEach((msg: any) => {
              // Include messages without orderId/medicalRequestId (general chats)
              // Also handle messages where pharmacy is sender or receiver
              const msgPharmacyId = msg.pharmacyId?.toString() || 
                                    (msg.senderRole === 'pharmacy' ? msg.senderId?._id?.toString() || msg.senderId?.toString() : null) ||
                                    (msg.receiverRole === 'pharmacy' ? msg.receiverId?._id?.toString() || msg.receiverId?.toString() : null);
              const msgPatientId = msg.patientId?.toString() || 
                                  (msg.senderRole === 'patient' ? msg.senderId?._id?.toString() || msg.senderId?.toString() : null) ||
                                  (msg.receiverRole === 'patient' ? msg.receiverId?._id?.toString() || msg.receiverId?.toString() : null);
              
              if (msgPatientId && msgPharmacyId === pharmacyId.toString() && 
                  !msg.orderId && !msg.medicalRequestId && !msg.requestId) {
                if (!uniquePatients.has(msgPatientId)) {
                  uniquePatients.set(msgPatientId, {
                    patientId: msgPatientId,
                    patientName: (msg.senderRole === 'patient' ? msg.senderId?.name : msg.receiverId?.name) || 
                                msg.senderName || 
                                msg.receiverName || 
                                'Patient',
                    lastMessage: msg.message,
                    lastMessageTime: msg.createdAt || msg.timestamp
                  });
                }
              }
            });

            // Add general chat sessions (only if patient doesn't already have an order-specific chat)
            uniquePatients.forEach((patientInfo, patientId) => {
              const hasOrderChat = sessions.some(s => s.patientId === patientId);
              if (!hasOrderChat) {
                const roomId = [patientId, pharmacyId].sort().join('_');
                sessions.push({
                  _id: `general_${patientId}`,
                  medicalRequestId: '',
                  requestId: '',
                  patientName: patientInfo.patientName,
                  patientId: patientId,
                  status: 'general',
                  roomId: roomId,
                  isOrderSpecific: false, // Flag for general chats
                  lastMessage: patientInfo.lastMessage,
                  lastMessageTime: patientInfo.lastMessageTime
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn('💊 PharmacyChatCenter: Error fetching general chats:', error);
        // Continue with order-specific chats only
      }
      
      setChatSessions(sessions);
    } catch (error: any) {
      console.error('💊 PharmacyChatCenter: Error fetching chat sessions:', error);
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
      
      // If it's an order-specific chat, use the orderId endpoint
      if (chatSession.isOrderSpecific && chatSession.medicalRequestId) {
        response = await fetch(`${API_BASE_URL}/chats/history/${chatSession.medicalRequestId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // If it's a general chat, use pharmacyId + patientId endpoint
        response = await fetch(`${API_BASE_URL}/chats/messages?pharmacyId=${pharmacyId}&patientId=${chatSession.patientId}`, {
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
    if (!pharmacyId) return;
    
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
      console.log('💊 PharmacyChatCenter: Socket.IO connected');
      setIsConnected(true);
      
      if (pharmacyId) {
        socketRef.current?.emit('authenticate', pharmacyId);
        socketRef.current?.emit('joinPharmacyRoom', pharmacyId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('💊 PharmacyChatCenter: Socket.IO disconnected');
      setIsConnected(false);
    });

        // Listen for new messages - Filter by orderId (medicalRequestId) or patientId (general chat)
        const handleNewMessage = (message: any) => {
          console.log('💊 PharmacyChatCenter: New message received:', message);
          if (selectedChat && pharmacyId) {
            // Check if message is for this pharmacy-patient pair
            const isPharmacyMatch = message.pharmacyId === pharmacyId || 
                                    message.receiverId === pharmacyId ||
                                    message.senderId === pharmacyId;
            const isPatientMatch = message.patientId === selectedChat.patientId || 
                                  message.receiverId === selectedChat.patientId ||
                                  message.senderId === selectedChat.patientId;
            
            if (!isPharmacyMatch || !isPatientMatch) {
              return; // Not for this chat
            }
            
            // For order-specific chats, match by orderId/medicalRequestId
            // For general chats, match by patientId and ensure no orderId
            const isOrderMatch = selectedChat.isOrderSpecific && 
              (message.medicalRequestId === selectedChat.medicalRequestId || 
               message.requestId === selectedChat.medicalRequestId ||
               message.orderId === selectedChat.medicalRequestId);
            
            const isGeneralMatch = !selectedChat.isOrderSpecific && 
              !message.orderId && !message.medicalRequestId && !message.requestId;
            
            if (isOrderMatch || isGeneralMatch) {
              setMessages(prev => {
                // Remove any optimistic temp messages for this message
                const filteredPrev = prev.filter(m => {
                  // Remove temp messages that match this real message content
                  if (m._id?.toString().startsWith('temp_')) {
                    return !(m.message === message.message && 
                             m.senderRole === message.senderRole);
                  }
                  return true;
                });
                
                // Check if real message already exists
                if (filteredPrev.some(m => {
                  const mId = m._id?.toString() || m._id;
                  const msgId = message._id?.toString() || message._id;
                  return mId === msgId;
                })) {
                  return filteredPrev;
                }
                
                return [...filteredPrev, message];
              });
              scrollToBottom();
            }
          }
          // Update chat sessions to show new message
          fetchChatSessions();
        };

    const handlePharmacyChatMessage = (data: any) => {
      console.log('💊 PharmacyChatCenter: New pharmacy chat message:', data);
      const message = data.message || data;
      if (selectedChat && pharmacyId) {
        // Check if message is for this pharmacy-patient pair
        const isPharmacyMatch = message.pharmacyId === pharmacyId || 
                                message.receiverId === pharmacyId ||
                                message.senderId === pharmacyId;
        const isPatientMatch = message.patientId === selectedChat.patientId || 
                              message.receiverId === selectedChat.patientId ||
                              message.senderId === selectedChat.patientId;
        
        if (!isPharmacyMatch || !isPatientMatch) {
          return; // Not for this chat
        }
        
        // For order-specific chats, match by orderId/medicalRequestId
        // For general chats, match by patientId and ensure no orderId
        const isOrderMatch = selectedChat.isOrderSpecific && 
          (data.medicalRequestId === selectedChat.medicalRequestId || 
           message.medicalRequestId === selectedChat.medicalRequestId ||
           data.orderId === selectedChat.medicalRequestId ||
           message.orderId === selectedChat.medicalRequestId);
        
        const isGeneralMatch = !selectedChat.isOrderSpecific && 
          !message.orderId && !message.medicalRequestId && !message.requestId &&
          !data.orderId && !data.medicalRequestId;
        
        if (isOrderMatch || isGeneralMatch) {
          setMessages(prev => {
            // Remove any optimistic temp messages for this message
            const filteredPrev = prev.filter(m => {
              // Remove temp messages that match this real message content
              if (m._id?.toString().startsWith('temp_')) {
                return !(m.message === message.message && 
                         m.senderRole === message.senderRole);
              }
              return true;
            });
            
            // Check if real message already exists
            if (filteredPrev.some(m => {
              const mId = m._id?.toString() || m._id;
              const msgId = message._id?.toString() || message._id;
              return mId === msgId;
            })) {
              return filteredPrev;
            }
            
            return [...filteredPrev, message];
          });
          scrollToBottom();
        }
      }
      fetchChatSessions();
    };

    socketRef.current.on('newMessage', handleNewMessage);
    socketRef.current.on('newPharmacyChatMessage', handlePharmacyChatMessage);
    socketRef.current.on('patientToPharmacyMessage', handlePharmacyChatMessage);
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage', handleNewMessage);
        socketRef.current.off('newPharmacyChatMessage', handlePharmacyChatMessage);
        socketRef.current.off('patientToPharmacyMessage', handlePharmacyChatMessage);
      }
    };
  };

  const joinChatRoom = (roomId: string, medicalRequestId: string) => {
    if (socketRef.current && socketRef.current.connected && pharmacyId) {
      // Use joinOrderChatRoom for consistency (also supports joinPharmacyChatRoom)
      socketRef.current.emit('joinOrderChatRoom', medicalRequestId);
      // Also emit joinPharmacyChatRoom for compatibility
      socketRef.current.emit('joinPharmacyChatRoom', {
        roomId: roomId,
        pharmacyId: pharmacyId,
        medicalRequestId: medicalRequestId
      });
    }
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
      senderRole: 'pharmacy',
      senderName: user?.name || 'Pharmacy',
      timestamp: new Date(),
      createdAt: new Date()
    };
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      if (socketRef.current && socketRef.current.connected) {
        // Use unified pharmacyToPatientMessage event
        // Include orderId only if it's an order-specific chat
        socketRef.current.emit('pharmacyToPatientMessage', {
          patientId: selectedChat.patientId,
          message: messageText,
          orderId: selectedChat.isOrderSpecific ? selectedChat.medicalRequestId : undefined,
          requestId: selectedChat.isOrderSpecific ? selectedChat.medicalRequestId : undefined,
          senderId: pharmacyId
        });
        
        // Don't remove optimistic message - let socket handler replace it with real message
        // The socket handler will add the real message and we'll rely on deduplication
        
        // Refresh chat sessions after a short delay to pick up new chats
        setTimeout(() => {
          fetchChatSessions();
        }, 500);
      } else {
        // Fallback to HTTP API
        const token = localStorage.getItem('authToken');
        const requestBody: any = {
          roomId: selectedChat.roomId,
          receiverId: selectedChat.patientId,
          receiverModel: 'User',
          message: messageText,
          senderName: user?.name || 'Pharmacy',
          pharmacyId: pharmacyId,
          patientId: selectedChat.patientId,
          senderRole: 'pharmacy'
        };
        
        // Only include order-specific fields if it's an order-specific chat
        if (selectedChat.isOrderSpecific) {
          requestBody.requestId = selectedChat.medicalRequestId;
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

  if (!pharmacyId) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Pharmacy ID not found</p>
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
                        {session.patientName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm truncate">{session.patientName}</p>
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
                      {selectedChat.patientName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedChat.patientName}</CardTitle>
                    <p className="text-xs text-gray-500">
                      Request #{selectedChat.requestId.slice(-8)}
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
                    const isPharmacy = message.senderRole === 'pharmacy';
                    const timestamp = formatTime(message.timestamp || message.createdAt);
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isPharmacy ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isPharmacy ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isPharmacy
                                ? 'bg-green-500 text-white rounded-tr-none'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'
                            }`}
                          >
                            <p className="text-sm break-words">{message.message}</p>
                          </div>
                          <p className={`text-xs mt-1 px-1 ${isPharmacy ? 'text-right text-gray-500' : 'text-left text-gray-400'}`}>
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

