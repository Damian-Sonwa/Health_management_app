import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/components/AuthContext';
import { getAuthToken } from '@/utils/auth';

// Get API base URL based on environment
const getApiBase = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }
  return 'https://health-management-app-joj5.onrender.com/api';
};

// Get Socket.IO URL based on environment
const getSocketUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001';
  }
  return 'https://health-management-app-joj5.onrender.com';
};

const API_BASE = getApiBase();
const SOCKET_URL = getSocketUrl();

// Helper to get auth headers
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Types
export interface ChatMessage {
  _id: string;
  senderId: string;
  senderModel: 'User' | 'Doctor';
  receiverId: string;
  receiverModel: 'User' | 'Doctor';
  message: string;
  isRead: boolean;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

// API Functions
async function fetchChatHistory(doctorId: string): Promise<{ messages: ChatMessage[]; roomId: string }> {
  const response = await fetch(`${API_BASE}/chats/${doctorId}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to fetch chat history');
  
  const result = await response.json();
  return {
    messages: result.data || [],
    roomId: result.roomId
  };
}

async function sendMessage(data: { receiverId: string; message: string; receiverModel?: string }): Promise<ChatMessage> {
  const response = await fetch(`${API_BASE}/chats`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to send message');
  
  const result = await response.json();
  return result.data;
}

async function markAsRead(roomId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/chats/${roomId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to mark messages as read');
}

async function fetchUnreadCount(): Promise<number> {
  const response = await fetch(`${API_BASE}/chats/unread/count`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to fetch unread count');
  
  const result = await response.json();
  return result.data.unreadCount;
}

// Custom Hook
export function useChat(doctorId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  // Fetch chat history
  const {
    data: chatData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['chat-history', doctorId],
    queryFn: () => fetchChatHistory(doctorId!),
    enabled: !!doctorId,
    staleTime: 0,
    onSuccess: (data) => {
      setRoomId(data.roomId);
    }
  });

  const messages = chatData?.messages || [];

  // Fetch unread count
  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount
  } = useQuery({
    queryKey: ['unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 10000 // Poll every 10 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history', doctorId], refetchType: 'all' });
      refetchUnreadCount();
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history', doctorId], refetchType: 'all' });
      refetchUnreadCount();
    }
  });

  // Socket.IO setup
  useEffect(() => {
    if (!user?.id || !doctorId) return;

    // Initialize socket if not already connected
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      socketRef.current.on('connect', () => {
        console.log('💬 Chat socket connected');
        setIsConnected(true);
        
        // Authenticate
        socketRef.current?.emit('authenticate', user.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('💬 Chat socket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('chat-error', (error) => {
        console.error('💬 Chat error:', error);
      });
    }

    // Join chat room
    if (socketRef.current && doctorId) {
      socketRef.current.emit('join-chat-room', {
        userId: user.id,
        doctorId
      });

      socketRef.current.on('chat-room-joined', ({ roomId: joinedRoomId }) => {
        console.log(`💬 Joined chat room: ${joinedRoomId}`);
        setRoomId(joinedRoomId);
      });

      // Listen for new messages
      socketRef.current.on('new-message', (message: ChatMessage) => {
        console.log('💬 New message received:', message);
        queryClient.setQueryData(['chat-history', doctorId], (oldData: any) => {
          if (!oldData) return { messages: [message], roomId: message.roomId };
          return {
            ...oldData,
            messages: [...oldData.messages, message]
          };
        });
        refetchUnreadCount();
      });

      // Listen for typing indicators
      socketRef.current.on('user-typing', ({ userName }) => {
        console.log(`💬 ${userName} is typing...`);
        setIsTyping(true);
      });

      socketRef.current.on('user-stopped-typing', () => {
        setIsTyping(false);
      });
    }

    // Cleanup
    return () => {
      if (socketRef.current && roomId) {
        socketRef.current.emit('leave-chat-room', { roomId });
        socketRef.current.off('new-message');
        socketRef.current.off('user-typing');
        socketRef.current.off('user-stopped-typing');
        socketRef.current.off('chat-room-joined');
      }
    };
  }, [user?.id, doctorId, queryClient, roomId]);

  // Send message function (via Socket.IO)
  const sendChatMessage = useCallback((message: string) => {
    if (!socketRef.current || !doctorId || !user?.id) return;

    socketRef.current.emit('send-chat-message', {
      receiverId: doctorId,
      message,
      receiverModel: 'Doctor'
    });
  }, [doctorId, user?.id]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!socketRef.current || !roomId || !user?.name) return;
    socketRef.current.emit('typing-start', {
      roomId,
      userName: user.name
    });
  }, [roomId, user?.name]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('typing-stop', { roomId });
  }, [roomId]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(() => {
    if (!roomId) return;
    markAsReadMutation.mutate(roomId);
  }, [roomId, markAsReadMutation]);

  return {
    messages,
    isLoading,
    error,
    refetch,
    sendMessage: sendChatMessage,
    sendMessageHTTP: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    isConnected,
    isTyping,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    unreadCount,
    roomId
  };
}

