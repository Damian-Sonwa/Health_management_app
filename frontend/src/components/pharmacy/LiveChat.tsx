import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Image as ImageIcon,
  Paperclip,
  Loader2,
  User,
  X,
  MessageCircle,
  Mic,
  File,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

interface ChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  senderName?: string;
  isRead: boolean;
  createdAt: string;
}

interface LiveChatProps {
  requestId?: string;
  patientId: string;
  patientName: string;
  onClose?: () => void;
}

export default function LiveChat({
  requestId,
  patientId,
  patientName,
  onClose
}: LiveChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate roomId (same logic as backend)
  const getRoomId = (userId1: string, userId2: string) => {
    const ids = [userId1, userId2].sort();
    return `${ids[0]}_${ids[1]}`;
  };

  const pharmacyId = user?.id || user?._id || (user as any)?.userId;
  const roomId = pharmacyId && patientId ? getRoomId(pharmacyId, patientId) : '';
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!roomId || !pharmacyId || !patientId) {
      setLoading(false);
      return;
    }

    fetchMessages();
    startPolling();
    setupSocketIO();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, patientId, pharmacyId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/chats/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
        // Mark messages as read
        if (data.data && data.data.length > 0) {
          markAsRead(data.roomId || roomId);
        }
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketIO = () => {
    if (!pharmacyId || !patientId) return;

    // Import Socket.IO dynamically
    import('socket.io-client').then(({ default: io }) => {
      const getSocketUrl = () => {
        const apiUrl = API_BASE_URL.replace('/api', '');
        if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
          return 'http://localhost:5001';
        }
        return apiUrl.replace('https://', 'https://').replace('http://', 'http://');
      };

      const socketUrl = getSocketUrl();
      console.log('💬 LiveChat: Connecting to Socket.IO at', socketUrl);
      
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socketRef.current.on('connect', () => {
        console.log('💬 LiveChat: Socket.IO connected');
        socketRef.current.emit('authenticate', pharmacyId);
      });

      socketRef.current.on('authenticated', () => {
        console.log('💬 LiveChat: Socket authenticated');
        // Join the chat room after authentication
        const isPharmacy = user?.role === 'pharmacy';
        if (isPharmacy) {
          socketRef.current.emit('joinPharmacyChatRoom', {
            pharmacyId: pharmacyId,
            patientId: patientId
          });
          console.log(`💬 LiveChat: Joined pharmacy chat room (pharmacy: ${pharmacyId}, patient: ${patientId})`);
        } else {
          // For patient, join regular chat room - send userId and doctorId/pharmacyId
          socketRef.current.emit('join-chat-room', { 
            userId: pharmacyId, 
            doctorId: patientId // In this context, patientId is the other party (pharmacy or doctor)
          });
          console.log(`💬 LiveChat: Joined chat room (user: ${pharmacyId}, other: ${patientId})`);
        }
        
        // Also join by roomId directly (some handlers support this)
        socketRef.current.emit('join-chat-room-by-id', { roomId });
      });

      // Listen for new messages in real-time
      const handleNewMessage = (message: ChatMessage) => {
        console.log('💬 LiveChat: New message received via Socket.IO', message);
        // Check if message is for this room
        const messageRoomId = message.roomId || getRoomId(message.senderId, message.receiverId);
        if (messageRoomId === roomId) {
          setMessages(prev => {
            // Avoid duplicates by checking _id
            const exists = prev.some(m => m._id === message._id || 
              (m.senderId === message.senderId && 
               m.receiverId === message.receiverId && 
               m.message === message.message && 
               Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000));
            if (exists) {
              console.log('💬 LiveChat: Message already exists, skipping');
              return prev;
            }
            console.log('💬 LiveChat: Adding new message to state');
            return [...prev, message];
          });
          scrollToBottom();
        } else {
          console.log(`💬 LiveChat: Message roomId (${messageRoomId}) doesn't match current roomId (${roomId})`);
        }
      };

      socketRef.current.on('pharmacy-chat-message', handleNewMessage);
      socketRef.current.on('new-message', handleNewMessage);

      socketRef.current.on('chat-error', (error: any) => {
        console.error('💬 LiveChat: Socket.IO error', error);
      });

      socketRef.current.on('disconnect', () => {
        console.log('💬 LiveChat: Socket.IO disconnected');
      });
    }).catch((error) => {
      console.error('💬 LiveChat: Failed to load Socket.IO', error);
    });
  };

  const startPolling = () => {
    // Poll for new messages every 5 seconds (as backup to Socket.IO)
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 5000);
  };

  const markAsRead = async (roomId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/chats/${roomId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (messageText?: string, fileUrl?: string, messageType: 'text' | 'image' | 'file' | 'voice' = 'text', fileName?: string, fileType?: string) => {
    const messageToSend = messageText || newMessage;
    if (!messageToSend.trim() && !fileUrl) return;

    try {
      setSending(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: patientId,
          receiverModel: 'User', // Patient is a User
          senderModel: 'User', // Pharmacy is also a User
          message: fileUrl ? (messageType === 'voice' ? 'Voice message' : messageType === 'image' ? 'Image' : fileName || 'File') : messageToSend,
          messageType: fileUrl ? messageType : 'text',
          fileUrl: fileUrl,
          fileName: fileName,
          fileType: fileType,
          requestId: requestId && /^[0-9a-fA-F]{24}$/.test(requestId) ? requestId : undefined // Only include if valid ObjectId
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        // Add message to local state immediately for better UX
        const newMsg = data.data;
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m._id === newMsg._id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
        
        // Note: The backend will emit the message via Socket.IO automatically
        // We just need to listen for it, which is already set up in setupSocketIO
        
        // Refresh messages after a short delay to ensure consistency
        setTimeout(() => fetchMessages(), 1000);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);
      formData.append('description', 'Prescription image from pharmacy chat');

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/file-attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success && data.data?.fileUrl) {
        // Send message with image
        await sendMessage(undefined, data.data.fileUrl, 'image', 'image.jpg', 'image/jpeg');
        toast.success('Image sent successfully');
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);
      formData.append('description', `Document from pharmacy chat: ${file.name}`);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/file-attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success && data.data?.fileUrl) {
        // Send message with document
        await sendMessage(undefined, data.data.fileUrl, 'file', file.name, file.type);
        toast.success('Document sent successfully');
      } else {
        throw new Error(data.message || 'Failed to upload document');
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document: ' + error.message);
    } finally {
      setUploadingFile(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Upload and send voice message
        await uploadAndSendVoice(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const uploadAndSendVoice = async (audioBlob: Blob) => {
    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice-message.webm');
      formData.append('patientId', patientId);
      formData.append('description', 'Voice message from pharmacy chat');

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/file-attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success && data.data?.fileUrl) {
        // Send message with voice
        await sendMessage(undefined, data.data.fileUrl, 'voice', 'voice-message.webm', 'audio/webm');
        toast.success('Voice message sent successfully');
        // Clean up
        setAudioBlob(null);
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        }
      } else {
        throw new Error(data.message || 'Failed to upload voice message');
      }
    } catch (error: any) {
      console.error('Error uploading voice message:', error);
      toast.error('Failed to upload voice message: ' + error.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateString: string) => {
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

  const isMyMessage = (message: ChatMessage) => {
    return message.senderId === pharmacyId || message.senderId?.toString() === pharmacyId?.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              {patientName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{patientName}</h3>
            <p className="text-xs text-gray-500">Active now</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-gray-400 text-xs mt-1">Start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = isMyMessage(message);
            return (
              <div
                key={message._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {!isMine && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                        {patientName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isMine
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-200'
                      }`}
                    >
                      {message.messageType === 'image' && message.fileUrl ? (
                        <div className="space-y-2">
                          <img
                            src={message.fileUrl}
                            alt="Shared image"
                            className="max-w-xs rounded-lg cursor-pointer"
                            onClick={() => window.open(message.fileUrl, '_blank')}
                          />
                          {message.message !== 'Image' && (
                            <p className="text-sm mt-2">{message.message}</p>
                          )}
                        </div>
                      ) : message.messageType === 'file' && message.fileUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                            <File className="w-4 h-4 text-gray-600" />
                            <a
                              href={message.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {message.fileName || 'Download file'}
                            </a>
                          </div>
                          {message.message !== 'File' && message.message !== message.fileName && (
                            <p className="text-sm mt-2">{message.message}</p>
                          )}
                        </div>
                      ) : message.messageType === 'voice' && message.fileUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            <audio controls className="w-full max-w-xs">
                              <source src={message.fileUrl} type="audio/webm" />
                              <source src={message.fileUrl} type="audio/mpeg" />
                              <source src={message.fileUrl} type="audio/wav" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                          {message.message !== 'Voice message' && (
                            <p className="text-sm mt-2">{message.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs text-gray-500 mt-1 px-2 ${isMine ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.createdAt)}
                      {isMine && (
                        <span className="ml-1">
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        {/* Recording Indicator */}
        {isRecording && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-700 font-medium">
              Recording: {formatRecordingTime(recordingTime)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopRecording}
              className="ml-auto h-6 px-2 text-red-700 hover:bg-red-100"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          {/* Image Upload Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage || sending || isRecording}
            className="h-10 w-10 p-0 flex-shrink-0"
            title="Upload image"
          >
            {uploadingImage ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            ) : (
              <ImageIcon className="w-5 h-5 text-gray-600" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Document Upload Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => documentInputRef.current?.click()}
            disabled={uploadingFile || sending || isRecording}
            className="h-10 w-10 p-0 flex-shrink-0"
            title="Upload document"
          >
            {uploadingFile && !isRecording ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            ) : (
              <Paperclip className="w-5 h-5 text-gray-600" />
            )}
          </Button>
          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
            onChange={handleDocumentUpload}
            className="hidden"
          />

          {/* Voice Recording Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={uploadingFile || sending || uploadingImage}
            className={`h-10 w-10 p-0 flex-shrink-0 ${isRecording ? 'text-red-600' : ''}`}
            title={isRecording ? 'Stop recording' : 'Record voice message'}
          >
            {isRecording ? (
              <Square className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5 text-gray-600" />
            )}
          </Button>

          {/* Message Input */}
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            disabled={sending || uploadingImage || uploadingFile || isRecording}
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            rows={1}
          />

          {/* Send Button */}
          <Button
            onClick={() => sendMessage()}
            disabled={(!newMessage.trim() && !uploadingImage && !uploadingFile) || sending || isRecording}
            className="h-10 w-10 p-0 bg-purple-600 hover:bg-purple-700 flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

