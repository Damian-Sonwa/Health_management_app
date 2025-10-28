import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat, type ChatMessage } from '@/hooks/useChat';
import { useAuth } from '@/components/AuthContext';
import { Send, Loader2, Wifi, WifiOff } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string | null;
  doctorName?: string;
}

export function ChatBox({ isOpen, onClose, doctorId, doctorName }: ChatBoxProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTypingIndicator, setIsTypingIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    isSending,
    isConnected,
    isTyping,
    startTyping,
    stopTyping,
    markMessagesAsRead
  } = useChat(doctorId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when opening the chat
  useEffect(() => {
    if (isOpen && doctorId) {
      markMessagesAsRead();
    }
  }, [isOpen, doctorId, markMessagesAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !doctorId) return;

    try {
      sendMessage(message.trim());
      setMessage('');
      stopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing indicator
    if (value.trim()) {
      startTyping();
      setIsTypingIndicator(true);

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
        setIsTypingIndicator(false);
      }, 2000);
    } else {
      stopTyping();
      setIsTypingIndicator(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.createdAt);
      let dateLabel: string;
      
      if (isToday(date)) {
        dateLabel = 'Today';
      } else if (isYesterday(date)) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = format(date, 'MMMM d, yyyy');
      }
      
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(msg);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              Chat with {doctorName || 'Doctor'}
            </DialogTitle>
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <span className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  Disconnected
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(messageGroups).map(([dateLabel, msgs]) => (
                <div key={dateLabel}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                      {dateLabel}
                    </div>
                  </div>

                  {/* Messages */}
                  {msgs.map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <p className="text-sm break-words">{msg.message}</p>
                          </div>
                          <div
                            className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}
                          >
                            {formatMessageTime(msg.createdAt)}
                            {isOwn && msg.isRead && (
                              <span className="ml-1">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start mb-2">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending || !isConnected}
              className="flex-1"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={!message.trim() || isSending || !isConnected}
              size="icon"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          {isTypingIndicator && (
            <p className="text-xs text-gray-500 mt-1">You are typing...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

