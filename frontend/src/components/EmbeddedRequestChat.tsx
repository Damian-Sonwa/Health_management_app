import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  message: string;
  senderRole: 'patient' | 'pharmacy' | 'customer_care';
  senderName: string;
  timestamp: Date | string;
  createdAt: Date | string;
}

interface EmbeddedRequestChatProps {
  medicalRequestId: string;
  pharmacyId: string;
  patientId: string;
  pharmacyName?: string;
  requestStatus?: string;
}

export default function EmbeddedRequestChat({ 
  medicalRequestId, 
  pharmacyId, 
  patientId,
  pharmacyName,
  requestStatus
}: EmbeddedRequestChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Generate room ID
  const roomId = `pharmacy_${pharmacyId}_request_${medicalRequestId}`;

  useEffect(() => {
    if (!medicalRequestId || !pharmacyId) {
      setLoading(false);
      return;
    }

    fetchChatHistory();
    setupSocketIO();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [medicalRequestId, pharmacyId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/chats/history/${medicalRequestId}`, {
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
        setMessages(messagesData);
      } else {
        console.warn('No chat history found or error:', data.message);
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error fetching chat history:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketIO = () => {
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
      console.log('💬 EmbeddedRequestChat: Socket.IO connected');
      setIsConnected(true);
      if (user?.id) {
        socketRef.current?.emit('authenticate', user.id);
      }
      // Join the specific pharmacy-request chat room
      socketRef.current?.emit('joinPharmacyChatRoom', { 
        roomId, 
        pharmacyId, 
        medicalRequestId 
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('💬 EmbeddedRequestChat: Socket.IO disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('newMessage', (message: any) => {
      console.log('💬 EmbeddedRequestChat: New message received:', message);
      if (message.medicalRequestId === medicalRequestId) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();
      }
    });

    socketRef.current.on('newPharmacyChatMessage', (data: any) => {
      const message = data.message || data;
      if (message.medicalRequestId === medicalRequestId) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();
      }
    });

    socketRef.current.on('patientToPharmacyMessage', (message: any) => {
      if (message.medicalRequestId === medicalRequestId) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();
      }
    });

    socketRef.current.on('chat-error', (error: any) => {
      console.error('💬 EmbeddedRequestChat: Socket.IO error', error);
      toast.error('Chat error: ' + error.message);
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    const optimisticMessage: Message = {
      _id: `optimistic-${Date.now()}`,
      message: messageText,
      senderRole: 'patient',
      senderName: user.name || 'Patient',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('patientSendMessage', {
          roomId,
          message: messageText,
          pharmacyId,
          medicalRequestId,
          patientId: user.id,
          senderRole: 'patient'
        });
        
        // Remove optimistic message after a short delay (will be replaced by real message)
        setTimeout(() => {
          setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
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
            roomId: roomId,
            receiverId: pharmacyId,
            receiverModel: 'Pharmacy',
            message: messageText,
            senderName: user.name || 'Patient',
            requestId: medicalRequestId,
            pharmacyId: pharmacyId,
            patientId: user.id,
            medicalRequestId: medicalRequestId,
            senderRole: 'patient'
          })
        });

        const data = await response.json();
        if (data.success) {
          setMessages(prev => {
            const filtered = prev.filter(m => m._id !== optimisticMessage._id);
            return [...filtered, data.data || data.message];
          });
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      }
    } catch (error: any) {
      setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
      toast.error('Failed to send message: ' + error.message);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message: Message) => {
    return message.senderRole === 'patient';
  };

  const getSenderLabel = (message: Message) => {
    if (message.senderRole === 'patient') return 'You';
    if (message.senderRole === 'pharmacy') return pharmacyName || 'Pharmacy';
    if (message.senderRole === 'customer_care') return 'Customer Care';
    return message.senderName || 'Unknown';
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat Room
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              Chat Room
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              {pharmacyName || 'Pharmacy'} • Request #{medicalRequestId.slice(-8)}
            </p>
          </div>
          {isConnected ? (
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
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages area - WhatsApp style */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isMyMessage(message) ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isMyMessage(message)
                        ? 'bg-green-500 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-sm break-words">{message.message}</p>
                  </div>
                  <p className={`text-xs mt-1 px-1 ${isMyMessage(message) ? 'text-right text-gray-500' : 'text-left text-gray-400'}`}>
                    {getSenderLabel(message)} • {formatTime(message.timestamp || message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area - fixed at bottom */}
        <form onSubmit={sendMessage} className="border-t p-3 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-2 rounded-lg"
              disabled={!newMessage.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

