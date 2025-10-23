import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any;
}

interface Conversation {
  _id: string;
  userId: string;
  messages: Message[];
  totalMessages: number;
  lastInteraction: Date;
  conversationSummary?: string;
  userMood?: string;
}

// Fetch conversation history
const fetchConversation = async (): Promise<Conversation> => {
  const response = await fetch(`${API_BASE}/ai-chat/conversation`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch conversation');
  const result = await response.json();
  return result.data;
};

// Send message to AI
const sendMessage = async (message: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/ai-chat/message`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message })
  });

  if (!response.ok) throw new Error('Failed to send message');
  const result = await response.json();
  return result.data;
};

// Clear conversation
const clearConversation = async (): Promise<void> => {
  const response = await fetch(`${API_BASE}/ai-chat/conversation`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to clear conversation');
};

// Custom hook
export function useAIChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversation, isLoading, error } = useQuery<Conversation>({
    queryKey: ['aiChat', 'conversation', user?.userId],
    queryFn: fetchConversation,
    enabled: !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiChat', 'conversation'] });
    },
    onError: (err: any) => {
      toast.error('Failed to send message: ' + err.message);
    },
  });

  const clearConversationMutation = useMutation({
    mutationFn: clearConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiChat', 'conversation'] });
      toast.success('Conversation cleared');
    },
    onError: (err: any) => {
      toast.error('Failed to clear conversation: ' + err.message);
    },
  });

  return {
    conversation,
    messages: conversation?.messages || [],
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutateAsync,
    clearConversation: clearConversationMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    isClearing: clearConversationMutation.isPending,
  };
}

