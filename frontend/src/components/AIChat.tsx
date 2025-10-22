import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Sparkles, Trash2, Loader2, User } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

export default function AIChat() {
  const { user } = useAuth();
  const { messages, sendMessage, clearConversation, isSending, isClearing, isLoading } = useAIChat();
  const { progress } = useGamification();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const message = input.trim();
    setInput('');

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearConversation = async () => {
    if (window.confirm('Are you sure you want to clear the conversation history?')) {
      await clearConversation();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Health Coach AI
          </h1>
          <p className="text-gray-600 mt-1">Your personal health motivation companion</p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearConversation}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats Banner */}
      {progress && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="text-2xl font-bold">{progress.level}</p>
                <p className="text-sm text-purple-100">Level</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.totalPoints}</p>
                <p className="text-sm text-purple-100">Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.currentStreak}</p>
                <p className="text-sm text-purple-100">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Container */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Chat with Your Health Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-[500px] p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="w-16 h-16 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome, {user?.name}!</h3>
                <p className="text-gray-600 mb-4 max-w-md">
                  I'm your Health Coach AI. I'm here to motivate and support you on your health journey!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => setInput('How am I doing?')}
                    className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors"
                  >
                    💪 How am I doing?
                  </button>
                  <button
                    onClick={() => setInput('Give me motivation')}
                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors"
                  >
                    ✨ Give me motivation
                  </button>
                  <button
                    onClick={() => setInput('Tips for blood pressure')}
                    className="p-3 bg-red-50 hover:bg-red-100 rounded-lg text-sm text-red-700 transition-colors"
                  >
                    ❤️ Blood pressure tips
                  </button>
                  <button
                    onClick={() => setInput('Tips for blood glucose')}
                    className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm text-green-700 transition-colors"
                  >
                    🩸 Blood glucose tips
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message: any, index: number) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-gradient-to-r from-purple-50 to-pink-50 text-gray-800 border border-purple-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <p className="text-sm text-gray-600">Thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your health journey..."
                className="flex-1"
                disabled={isSending}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, or click the send button
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Prompts */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => setInput('Show my progress')}
                className="p-2 text-xs bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 transition-colors"
              >
                📊 My Progress
              </button>
              <button
                onClick={() => setInput('Motivate me')}
                className="p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
              >
                💪 Motivation
              </button>
              <button
                onClick={() => setInput('Health tips')}
                className="p-2 text-xs bg-green-50 hover:bg-green-100 rounded-lg text-green-700 transition-colors"
              >
                💡 Tips
              </button>
              <button
                onClick={() => setInput('My streak')}
                className="p-2 text-xs bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 transition-colors"
              >
                🔥 Streak Info
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

