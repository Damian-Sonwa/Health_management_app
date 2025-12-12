import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

interface Message {
  _id: string;
  message: string;
  senderRole: 'patient' | 'pharmacy';
  senderName: string;
  timestamp: Date | string;
  createdAt: Date | string;
}

interface RequestChatProps {
  medicalRequestId: string;
  pharmacyId: string;
  patientId: string;
  onClose?: () => void;
}

export default function RequestChat({ medicalRequestId, pharmacyId, patientId, onClose }: RequestChatProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Generate room ID
  const roomId = `pharmacy_${pharmacyId}_request_${medicalRequestId}`;

  useEffect(() => {
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
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
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
      console.log('💬 RequestChat: Socket.IO connected');
      setIsConnected(true);
      
      const userId = user?.id || user?._id;
      if (userId) {
        socketRef.current?.emit('authenticate', userId);
      }
      
      // Join pharmacy chat room
      socketRef.current?.emit('joinPharmacyChatRoom', {
        roomId: roomId,
        pharmacyId: pharmacyId,
        medicalRequestId: medicalRequestId
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('💬 RequestChat: Socket.IO disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('pharmacy-chat-room-joined', ({ roomId: joinedRoomId }) => {
      console.log(`💬 RequestChat: Joined room ${joinedRoomId}`);
    });

    // Listen for new messages
    socketRef.current.on('newMessage', (message: any) => {
      console.log('💬 RequestChat: New message received:', message);
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
      scrollToBottom();
    });

    socketRef.current.on('chat-error', (error: any) => {
      console.error('💬 RequestChat: Chat error:', error);
      toast.error(error.message || 'Chat error occurred');
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const optimisticMessage: Message = {
      _id: `temp_${Date.now()}`,
      message: messageText,
      senderRole: 'patient',
      senderName: user?.name || 'You',
      timestamp: new Date(),
      createdAt: new Date()
    };
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('patientSendMessage', {
          roomId: roomId,
          message: messageText,
          pharmacyId: pharmacyId,
          medicalRequestId: medicalRequestId,
          patientId: patientId
        });
        
        // Remove optimistic message after a delay (will be replaced by real one)
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
            roomId: roomId,
            receiverId: pharmacyId,
            receiverModel: 'User',
            message: messageText,
            senderName: user?.name || 'Patient',
            requestId: medicalRequestId,
            pharmacyId: pharmacyId,
            patientId: patientId,
            medicalRequestId: medicalRequestId,
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

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <CardTitle className="text-lg">Pharmacy Chat</CardTitle>
            {isConnected && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Online
              </span>
            )}
          </div>
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
    </Card>
  );
}

