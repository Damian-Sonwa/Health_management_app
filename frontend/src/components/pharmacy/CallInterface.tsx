import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  User,
  Loader2,
  Clock
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';

interface CallInterfaceProps {
  requestId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  onEndCall: () => void;
  callType: 'phone' | 'video';
}

export default function CallInterface({
  requestId,
  patientId,
  patientName,
  patientPhone,
  onEndCall,
  callType
}: CallInterfaceProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'active' | 'ended'>('connecting');
  const [callResponseId, setCallResponseId] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    initiateCall();
    return () => {
      endCall();
    };
  }, []);

  const initiateCall = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Check if requestId is a valid ObjectId format (24 hex characters)
      const isValidRequestId = /^[0-9a-fA-F]{24}$/.test(requestId);
      
      let data;
      let callLogId = null;
      
      if (isValidRequestId) {
        // Try to use medication request endpoint first
        try {
          const response = await fetch(`${API_BASE_URL}/pharmacy/medical-request/${requestId}/call`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          data = await response.json();
          if (data.success) {
            setCallResponseId(data.data?.pharmacyResponse?._id || null);
            callLogId = data.data?.pharmacyResponse?._id || null;
          } else {
            throw new Error(data.message || 'Failed to initiate call via request');
          }
        } catch (err: any) {
          // If medication request call fails, try direct patient call
          console.log('Medication request call failed, trying direct patient call:', err.message);
          const response = await fetch(`${API_BASE_URL}/pharmacy/call/patient`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              patientId: patientId,
              patientPhone: patientPhone,
              callType: callType
            })
          });
          
          data = await response.json();
          if (data.success) {
            callLogId = data.data?.callLog?._id || data.data?.callSession?.callLogId || null;
          } else {
            throw new Error(data.message || 'Failed to initiate call');
          }
        }
      } else {
        // Use direct patient call endpoint
        const response = await fetch(`${API_BASE_URL}/pharmacy/call/patient`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            patientId: patientId,
            patientPhone: patientPhone,
            callType: callType
          })
        });
        
        data = await response.json();
        if (data.success) {
          callLogId = data.data?.callLog?._id || data.data?.callSession?.callLogId || null;
        } else {
          throw new Error(data.message || 'Failed to initiate call');
        }
      }
      
      if (data.success) {
        setCallResponseId(callLogId);
        setCallStatus('ringing');
        
        // Simulate call connection (in production, integrate with Twilio/Agora)
        setTimeout(() => {
          setCallStatus('active');
          startCallTimer();
          
          if (callType === 'video') {
            startVideoCall();
          } else {
            // For phone calls, open device dialer
            window.location.href = `tel:${patientPhone}`;
          }
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to initiate call');
      }
    } catch (error: any) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call: ' + error.message);
      onEndCall();
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      localStreamRef.current = stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const startCallTimer = () => {
    startTimeRef.current = new Date();
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const duration = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const endCall = async () => {
    try {
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      // Stop timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      // Update call log
      if (callResponseId && callStatus === 'active') {
        const token = localStorage.getItem('authToken');
        
        // Try medication request call update first, then direct call update
        try {
          const response = await fetch(`${API_BASE_URL}/pharmacy/medical-request/${requestId}/call/${callResponseId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              status: 'completed',
              duration: callDuration,
              endTime: new Date().toISOString()
            })
          });
          
          const data = await response.json();
          if (!data.success) {
            throw new Error('Medication request call update failed');
          }
        } catch (err) {
          // If medication request update fails, try direct call update
          try {
            await fetch(`${API_BASE_URL}/pharmacy/call/${callResponseId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                status: 'completed',
                duration: callDuration,
                endTime: new Date().toISOString()
              })
            });
          } catch (updateErr) {
            console.error('Failed to update call log:', updateErr);
          }
        }
      }

      setCallStatus('ended');
      onEndCall();
    } catch (error: any) {
      console.error('Error ending call:', error);
      onEndCall();
    }
  };

  if (callType === 'phone') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
        {/* Patient Avatar */}
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6">
          <Avatar className="w-28 h-28">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl">
              {patientName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Patient Info */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{patientName}</h3>
          <p className="text-lg text-gray-600 mb-4">{patientPhone}</p>
          
          {/* Call Status */}
          {callStatus === 'connecting' && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting...</span>
            </div>
          )}
          {callStatus === 'ringing' && (
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <Phone className="w-5 h-5 animate-pulse" />
              <span>Ringing...</span>
            </div>
          )}
          {callStatus === 'active' && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-2xl font-mono font-bold">{formatDuration(callDuration)}</span>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={toggleMute}
            className={`rounded-full w-16 h-16 ${
              isMuted ? 'bg-red-100 border-red-300' : 'bg-gray-100'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button
            size="lg"
            onClick={endCall}
            className="rounded-full w-20 h-20 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-8 h-8" />
          </Button>
        </div>
      </div>
    );
  }

  // Video Call UI
  return (
    <div className="relative w-full h-[600px] bg-black rounded-lg overflow-hidden">
      {/* Remote Video (Main) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {!remoteVideoRef.current?.srcObject && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-4xl">
                {patientName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-bold text-white mb-2">{patientName}</h3>
            {callStatus === 'connecting' && (
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </div>
            )}
            {callStatus === 'ringing' && (
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Phone className="w-5 h-5 animate-pulse" />
                <span>Ringing...</span>
              </div>
            )}
            {callStatus === 'active' && (
              <p className="text-green-400">Call Active</p>
            )}
          </div>
        </div>
      )}

      {/* Local Video (Picture-in-Picture) */}
      {callStatus === 'active' && localVideoRef.current?.srcObject && (
        <div className="absolute bottom-20 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-gray-900">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Call Duration */}
      {callStatus === 'active' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-mono font-bold">{formatDuration(callDuration)}</span>
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleMute}
            size="lg"
            className={`rounded-full ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button
            onClick={toggleVideo}
            size="lg"
            className={`rounded-full ${
              isVideoOff 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>
          
          <Button
            onClick={endCall}
            size="lg"
            className="rounded-full bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

