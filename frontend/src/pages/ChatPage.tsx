import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatPartnerName, setChatPartnerName] = useState<string>('Chat');
  const [chatPartnerRole, setChatPartnerRole] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Extract requestId from URL query params if present
  const searchParams = new URLSearchParams(window.location.search);
  const requestId = searchParams.get('requestId');

  useEffect(() => {
    if (!chatRoomId) {
      toast.error('Chat room ID is required');
      navigate('/appointments');
      return;
    }
    
    fetchMessages();
    
    // Set up Socket.IO for real-time updates
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
      console.log('💬 ChatPage: Socket.IO connected');
      setIsConnected(true);
      
      // Authenticate with user ID
      const userId = user?.id || user?._id;
      if (userId) {
        socketRef.current?.emit('authenticate', userId);
      }
      
      // Join the chat room
      if (chatRoomId) {
        socketRef.current?.emit('join-chat-room', {
          userId: userId,
          roomId: chatRoomId
        });
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('💬 ChatPage: Socket.IO disconnected');
      setIsConnected(false);
    });

    // Listen for new messages
    const handleNewMessage = (message: any) => {
      console.log('💬 ChatPage: New message received:', message);
      setMessages(prev => {
        // Remove any optimistic messages with same content
        const filtered = prev.filter(m => !(m.isOptimistic && m.message === message.message));
        
        // Avoid duplicates by _id
        if (filtered.some(m => {
          const mId = m._id?.toString() || m._id;
          const msgId = message._id?.toString() || message._id;
          return mId === msgId;
        })) {
          return filtered;
        }
        
        return [...filtered, message];
      });
      scrollToBottom();
    };
    
    socketRef.current.on('new-message', handleNewMessage);
    socketRef.current.on('pharmacy-chat-message', handleNewMessage);

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [chatRoomId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Check if chatRoomId looks like a roomId (contains underscore) or a user ID
      const isRoomId = chatRoomId && chatRoomId.includes('_');
      
      const endpoint = isRoomId 
        ? `${API_BASE_URL}/chats/room/${chatRoomId}`
        : `${API_BASE_URL}/chats/${chatRoomId}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        // Handle both 'messages' and 'data' response formats
        const messagesData = data.messages || data.data || [];
        setMessages(messagesData);
        
        // Extract chat partner name and role from messages
        if (messagesData.length > 0) {
          const userId = user?.id || user?._id;
          const partnerMessage = messagesData.find((msg: any) => {
            const senderId = msg.senderId?._id || msg.senderId?.id || msg.senderId;
            return senderId && senderId.toString() !== userId?.toString();
          });
          if (partnerMessage) {
            const partnerName = partnerMessage.senderId?.name || partnerMessage.senderName || 'Chat Partner';
            const partnerRole = partnerMessage.senderId?.role || '';
            setChatPartnerName(partnerName);
            setChatPartnerRole(partnerRole);
          }
        }
      } else {
        throw new Error(data.message || 'Failed to fetch messages');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    const userId = user?.id || user?._id;
    
    // Optimistically add message to UI immediately
    const optimisticMessage: any = {
      _id: `temp_${Date.now()}`,
      senderId: userId,
      senderName: user?.name || 'User',
      message: messageText,
      timestamp: new Date(),
      createdAt: new Date(),
      isOptimistic: true
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    scrollToBottom();

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: chatRoomId,
          receiverId: chatRoomId.includes('_') ? chatRoomId.split('_').find(id => id !== userId?.toString()) : chatRoomId,
          receiverModel: chatPartnerRole === 'pharmacy' ? 'Pharmacy' : 'Doctor', // Determine receiver model
          message: messageText,
          senderName: user?.name || 'User',
          requestId: requestId || undefined // Include requestId if present
        })
      });

      const data = await response.json();
      if (data.success || response.ok) {
        // Remove optimistic message and replace with real one
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isOptimistic);
          const realMessage = data.data || data.message || data;
          if (realMessage && realMessage._id) {
            // Check if message already exists (from Socket.IO)
            if (!filtered.some(m => m._id === realMessage._id)) {
              return [...filtered, realMessage];
            }
          }
          return filtered;
        });
        
        // Also fetch to ensure we have the latest
        setTimeout(() => fetchMessages(), 500);
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => !m.isOptimistic));
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error: any) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => !m.isOptimistic));
      toast.error('Failed to send message: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[calc(100vh-8rem)] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <CardTitle>{chatPartnerName}</CardTitle>
                {requestId && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Request #{requestId.slice(-6)})
                  </span>
                )}
                {isConnected && (
                  <span className="text-xs text-green-500 ml-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message: any) => {
                  const senderId = message.senderId?._id || message.senderId?.id || message.senderId;
                  const userId = user?.id || user?._id;
                  const isOwn = senderId && senderId.toString() === userId?.toString();
                  const timestamp = message.timestamp || message.createdAt || message.createdAt;
                  const messageId = message._id || `temp_${Date.now()}_${Math.random()}`;
                  
                  return (
                    <div
                      key={messageId}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                        } ${message.isOptimistic ? 'opacity-70' : ''}`}
                      >
                        {!isOwn && (
                          <p className="text-sm font-medium mb-1">{message.senderName || message.senderId?.name || 'User'}</p>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'opacity-70' : 'text-gray-500'}`}>
                          {timestamp ? new Date(timestamp).toLocaleTimeString() : 'Just now'}
                          {message.isOptimistic && <span className="ml-1">(sending...)</span>}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

