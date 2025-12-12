import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [chatRoomId]);

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
        
        // Extract chat partner name from messages
        if (messagesData.length > 0) {
          const userId = user?.id || user?._id;
          const partnerMessage = messagesData.find((msg: any) => {
            const senderId = msg.senderId?._id || msg.senderId?.id || msg.senderId;
            return senderId && senderId.toString() !== userId?.toString();
          });
          if (partnerMessage) {
            const partnerName = partnerMessage.senderId?.name || partnerMessage.senderName || 'Chat Partner';
            setChatPartnerName(partnerName);
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
          receiverId: chatRoomId.includes('_') ? chatRoomId.split('_').find(id => id !== (user?.id || user?._id)?.toString()) : chatRoomId,
          message: newMessage,
          senderName: user?.name || 'User'
        })
      });

      const data = await response.json();
      if (data.success || response.ok) {
        setNewMessage('');
        await fetchMessages();
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error: any) {
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
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderId === (user?.id || user?._id) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === (user?.id || user?._id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{message.senderName}</p>
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
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

