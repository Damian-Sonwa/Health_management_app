import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/components/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Get Socket.IO server URL based on environment
const getSocketUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001';
  }
  return 'https://health-management-app-joj5.onrender.com';
};

interface RealtimeUpdate {
  type: string;
  data: any;
  timestamp: Date;
}

export function useRealtimeUpdates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const userIdRef = useRef<string | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const userId = user?.userId || user?.id;
    
    if (!userId) {
      console.log('⚠️ No user ID, skipping Socket.IO connection');
      return;
    }

    // Prevent re-initialization if socket already exists for the same user
    if (socketRef.current && userIdRef.current === userId) {
      console.log('✅ Socket already initialized for this user');
      return;
    }

    // Close existing socket if user changed
    if (socketRef.current && userIdRef.current !== userId) {
      console.log('🔌 User changed, closing old socket');
      socketRef.current.close();
      socketRef.current = null;
    }

    userIdRef.current = userId;
    const socketUrl = getSocketUrl();
    console.log('🔌 Initializing Socket.IO connection to:', socketUrl, 'for user:', userId);

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: maxReconnectAttempts,
      autoConnect: true,
      withCredentials: true,
      path: '/socket.io/',
      secure: true
    });

    socketRef.current = newSocket;
    console.log('🔌 Socket.IO instance created, attempting to connect...');

    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Authenticate the socket with user ID
      newSocket.emit('authenticate', userId);
      
      toast.success('Real-time updates enabled', {
        description: 'Dashboard will update automatically',
        duration: 3000
      });
    });

    newSocket.on('authenticated', (data) => {
      console.log('🔐 Socket authenticated:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
      setIsConnected(false);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        toast.info('Connection lost', {
          description: 'Attempting to reconnect...',
          duration: 2000
        });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      reconnectAttempts.current += 1;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Connection failed', {
          description: 'Real-time updates unavailable. Data will refresh on page navigation.',
          duration: 5000
        });
      }
    });

    // Listen for medication updates
    newSocket.on('medication-updated', (update: RealtimeUpdate) => {
      console.log('💊 Medication updated:', update);
      console.log('💊 New medication data:', update.data);
      console.log('💊 Operation type:', update.type);
      setIsUpdating(true);
      setLastUpdate(update);
      
      // Invalidate medications query to trigger refetch
      console.log('🔄 Invalidating medications and dashboard-stats queries...');
      queryClient.invalidateQueries({ queryKey: ['medications'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
      
      setTimeout(() => {
        setIsUpdating(false);
        console.log('✅ Medication update complete');
      }, 1000);
      
      toast.info('Medication updated', {
        description: `Your medications have been ${update.type === 'insert' ? 'added' : update.type === 'update' ? 'updated' : 'modified'}`,
        duration: 2000
      });
    });

    // Listen for vital updates
    newSocket.on('vital-updated', (update: RealtimeUpdate) => {
      console.log('❤️ Vital updated:', update);
      console.log('❤️ New vital data:', update.data);
      console.log('❤️ Operation type:', update.type);
      setIsUpdating(true);
      setLastUpdate(update);
      
      console.log('🔄 Invalidating vitals and dashboard-stats queries...');
      queryClient.invalidateQueries({ queryKey: ['vitals'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
      
      setTimeout(() => {
        setIsUpdating(false);
        console.log('✅ Vital update complete');
      }, 1000);
      
      toast.info('Vital reading updated', {
        description: `New ${update.data?.type || 'vital'} reading recorded`,
        duration: 2000
      });
    });

    // Listen for appointment updates
    newSocket.on('appointment-updated', (update: RealtimeUpdate) => {
      console.log('📅 Appointment updated:', update);
      setIsUpdating(true);
      setLastUpdate(update);
      
      queryClient.invalidateQueries({ queryKey: ['appointments'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
      
      setTimeout(() => setIsUpdating(false), 1000);
      
      toast.info('Appointment updated', {
        description: `Your appointments have been ${update.type === 'insert' ? 'scheduled' : 'updated'}`,
        duration: 2000
      });
    });

    // Listen for care plan updates
    newSocket.on('careplan-updated', (update: RealtimeUpdate) => {
      console.log('📋 Care plan updated:', update);
      setIsUpdating(true);
      setLastUpdate(update);
      
      queryClient.invalidateQueries({ queryKey: ['carePlans'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
      
      setTimeout(() => setIsUpdating(false), 1000);
      
      toast.info('Care plan updated', {
        description: update.data?.title || 'A care plan has been modified',
        duration: 2000
      });
    });

    // Listen for notification updates
    newSocket.on('notification-updated', (update: RealtimeUpdate) => {
      console.log('🔔 Notification updated:', update);
      setIsUpdating(true);
      setLastUpdate(update);
      
      queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['notifications', userId, 'unread'], refetchType: 'all' });
      
      setTimeout(() => setIsUpdating(false), 1000);
      
      if (update.type === 'insert') {
        toast.info('New notification', {
          description: update.data?.message || 'You have a new notification',
          duration: 3000
        });
      }
    });

    // Listen for health record updates
    newSocket.on('healthrecord-updated', (update: RealtimeUpdate) => {
      console.log('📄 Health record updated:', update);
      setIsUpdating(true);
      setLastUpdate(update);
      
      queryClient.invalidateQueries({ queryKey: ['healthRecords'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
      
      setTimeout(() => setIsUpdating(false), 1000);
      
      toast.info('Health record updated', {
        description: update.data?.title || 'A health record has been modified',
        duration: 2000
      });
    });

    // Listen for data refreshed event (manual refresh)
    newSocket.on('data-refreshed', (data) => {
      console.log('🔄 Data refreshed:', data);
      setIsUpdating(true);
      queryClient.invalidateQueries({ refetchType: 'all' });
      setTimeout(() => setIsUpdating(false), 1000);
    });

    // Cleanup only on unmount or user change
    return () => {
      if (socketRef.current && userIdRef.current !== userId) {
        console.log('🔌 Cleaning up Socket.IO connection (user changed)');
        socketRef.current.close();
        socketRef.current = null;
        userIdRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user?.id, queryClient]);

  // Manual refresh function
  const refreshData = useCallback(() => {
    const userId = user?.userId || user?.id;
    
    if (socketRef.current && isConnected && userId) {
      console.log('🔄 Triggering manual data refresh for user:', userId);
      setIsUpdating(true);
      socketRef.current.emit('refresh-data', userId);
      queryClient.invalidateQueries({ refetchType: 'all' });
      
      setTimeout(() => {
        setIsUpdating(false);
        toast.success('Data refreshed', {
          description: 'All dashboard data has been updated',
          duration: 2000
        });
      }, 1000);
    } else {
      console.log('❌ Cannot refresh: socket not connected');
      toast.error('Not connected', {
        description: 'Real-time connection not established',
        duration: 2000
      });
    }
  }, [isConnected, user?.id, queryClient]);

  return {
    socket: socketRef.current,
    isConnected,
    isUpdating,
    lastUpdate,
    refreshData
  };
}

