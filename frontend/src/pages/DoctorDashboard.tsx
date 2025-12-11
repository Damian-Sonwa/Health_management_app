import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageCircle,
  CheckCircle,
  XCircle,
  CalendarClock,
  FileText,
  AlertCircle,
  Loader2,
  Eye,
  Search,
  Filter,
  Menu,
  X,
  LogOut,
  Stethoscope,
  Home,
  Send,
  Upload,
  Download,
  Pill,
  Plus,
  ArrowLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/components/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface Appointment {
  _id: string;
  userId: string;
  patientInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  doctorName: string;
  doctorId?: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: 'video' | 'in_person' | 'phone';
  status: 'pending' | 'scheduled' | 'accepted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'declined' | 'rescheduled';
  reason: string;
  notes?: string;
  videoCall?: {
    meetingLink?: string;
    meetingId?: string;
  };
}

export default function DoctorDashboard() {
  const { user, isDoctor, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    notes: ''
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Consultation features state
  const [consultationAppointment, setConsultationAppointment] = useState<Appointment | null>(null);
  const [activeMode, setActiveMode] = useState<'phone' | 'video' | 'chat' | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medicationName: '',
    dosage: '',
    instructions: ''
  });
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(true); // Start collapsed
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const isAutoScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🔍 DoctorDashboard useEffect - isDoctor:', isDoctor, 'isAdmin:', isAdmin, 'user:', user);
    if (!isDoctor && !isAdmin) {
      console.warn('⚠️ DoctorDashboard: User is not a doctor or admin, skipping fetch');
      return;
    }
    console.log('✅ DoctorDashboard: Fetching appointments...');
    fetchAppointments();
  }, [isDoctor, isAdmin, filterStatus, user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      console.log('📡 DoctorDashboard: Fetching appointments from:', `${API_BASE_URL}/appointments`);
      console.log('📡 DoctorDashboard: User role:', user?.role, 'User ID:', user?.id);
      
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 DoctorDashboard: Response status:', response.status, response.statusText);
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DoctorDashboard: Response not OK:', response.status, errorText);
        throw new Error(`Failed to fetch appointments: ${response.status} ${response.statusText}`);
      }
      
      // Check if response has content
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn('⚠️ DoctorDashboard: Empty response from server');
        setAppointments([]);
        return;
      }
      
      // Parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ DoctorDashboard: JSON parse error:', parseError, 'Response text:', text);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('📡 DoctorDashboard: Response data:', data);
      
      // Handle both 'appointments' and 'data' keys for backward compatibility
      const apps = data.appointments || data.data || [];
      console.log('✅ Doctor Dashboard - Fetched appointments:', apps.length);
      console.log('📋 Appointments data:', apps);
      console.log('📋 Appointments by status:', {
        pending: apps.filter((a: Appointment) => a.status === 'pending').length,
        scheduled: apps.filter((a: Appointment) => a.status === 'scheduled').length,
        confirmed: apps.filter((a: Appointment) => a.status === 'confirmed').length,
        all: apps.length
      });
      setAppointments(apps);
    } catch (error: any) {
      console.error('❌ Error fetching appointments:', error);
      toast.error(`Failed to load appointments: ${error.message || 'Unknown error'}`);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('✅ Accepting appointment:', appointmentId);
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });
      
      const data = await response.json();
      console.log('✅ Accept appointment response:', data);
      if (data.success || response.ok) {
        toast.success('Appointment confirmed successfully');
        await fetchAppointments();
      } else {
        throw new Error(data.message || 'Failed to confirm appointment');
      }
    } catch (error: any) {
      console.error('❌ Error accepting appointment:', error);
      toast.error('Failed to confirm appointment: ' + error.message);
    }
  };

  const handleDeclineAppointment = async (appointmentId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          notes: reason ? `Declined: ${reason}` : 'Appointment declined by doctor'
        })
      });
      
      const data = await response.json();
      if (data.success || response.ok) {
        toast.success('Appointment declined');
        await fetchAppointments();
      } else {
        throw new Error(data.message || 'Failed to decline appointment');
      }
    } catch (error: any) {
      toast.error('Failed to decline appointment: ' + error.message);
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentDate: rescheduleData.date,
          appointmentTime: rescheduleData.time,
          notes: rescheduleData.notes ? 
            `${selectedAppointment?.notes || ''}\nRescheduled: ${rescheduleData.notes}` : 
            selectedAppointment?.notes
        })
      });
      
      const data = await response.json();
      if (data.success || response.ok) {
        toast.success('Appointment rescheduled successfully');
        setRescheduleDialogOpen(false);
        setRescheduleData({ date: '', time: '', notes: '' });
        await fetchAppointments();
      } else {
        throw new Error(data.message || 'Failed to reschedule appointment');
      }
    } catch (error: any) {
      toast.error('Failed to reschedule appointment: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Consultation functions
  const openConsultation = (appointment: Appointment) => {
    setConsultationAppointment(appointment);
    setActiveMode('chat'); // Default to chat mode
    fetchConsultationData(appointment._id);
  };

  const closeConsultation = () => {
    setConsultationAppointment(null);
    setActiveMode(null);
    setIsCallActive(false);
    setIsVideoActive(false);
    setCallDuration(0);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const fetchConsultationData = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      // Fetch messages using patientId (receiverId) - backend uses roomId based on sender/receiver
      if (consultationAppointment?.userId) {
        try {
          const patientId = consultationAppointment.userId;
          const messagesResponse = await fetch(`${API_BASE_URL}/chats/${patientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!messagesResponse.ok) {
            throw new Error(`Failed to fetch messages: ${messagesResponse.status}`);
          }
          
          const messagesData = await messagesResponse.json();
          console.log('📨 Fetched messages data:', messagesData);
          
          if (messagesData.success || messagesData.messages || messagesData.data) {
            const msgs = messagesData.messages || messagesData.data || [];
            console.log(`📨 Found ${msgs.length} messages`);
            
            // Transform messages to match expected format
            const transformedMessages = msgs.map((msg: any) => {
              // Convert senderId to string for comparison
              const senderIdStr = msg.senderId?.toString() || msg.senderId;
              const currentUserId = (user?.id || user?._id)?.toString();
              
              return {
                _id: msg._id,
                senderId: senderIdStr,
                senderName: msg.senderName || (msg.senderModel === 'User' ? 'Patient' : 'Doctor'),
                message: msg.message,
                timestamp: msg.createdAt || msg.timestamp || new Date(),
                isRead: msg.isRead,
                fileUrl: msg.fileUrl,
                fileName: msg.fileName,
                fileType: msg.fileType
              };
            });
            
            // Sort by timestamp to ensure chronological order
            transformedMessages.sort((a: any, b: any) => {
              const timeA = new Date(a.timestamp).getTime();
              const timeB = new Date(b.timestamp).getTime();
              return timeA - timeB;
            });
            
            setMessages(transformedMessages);
            console.log('✅ Messages set:', transformedMessages.length);
          } else {
            console.warn('⚠️ No messages in response:', messagesData);
            setMessages([]);
          }
        } catch (msgError: any) {
          console.error('❌ Error fetching messages:', msgError);
          toast.error('Failed to load messages: ' + (msgError.message || 'Unknown error'));
          setMessages([]);
        }
      } else {
        console.warn('⚠️ No patientId in consultationAppointment');
        setMessages([]);
      }

      // Fetch files
      const filesResponse = await fetch(`${API_BASE_URL}/file-attachments/appointment/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const filesData = await filesResponse.json();
      if (filesData.success || filesData.data) {
        setFiles(filesData.data || filesData.files || []);
      }

      // Fetch prescriptions
      const prescriptionsResponse = await fetch(`${API_BASE_URL}/prescriptions/appointment/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const prescriptionsData = await prescriptionsResponse.json();
      if (prescriptionsData.success || prescriptionsData.data) {
        setPrescriptions(prescriptionsData.data || prescriptionsData.prescriptions || []);
      }
    } catch (error) {
      console.error('Error fetching consultation data:', error);
    }
  };

  const handleInitiatePhoneCall = async () => {
    if (!consultationAppointment?.patientInfo?.phone) {
      toast.error('Patient phone number not available');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/phone-calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: consultationAppointment._id,
          patientId: consultationAppointment.userId,
          doctorId: user?.id || user?._id,
          callType: 'outgoing',
          phoneNumber: consultationAppointment.patientInfo.phone,
          status: 'initiated',
          startTime: new Date().toISOString()
        })
      });

      window.location.href = `tel:${consultationAppointment.patientInfo.phone}`;
      setIsCallActive(true);
      setActiveMode('phone');
      toast.success('Initiating phone call...');
      
      const startTime = Date.now();
      const interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      (window as any).callInterval = interval;
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
    }
  };

  const handleEndPhoneCall = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/phone-calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: consultationAppointment?._id,
          patientId: consultationAppointment?.userId,
          doctorId: user?.id || user?._id,
          callType: 'outgoing',
          phoneNumber: consultationAppointment?.patientInfo?.phone || '',
          status: 'completed',
          duration: callDuration,
          startTime: new Date(Date.now() - callDuration * 1000).toISOString(),
          endTime: new Date().toISOString()
        })
      });

      if ((window as any).callInterval) {
        clearInterval((window as any).callInterval);
      }
      
      setIsCallActive(false);
      setCallDuration(0);
      setActiveMode('chat');
      toast.info('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const handleInitiateVideoCall = async () => {
    try {
      setActiveMode('video');
      setIsVideoActive(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);

      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/video-calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: consultationAppointment?._id,
          patientId: consultationAppointment?.userId,
          doctorId: user?.id || user?._id,
          status: 'initiated',
          meetingId: `meeting_${consultationAppointment?._id}_${Date.now()}`,
          meetingLink: `https://meet.example.com/${consultationAppointment?._id}`,
          startTime: new Date().toISOString()
        })
      });

      toast.success('Video call started');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera/microphone. Please check permissions.');
      setIsVideoActive(false);
      setActiveMode('chat');
    }
  };

  const handleEndVideoCall = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      const token = localStorage.getItem('authToken');
      const videoSessionsResponse = await fetch(`${API_BASE_URL}/video-calls?appointmentId=${consultationAppointment?._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const videoSessionsData = await videoSessionsResponse.json();
      
      if (videoSessionsData.success && videoSessionsData.data && videoSessionsData.data.length > 0) {
        const activeSession = videoSessionsData.data.find((s: any) => s.status === 'initiated' || s.status === 'joined');
        if (activeSession) {
          await fetch(`${API_BASE_URL}/video-calls/${activeSession._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              status: 'ended',
              endTime: new Date().toISOString()
            })
          });
        }
      }

      setIsVideoActive(false);
      setActiveMode('chat');
      setLocalStream(null);
      toast.info('Video call ended');
    } catch (error) {
      console.error('Error ending video call:', error);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoMuted;
        setIsVideoMuted(!isVideoMuted);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioMuted;
        setIsAudioMuted(!isAudioMuted);
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !consultationAppointment) return;

    const messageText = newMessage.trim();
    const currentUserId = (user?.id || user?._id)?.toString();
    
    // Optimistically add message to UI immediately
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      senderId: currentUserId,
      senderName: user?.name || 'Doctor',
      message: messageText,
      timestamp: new Date(),
      isRead: false
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: consultationAppointment.userId,
          message: messageText,
          receiverModel: 'User' // Patient is a User, doctor is sending
        })
      });

      const data = await response.json();
      console.log('📤 Send message response:', data);
      
      if (data.success || response.ok) {
        // Replace optimistic message with real one from server
        if (data.data) {
          const realMessage = {
            _id: data.data._id,
            senderId: data.data.senderId?.toString() || data.data.senderId,
            senderName: user?.name || 'Doctor',
            message: data.data.message,
            timestamp: data.data.createdAt || new Date(),
            isRead: data.data.isRead || false
          };
          
          setMessages(prev => {
            // Remove optimistic message and add real one
            const filtered = prev.filter(msg => msg._id !== optimisticMessage._id);
            return [...filtered, realMessage].sort((a, b) => {
              const timeA = new Date(a.timestamp).getTime();
              const timeB = new Date(b.timestamp).getTime();
              return timeA - timeB;
            });
          });
        } else {
          // If no data returned, just refresh all messages
          await fetchConsultationData(consultationAppointment._id);
        }
        toast.success('Message sent');
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      toast.error('Failed to send message: ' + error.message);
      // Restore message text so user can retry
      setNewMessage(messageText);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !consultationAppointment) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, Images, or Documents.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setUploadingFile(true);
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appointmentId', consultationAppointment._id);
      formData.append('fileType', file.type);

      const response = await fetch(`${API_BASE_URL}/file-attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        toast.success('File uploaded successfully!');
        await fetchConsultationData(consultationAppointment._id);
      } else {
        throw new Error(data.message || 'Failed to upload file');
      }
    } catch (error: any) {
      toast.error(`Failed to upload file: ${error.message}`);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPrescription.medicationName || !newPrescription.dosage || !newPrescription.instructions || !consultationAppointment) {
      toast.error('Please fill in all prescription fields');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: consultationAppointment._id,
          patientId: consultationAppointment.userId,
          medication: newPrescription.medicationName,
          dosage: newPrescription.dosage,
          instructions: newPrescription.instructions
        })
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        toast.success('Prescription sent successfully!');
        setShowPrescriptionForm(false);
        setNewPrescription({
          medicationName: '',
          dosage: '',
          instructions: ''
        });
        await fetchConsultationData(consultationAppointment._id);
      } else {
        throw new Error(data.message || 'Failed to send prescription');
      }
    } catch (error: any) {
      toast.error('Failed to send prescription: ' + error.message);
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Poll for messages when in chat mode
  useEffect(() => {
    if (activeMode === 'chat' && consultationAppointment?._id) {
      // Fetch immediately
      fetchConsultationData(consultationAppointment._id);
      
      // Then poll every 2 seconds
      const interval = setInterval(() => {
        fetchConsultationData(consultationAppointment._id);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [activeMode, consultationAppointment?._id]);

  // Scroll to bottom when new messages arrive - only if user is at bottom
  useEffect(() => {
    if (messagesContainerRef.current && !isUserScrolling && !isAutoScrollingRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      // Only auto-scroll if user is already near the bottom
      if (isNearBottom && messages.length > 0) {
        isAutoScrollingRef.current = true;
        setTimeout(() => {
          if (messagesEndRef.current && messagesContainerRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            // Reset flag after scroll completes
            setTimeout(() => {
              isAutoScrollingRef.current = false;
            }, 500);
          }
        }, 100);
      }
    }
  }, [messages.length, isUserScrolling]); // Only depend on message count, not messages array

  // Track user scrolling with debounce
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || activeMode !== 'chat') return;

    const handleScroll = () => {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      // If user scrolls away from bottom, mark as scrolling
      if (!isNearBottom && !isAutoScrollingRef.current) {
        setIsUserScrolling(true);
      }
      
      // Debounce: if user stops scrolling near bottom, reset flag
      scrollTimeoutRef.current = setTimeout(() => {
        if (isNearBottom) {
          setIsUserScrolling(false);
        }
      }, 300);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activeMode === 'chat']);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in_person':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      apt.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.patientInfo?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingAppointments = appointments.filter(a => 
    ['pending', 'scheduled'].includes(a.status)
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/doctor-dashboard' }
    // Consultation Room is accessed via "Open Consultation Room" button on appointments
  ];

  if (!isDoctor && !isAdmin) {
    console.warn('⚠️ DoctorDashboard: Access denied - User is not a doctor or admin');
    console.log('User role:', user?.role, 'isDoctor:', isDoctor, 'isAdmin:', isAdmin);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-16">
            <p className="text-red-600">Access Denied</p>
            <p className="text-gray-600 mt-2">You must be a doctor or admin to access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  console.log('✅ DoctorDashboard: Rendering for user:', user?.name, 'role:', user?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 w-full">
      <div className="flex h-screen overflow-hidden w-full">
        {/* Desktop Sidebar */}
        <aside className={`
          hidden lg:flex
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          bg-white border-r border-gray-200 
          transition-all duration-300 
          flex-col
          shadow-lg
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Doctor</h2>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.href);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className={`
              flex items-center gap-3 p-3 rounded-lg
              ${sidebarOpen ? 'bg-gray-50' : 'justify-center'}
            `}>
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-green-600 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Doctor'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <div className="flex flex-col h-full">
                      {/* Mobile Sidebar Header */}
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="font-bold text-gray-900">Doctor</h2>
                            <p className="text-xs text-gray-500">Dashboard</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Mobile Navigation */}
                      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href;
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                navigate(item.href);
                                setMobileMenuOpen(false);
                              }}
                              className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                transition-all duration-200
                                ${isActive 
                                  ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md' 
                                  : 'text-gray-700 hover:bg-gray-100'
                                }
                              `}
                            >
                              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                              <span className="font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                      </nav>

                      {/* Mobile User Profile */}
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-green-600 text-white">
                              {user?.name?.charAt(0).toUpperCase() || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user?.name || 'Doctor'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Doctor Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
                    Manage appointments and consultations • {appointments.length} total appointments
                  </p>
                  {appointments.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {appointments.filter(a => a.status === 'pending').length} pending • {' '}
                      {appointments.filter(a => a.status === 'scheduled').length} scheduled • {' '}
                      {appointments.filter(a => ['confirmed', 'accepted', 'in_progress'].includes(a.status)).length} active consultations
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                {pendingAppointments > 0 && (
                  <Badge variant="destructive" className="text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2 animate-pulse">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{pendingAppointments} Pending Action</span>
                    <span className="sm:hidden">{pendingAppointments}</span>
                  </Badge>
                )}
                <Badge variant="outline" className="text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2">
                  {pendingAppointments} Pending
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 min-h-0">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                  <p className="text-3xl font-bold text-blue-600">{appointments.length}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {appointments.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {appointments.filter(a => a.status === 'scheduled').length}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {appointments.filter(a => a.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-gray-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="accepted">Accepted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {loading ? (
          <Card>
            <CardContent className="text-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
              <p className="text-gray-600 mt-4">Loading appointments...</p>
            </CardContent>
          </Card>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filterStatus === 'all' ? 'No Appointments' : `No ${filterStatus} Appointments`}
              </h3>
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all' 
                  ? `You don't have any appointments yet. Patients can book appointments with you through the appointment booking system. Once a patient books an appointment with you, it will appear here.`
                  : `You don't have any ${filterStatus} appointments. Try selecting "All Status" to see all appointments.`}
              </p>
              {filterStatus === 'all' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium mb-2">💡 How appointments work:</p>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Patients book appointments through the Appointments page</li>
                    <li>When they select you as their doctor, the appointment will appear here</li>
                    <li>You can accept, decline, or reschedule appointments</li>
                    <li>Once accepted, you can open the Consultation Room to chat with patients</li>
                  </ul>
                </div>
              )}
              {appointments.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">Appointments by Status:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['pending', 'scheduled', 'confirmed', 'accepted', 'in_progress', 'completed'].map(status => {
                      const count = appointments.filter(a => a.status === status).length;
                      if (count === 0) return null;
                      return (
                        <Badge key={status} variant="outline" className="text-xs">
                          {status}: {count}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              {filterStatus !== 'all' && (
                <Button
                  variant="outline"
                  onClick={() => setFilterStatus('all')}
                >
                  Show All Appointments
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment._id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(appointment.type)}
                      <div>
                        <CardTitle className="text-lg">
                          {appointment.patientInfo?.name || 'Patient'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Reason:</span>
                      <span>{appointment.reason}</span>
                    </div>
                    {appointment.specialty && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Specialty:</span>
                        <span>{appointment.specialty}</span>
                      </div>
                    )}
                    {appointment.patientInfo?.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{appointment.patientInfo.phone}</span>
                      </div>
                    )}
                    {appointment.patientInfo?.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageCircle className="w-4 h-4" />
                        <span>{appointment.patientInfo.email}</span>
                      </div>
                    )}
                  </div>

                  {appointment.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{appointment.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2 border-t">
                    {/* Accept/Decline/Reschedule buttons for pending and scheduled appointments */}
                    {(appointment.status === 'pending' || appointment.status === 'scheduled') && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleAcceptAppointment(appointment._id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            const reason = prompt('Reason for declining (optional):');
                            handleDeclineAppointment(appointment._id, reason || undefined);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setRescheduleData({
                              date: appointment.appointmentDate.split('T')[0],
                              time: appointment.appointmentTime,
                              notes: ''
                            });
                            setRescheduleDialogOpen(true);
                          }}
                        >
                          <CalendarClock className="w-4 h-4 mr-2" />
                          Reschedule
                        </Button>
                      </div>
                    )}
                    {/* Consultation Room Section - Prominent and visible */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {(appointment.status === 'confirmed' || appointment.status === 'accepted' || appointment.status === 'in_progress') ? (
                        <>
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                            onClick={() => {
                              console.log('🚪 Opening consultation for appointment:', appointment._id);
                              openConsultation(appointment);
                            }}
                            title="Open Consultation - Chat, call, video, share files and send prescriptions"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Open Consultation
                          </Button>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            💡 Patient can access the same consultation room via their dashboard using appointment ID: {appointment._id.substring(0, 8)}...
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-blue-600 font-medium">
                            ⏳ Accept this appointment to enable Consultation Room
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Once accepted, you and the patient can chat, call, and share files
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reschedule-date">New Date</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reschedule-time">New Time</Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reschedule-notes">Notes (Optional)</Label>
                <Textarea
                  id="reschedule-notes"
                  value={rescheduleData.notes}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, notes: e.target.value })}
                  placeholder="Reason for rescheduling..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => selectedAppointment && handleRescheduleAppointment(selectedAppointment._id)}
                >
                  Confirm Reschedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRescheduleDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={!!selectedAppointment && !rescheduleDialogOpen} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient Name</Label>
                    <p className="font-medium">{selectedAppointment.patientInfo?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedAppointment.status)}>
                      {selectedAppointment.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Date & Time</Label>
                    <p className="font-medium">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at {selectedAppointment.appointmentTime}
                    </p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <p className="font-medium capitalize">{selectedAppointment.type.replace('_', ' ')}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Reason</Label>
                    <p className="font-medium">{selectedAppointment.reason}</p>
                  </div>
                  {selectedAppointment.notes && (
                    <div className="col-span-2">
                      <Label>Notes</Label>
                      <p className="font-medium">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Consultation Interface Dialog */}
        {consultationAppointment && (
          <Dialog open={!!consultationAppointment} onOpenChange={(open) => !open && closeConsultation()}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold">Consultation Room</DialogTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {consultationAppointment.patientInfo?.name || 'Patient'}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(consultationAppointment.appointmentDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {consultationAppointment.appointmentTime}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(consultationAppointment.status)}>
                    {consultationAppointment.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Communication Mode Selector */}
              <Card className="bg-white shadow-md mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Communication Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      onClick={handleInitiatePhoneCall}
                      disabled={isCallActive || !consultationAppointment?.patientInfo?.phone}
                      className={`flex-1 sm:flex-initial min-w-[150px] ${
                        activeMode === 'phone' 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : consultationAppointment?.patientInfo?.phone
                          ? 'bg-green-100 hover:bg-green-200 text-green-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {isCallActive ? `Call Active (${formatCallDuration(callDuration)})` : 'Phone Call'}
                    </Button>
                    
                    <Button
                      onClick={handleInitiateVideoCall}
                      disabled={isVideoActive}
                      className={`flex-1 sm:flex-initial min-w-[150px] ${
                        activeMode === 'video' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      }`}
                    >
                      <Video className="w-5 h-5 mr-2" />
                      {isVideoActive ? 'Video Active' : 'Video Call'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setActiveMode('chat');
                        setIsChatCollapsed(false); // Auto-expand when Live Chat is clicked
                      }}
                      className={`flex-1 sm:flex-initial min-w-[150px] ${
                        activeMode === 'chat' 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Live Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Phone Call Interface */}
              {activeMode === 'phone' && isCallActive && (
                <Card className="bg-white shadow-lg mb-6">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
                        <Phone className="w-16 h-16 text-green-600" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {consultationAppointment.patientInfo?.name || 'Patient'}
                        </h3>
                        <p className="text-lg text-gray-600 mb-4">
                          {consultationAppointment.patientInfo?.phone}
                        </p>
                        <p className="text-3xl font-mono font-bold text-green-600">
                          {formatCallDuration(callDuration)}
                        </p>
                      </div>
                      <Button
                        onClick={handleEndPhoneCall}
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 rounded-full w-20 h-20"
                      >
                        <PhoneOff className="w-8 h-8" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Video Call Interface */}
              {activeMode === 'video' && isVideoActive && (
                <Card className="bg-black shadow-lg mb-6">
                  <CardContent className="p-0">
                    <div className="relative h-[400px]">
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-gray-900">
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {isVideoMuted && (
                          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <VideoOff className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            onClick={toggleAudio}
                            size="lg"
                            className={`rounded-full ${
                              isAudioMuted 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                          </Button>
                          <Button
                            onClick={toggleVideo}
                            size="lg"
                            className={`rounded-full ${
                              isVideoMuted 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                          </Button>
                          <Button
                            onClick={handleEndVideoCall}
                            size="lg"
                            className="rounded-full bg-red-600 hover:bg-red-700"
                          >
                            <PhoneOff className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chat Interface */}
              {activeMode === 'chat' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 bg-white shadow-md">
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Chat Messages</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                        className="h-8 w-8 p-0"
                      >
                        {isChatCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </Button>
                    </CardHeader>
                    {!isChatCollapsed && (
                      <CardContent className="p-0">
                        <div 
                          ref={messagesContainerRef}
                          className="h-[400px] overflow-y-auto p-4 space-y-4"
                        >
                        {messages.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          messages.map((msg) => {
                            const currentUserId = (user?.id || user?._id)?.toString();
                            const msgSenderId = msg.senderId?.toString() || msg.senderId;
                            const isCurrentUser = msgSenderId === currentUserId;
                            
                            return (
                              <div
                                key={msg._id}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[70%] rounded-lg p-3 ${
                                  isCurrentUser
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <p className="text-sm font-medium mb-1">{msg.senderName || 'User'}</p>
                                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                  {msg.fileUrl && (
                                    <a
                                      href={msg.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs underline mt-1 block"
                                    >
                                      📎 {msg.fileName || 'File'}
                                    </a>
                                  )}
                                  <p className="text-xs opacity-70 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/*,application/pdf,.doc,.docx"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFile}
                        >
                          {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </Button>
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1"
                        />
                        <Button type="submit" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                      </CardContent>
                    )}
                  </Card>

                  {/* Files and Prescriptions Sidebar */}
                  <div className="space-y-4">
                    {/* Files Section */}
                    <Card className="bg-white shadow-md">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Files
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {files.length > 0 ? (
                          <div className="space-y-2">
                            {files.map((file) => (
                              <div key={file._id} className="p-2 bg-gray-50 rounded border">
                                <p className="text-sm font-medium truncate">{file.fileName}</p>
                                <div className="flex gap-2 mt-2">
                                  <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    <Eye className="w-3 h-3 inline mr-1" />
                                    View
                                  </a>
                                  <a
                                    href={file.fileUrl}
                                    download
                                    className="text-xs text-gray-600 hover:underline"
                                  >
                                    <Download className="w-3 h-3 inline mr-1" />
                                    Download
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No files shared</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Prescriptions Section */}
                    <Card className="bg-white shadow-md">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Pill className="w-5 h-5" />
                            Prescriptions
                          </CardTitle>
                          <Dialog open={showPrescriptionForm} onOpenChange={setShowPrescriptionForm}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Prescription</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSendPrescription} className="space-y-4">
                                <div>
                                  <Label htmlFor="medicationName">Medication Name *</Label>
                                  <Input
                                    id="medicationName"
                                    value={newPrescription.medicationName}
                                    onChange={(e) => setNewPrescription({ ...newPrescription, medicationName: e.target.value })}
                                    placeholder="e.g., Amoxicillin 500mg"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="dosage">Dosage *</Label>
                                  <Input
                                    id="dosage"
                                    value={newPrescription.dosage}
                                    onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                                    placeholder="e.g., 1 tablet twice daily"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="instructions">Instructions *</Label>
                                  <Textarea
                                    id="instructions"
                                    value={newPrescription.instructions}
                                    onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                                    placeholder="Take with food. Complete the full course."
                                    required
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                                    Send Prescription
                                  </Button>
                                  <Button type="button" variant="outline" onClick={() => setShowPrescriptionForm(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {prescriptions.length > 0 ? (
                          <div className="space-y-3">
                            {prescriptions.map((prescription) => (
                              <div key={prescription._id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-gray-900">{prescription.medicationName}</h4>
                                <p className="text-sm text-gray-700 mt-1">
                                  <strong>Dosage:</strong> {prescription.dosage}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                  <strong>Instructions:</strong> {prescription.instructions}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  Prescribed on {new Date(prescription.prescribedAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No prescriptions sent</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

