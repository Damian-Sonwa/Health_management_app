import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Phone,
  Video,
  MessageCircle,
  Search,
  User,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import LiveChat from './LiveChat';
import CallInterface from './CallInterface';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ChatSession {
  _id: string;
  roomId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  requestId?: string;
}

export default function CallChatCenterPage() {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [callType, setCallType] = useState<'phone' | 'video'>('phone');

  // Safety check - ensure component always renders
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please log in to view call & chat center</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchChatSessions();
    
    // Listen for refresh events
    const handleRefresh = () => {
      fetchChatSessions();
    };
    window.addEventListener('refreshChats', handleRefresh);
    
    const interval = setInterval(fetchChatSessions, 30000); // Poll every 30 seconds
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshChats', handleRefresh);
    };
  }, [user?.id, user?._id, (user as any)?.userId]);

  // Listen for real-time chat messages via Socket.IO
  useEffect(() => {
      const pharmacyId = user?.id || user?._id || (user as any)?.userId;
      if (!pharmacyId) return;

      // Import Socket.IO dynamically to avoid SSR issues
      let socket: any = null;
      
      import('socket.io-client').then(({ default: io }) => {
        const getSocketUrl = () => {
          const apiUrl = API_BASE_URL.replace('/api', '');
          if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
            return 'http://localhost:5001';
          }
          return apiUrl.replace('https://', 'https://').replace('http://', 'http://');
        };

        const socketUrl = getSocketUrl();
        console.log('🔵 CallChatCenterPage: Connecting to Socket.IO at', socketUrl);
        
        socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        });

      socket.on('connect', () => {
        console.log('🔵 CallChatCenterPage: Socket.IO connected');
        socket.emit('authenticate', pharmacyId);
        socket.emit('joinPharmacyRoom', pharmacyId);
      });

      // Listen for new pharmacy chat messages
      socket.on('pharmacy-chat-message', (message: any) => {
        console.log('🔵 CallChatCenterPage: New message received', message);
        // Refresh chat sessions to show updated last message
        fetchChatSessions();
      });

      socket.on('chat-error', (error: any) => {
        console.error('🔵 CallChatCenterPage: Socket.IO error', error);
      });

      socket.on('disconnect', () => {
        console.log('🔵 CallChatCenterPage: Socket.IO disconnected');
      });
    }).catch((error) => {
      console.error('Failed to load Socket.IO:', error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.id, user?._id, (user as any)?.userId]);

  const fetchChatSessions = async () => {
    try {
      console.log('🔵 CallChatCenterPage: Fetching chat sessions...');
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const pharmacyId = user?.id || user?._id || (user as any)?.userId;
      if (!pharmacyId) {
        console.warn('CallChatCenterPage: User not authenticated');
        setLoading(false);
        setChatSessions([]);
        return;
      }

      // Fetch actual chat sessions from the new endpoint
      console.log(`🔵 CallChatCenterPage: Fetching from ${API_BASE_URL}/pharmacies/${pharmacyId}/chats`);
      const response = await fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Group chats by patient to create sessions
        const chatMap = new Map<string, ChatSession>();
        
        (data.chats || []).forEach((chat: any) => {
          const patientId = chat.patient?._id || chat.patientId || 
            (chat.senderType === 'patient' ? chat.senderId : chat.receiverId);
          const patientName = chat.patient?.name || 'Unknown Patient';
          const patientPhone = chat.patient?.phone || '';
          const roomId = chat.roomId || `pharmacy_${pharmacyId}_patient_${patientId}`;
          
          if (!chatMap.has(patientId)) {
            chatMap.set(patientId, {
              _id: roomId,
              roomId: roomId,
              patientId: patientId,
              patientName: patientName,
              patientPhone: patientPhone,
              lastMessage: chat.message,
              lastMessageTime: chat.createdAt,
              unreadCount: chat.senderType === 'patient' ? 1 : 0,
              requestId: chat.appointmentId || chat.requestId
            });
          } else {
            const session = chatMap.get(patientId)!;
            // Update with most recent message
            if (new Date(chat.createdAt) > new Date(session.lastMessageTime || 0)) {
              session.lastMessage = chat.message;
              session.lastMessageTime = chat.createdAt;
            }
            if (chat.senderType === 'patient') {
              session.unreadCount += 1;
            }
          }
        });
        
        const sessions: ChatSession[] = Array.from(chatMap.values()).sort((a, b) => {
          const timeA = new Date(a.lastMessageTime || 0).getTime();
          const timeB = new Date(b.lastMessageTime || 0).getTime();
          return timeB - timeA; // Most recent first
        });
          _id: session.roomId || session.patientId,
          roomId: session.roomId,
          patientId: session.patientId,
          patientName: session.patientName || 'Unknown Patient',
          patientPhone: session.patientPhone || '',
          lastMessage: session.lastMessage || 'Click to start conversation',
          lastMessageTime: session.lastMessageTime,
          unreadCount: session.unreadCount || 0,
          requestId: session.requestId
        }));

        console.log(`🔵 CallChatCenterPage: Loaded ${sessions.length} chat sessions`);
        setChatSessions(sessions);
      } else {
        throw new Error(data.message || 'Failed to fetch chat sessions');
      }
    } catch (error: any) {
      console.error('❌ Error fetching chat sessions:', error);
      const errorMessage = error?.message || 'Unknown error';
      // Don't show toast on initial load to avoid spam
      if (chatSessions.length === 0) {
        console.warn('⚠️ Failed to load chat sessions:', errorMessage);
      } else {
        toast.error('Failed to load chat sessions: ' + errorMessage);
      }
      setChatSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (session: ChatSession) => {
    setSelectedChat(session);
    setShowChat(true);
  };

  const handleStartCall = (session: ChatSession, type: 'phone' | 'video') => {
    setSelectedChat(session);
    setCallType(type);
    if (type === 'phone') {
      setShowCall(true);
    } else {
      setShowVideo(true);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredSessions = chatSessions.filter(session =>
    session.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.patientPhone.includes(searchQuery)
  );

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

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Call & Chat Center</h2>
        <p className="text-gray-600 text-sm">
          Manage patient communications through calls and chat
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by patient name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 font-medium">No active chat sessions</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Chat sessions will appear here when patients contact you'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredSessions.map((session) => (
            <Card key={session._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                        {session.patientName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {session.patientName}
                        </h3>
                        {session.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {session.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {session.patientPhone || 'No phone number'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatTime(session.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartCall(session, 'phone')}
                      disabled={!session.patientPhone}
                      title="Call Patient"
                      className="flex-1 sm:flex-initial"
                    >
                      <Phone className="w-4 h-4 sm:mr-0" />
                      <span className="ml-1 sm:hidden">Call</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartCall(session, 'video')}
                      disabled={!session.patientPhone}
                      title="Video Call"
                      className="flex-1 sm:flex-initial"
                    >
                      <Video className="w-4 h-4 sm:mr-0" />
                      <span className="ml-1 sm:hidden">Video</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartChat(session)}
                      title="Start Chat"
                      className="flex-1 sm:flex-initial"
                    >
                      <MessageCircle className="w-4 h-4 sm:mr-2" />
                      <span className="sm:inline">Chat</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Dialog */}
      {showChat && selectedChat && (
        <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="max-w-2xl h-[600px] p-0 flex flex-col">
            <LiveChat
              requestId={selectedChat.requestId || selectedChat._id}
              patientId={selectedChat.patientId}
              patientName={selectedChat.patientName}
              onClose={() => setShowChat(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Call Dialog */}
      {showCall && selectedChat && (
        <Dialog open={showCall} onOpenChange={setShowCall}>
          <DialogContent className="max-w-2xl p-0">
            <CallInterface
              requestId={selectedChat.requestId || selectedChat._id}
              patientId={selectedChat.patientId}
              patientName={selectedChat.patientName}
              patientPhone={selectedChat.patientPhone}
              onEndCall={() => setShowCall(false)}
              callType="phone"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Video Call Dialog */}
      {showVideo && selectedChat && (
        <Dialog open={showVideo} onOpenChange={setShowVideo}>
          <DialogContent className="max-w-4xl p-0 bg-black">
            <CallInterface
              requestId={selectedChat.requestId || selectedChat._id}
              patientId={selectedChat.patientId}
              patientName={selectedChat.patientName}
              patientPhone={selectedChat.patientPhone}
              onEndCall={() => setShowVideo(false)}
              callType="video"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

