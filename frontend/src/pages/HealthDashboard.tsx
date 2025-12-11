import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  Heart, 
  Activity, 
  Pill, 
  FileText, 
  Plus,
  TrendingUp,
  Upload,
  Eye,
  Bell,
  Edit,
  Trash2,
  X,
  Loader2,
  Download,
  ExternalLink,
  Phone,
  Video,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useAppointments } from '@/hooks/useAppointments';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useNotifications } from '@/hooks/useNotifications';
import { useMedications } from '@/hooks/useMedications';
import { useVitals } from '@/hooks/useVitals';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { BackendHealthCheck } from '@/components/BackendHealthCheck';
import { toast } from 'sonner';

type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

const RECORD_TYPE_OPTIONS = [
  { value: 'document', label: 'Medical Document' },
  { value: 'lab_result', label: 'Lab Result' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'imaging', label: 'Imaging Report' },
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'surgery', label: 'Surgery Record' },
  { value: 'vaccination', label: 'Vaccination Record' },
  { value: 'allergy', label: 'Allergy Record' },
];

const DEFAULT_UPLOAD_FORM = {
  type: RECORD_TYPE_OPTIONS[0].value,
  title: '',
  description: '',
  doctorName: '',
  fileUrl: '',
  fileName: '',
};

const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'medication_reminder', label: 'Medication Reminder' },
  { value: 'appointment_reminder', label: 'Appointment Reminder' },
  { value: 'vital_check', label: 'Vital Check' },
  { value: 'goal_reminder', label: 'Goal Reminder' },
  { value: 'system', label: 'System Alert' },
  { value: 'achievement', label: 'Achievement' },
];

const DEFAULT_NOTIFICATION_FORM = {
  type: NOTIFICATION_TYPE_OPTIONS[0].value,
  title: '',
  message: '',
  scheduledFor: '',
  priority: 'medium' as NotificationPriority,
};

export default function HealthDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Real-time updates hook
  const { isConnected, isUpdating, refreshData } = useRealtimeUpdates();
  
  // React Query hooks
  const { stats, visualizations, isLoading: isDashboardLoading, refetchStats } = useDashboard();
  const { appointments, isLoading: isAppointmentsLoading, refetch: refetchAppointments } = useAppointments();
  const { healthRecords, createHealthRecord, deleteHealthRecord, isCreating: isCreatingRecord, refetch: refetchHealthRecords } = useHealthRecords();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, createNotification, isCreating: isCreatingNotification, refetch: refetchNotifications } = useNotifications();
  const { medications, isLoading: isMedicationsLoading, refetch: refetchMedications } = useMedications();
  const { vitals, isLoading: isVitalsLoading, refetch: refetchVitals } = useVitals();
  
  // Upload dialog states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState(() => ({ ...DEFAULT_UPLOAD_FORM }));

  // Notification dialog state
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState(() => ({ ...DEFAULT_NOTIFICATION_FORM }));
  
  // View record dialog
  const [viewingRecord, setViewingRecord] = useState<any | null>(null);

  const resolveRecordFileUrl = (fileUrl?: string) => {
    if (!fileUrl) return '';
    if (/^https?:\/\//i.test(fileUrl)) {
      return fileUrl;
    }
    const trimmed = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    try {
      const base = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
      return base ? new URL(trimmed, base).href : fileUrl;
    } catch {
      return fileUrl;
    }
  };

  const getFileExtension = (fileName?: string) => {
    if (!fileName) return '';
    const match = fileName.split('.').pop();
    return match ? match.toLowerCase() : '';
  };

  const renderRecordPreview = (record: any) => {
    if (!record?.fileUrl && !record?.fileName) {
      return null;
    }

    const resolvedUrl = resolveRecordFileUrl(record.fileUrl);
    if (!resolvedUrl) {
      return (
        <p className="mt-4 text-sm text-gray-500">
          No file preview available for this record.
        </p>
      );
    }

    const extension = getFileExtension(record.fileName || record.fileUrl);
    const fileType = record.fileType?.toLowerCase() || '';

    const isImage =
      fileType.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension);
    const isPdf = fileType === 'application/pdf' || extension === 'pdf';
    const isOffice =
      ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension) ||
      ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(fileType);
    const isText =
      fileType.startsWith('text/') ||
      ['txt', 'csv', 'json', 'md', 'log'].includes(extension);

    let previewNode = (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        Preview unavailable. You can open or download the file instead.
      </div>
    );

    if (isImage) {
      previewNode = (
        <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
          <img
            src={resolvedUrl}
            alt={record.title || record.fileName || 'Health record image'}
            className="w-full object-contain max-h-[400px] bg-gray-50"
          />
        </div>
      );
    } else if (isPdf) {
      previewNode = (
        <iframe
          title={record.title || 'PDF preview'}
          src={`${resolvedUrl}#toolbar=1`}
          className="w-full h-[420px] rounded-lg border border-gray-200 bg-white"
        />
      );
    } else if (isOffice) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resolvedUrl)}`;
      previewNode = (
        <iframe
          title={record.title || 'Document preview'}
          src={officeViewerUrl}
          className="w-full h-[420px] rounded-lg border border-gray-200 bg-white"
        />
      );
    } else if (isText) {
      previewNode = (
        <iframe
          title={record.title || 'Document preview'}
          src={resolvedUrl}
          className="w-full h-[320px] rounded-lg border border-gray-200 bg-white"
        />
      );
    }

    return (
      <div className="mt-4 space-y-4">
        {previewNode}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(resolvedUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in new tab
          </Button>
          <Button variant="default" asChild>
            <a href={resolvedUrl} download={record.fileName || record.title || 'health-record'} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
      </div>
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // In a production app, you would upload to cloud storage (AWS S3, Firebase, etc.)
      // For now, we'll store file metadata
      setUploadFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileUrl: `uploads/${file.name}` // Placeholder URL
      }));
    }
  };

  const handleUploadHealthRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedType = RECORD_TYPE_OPTIONS.some((option) => option.value === uploadFormData.type)
        ? uploadFormData.type
        : DEFAULT_UPLOAD_FORM.type;

      const { doctorName, ...rest } = uploadFormData;
      const payload = {
        ...rest,
        type: normalizedType,
        ...(doctorName ? { doctor_name: doctorName } : {}),
        date: new Date(),
        fileSize: selectedFile?.size || 0,
        fileType: selectedFile?.type || 'application/octet-stream'
      };

      // In production, upload file to cloud storage first and get the URL
      // For now, we'll use the file name as reference
      await createHealthRecord(payload);
      
      toast.success('✅ Health record uploaded successfully!');
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadFormData(() => ({ ...DEFAULT_UPLOAD_FORM }));
    } catch (error: any) {
      toast.error('❌ Failed to upload health record: ' + error.message);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isValidType = NOTIFICATION_TYPE_OPTIONS.some((option) => option.value === newNotification.type);
      const notificationPayload: Record<string, any> = {
        type: isValidType ? newNotification.type : DEFAULT_NOTIFICATION_FORM.type,
        title: newNotification.title,
        message: newNotification.message,
        priority: newNotification.priority,
      };

      if (newNotification.scheduledFor) {
        notificationPayload.scheduledFor = new Date(newNotification.scheduledFor);
      }

      await createNotification(notificationPayload);
      
      toast.success('Reminder created successfully!');
      setIsNotificationDialogOpen(false);
      setNewNotification(() => ({ ...DEFAULT_NOTIFICATION_FORM }));
    } catch (error: any) {
      toast.error('Failed to create reminder: ' + error.message);
    }
  };

  const handleDeleteHealthRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this health record?')) return;
    try {
      await deleteHealthRecord(id);
      toast.success('Health record deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete health record: ' + error.message);
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error: any) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (error: any) {
      toast.error('Failed to delete notification');
    }
  };

  const isLoading = isDashboardLoading || isAppointmentsLoading || isMedicationsLoading || isVitalsLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // Calculate stats from actual data
  const upcomingAppointmentsList = appointments?.slice(0, 3) || [];
  const activePrescriptions = medications?.filter((m: any) => m.isActive).length || 0;
  const recentVitals = vitals?.slice(0, 5) || [];
  
  // Debug logging
  console.log('📊 Dashboard Data:');
  console.log('  - Total Medications:', medications?.length || 0);
  console.log('  - Active Medications:', activePrescriptions);
  console.log('  - Total Vitals:', vitals?.length || 0);
  console.log('  - Total Appointments:', appointments?.length || 0);
  console.log('  - Upcoming Appointments:', upcomingAppointmentsList.length);
  console.log('  - Total Health Records:', healthRecords?.length || 0);
  console.log('  - Medications data:', medications);
  console.log('  - Vitals data:', vitals);
  console.log('  - Appointments data:', appointments);
  console.log('  - Health Records data:', healthRecords);

  return (
    <>
      <BackendHealthCheck />
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's your health overview for today</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-teal-500 dark:border-teal-400 shadow-lg">
              <AvatarImage 
                src={user?.profile?.profilePicture || user?.avatar_url} 
                alt={user?.name || 'User'} 
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {/* Live indicator */}
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse shadow-lg"></span>
          </div>
        </div>
      </div>

      {/* Primary Monitoring Cards - Blood Pressure & Glucose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Blood Pressure Card */}
        <Card className="border-2 border-red-200 hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-red-50 to-white" onClick={() => navigate('/vitals')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Heart className="w-6 h-6" />
              Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const latestBP = vitals?.find((v: any) => v.type === 'blood_pressure_systolic');
              const latestDiastolic = vitals?.find((v: any) => v.type === 'blood_pressure_diastolic');
              return latestBP && latestDiastolic ? (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-800">
                    {Math.round(latestBP.value)}/{Math.round(latestDiastolic.value)}
                    <span className="text-lg text-gray-600 ml-2">mmHg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {latestBP.value > 140 || latestDiastolic.value > 90 ? (
                      <Badge className="bg-red-100 text-red-700">High</Badge>
                    ) : latestBP.value < 90 || latestDiastolic.value < 60 ? (
                      <Badge className="bg-yellow-100 text-yellow-700">Low</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">Normal</Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(latestBP.recordedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="text-lg">No readings yet</p>
                  <Button size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); navigate('/vitals'); }}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Reading
                  </Button>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Blood Glucose Card */}
        <Card className="border-2 border-green-200 hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-green-50 to-white" onClick={() => navigate('/vitals')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Activity className="w-6 h-6" />
              Blood Glucose
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const latestGlucose = vitals?.find((v: any) => v.type === 'blood_sugar');
              return latestGlucose ? (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-800">
                    {Math.round(latestGlucose.value)}
                    <span className="text-lg text-gray-600 ml-2">mg/dL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {latestGlucose.value > 140 ? (
                      <Badge className="bg-red-100 text-red-700">High</Badge>
                    ) : latestGlucose.value < 70 ? (
                      <Badge className="bg-yellow-100 text-yellow-700">Low</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">Normal</Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(latestGlucose.recordedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="text-lg">No readings yet</p>
                  <Button size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); navigate('/vitals'); }}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Reading
                  </Button>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer relative" onClick={() => navigate('/vitals')}>
          {isUpdating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Vital Readings</p>
                <p className="text-3xl font-bold text-gray-800">{vitals?.length || 0}</p>
                <p className="text-xs text-gray-500">(all time)</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer relative" onClick={() => navigate('/appointments')}>
          {isUpdating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">All Appointments</p>
                <p className="text-3xl font-bold text-gray-800">{appointments?.length || 0}</p>
                <p className="text-xs text-gray-500">({upcomingAppointmentsList.length} upcoming)</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer relative" onClick={() => navigate('/medications')}>
          {isUpdating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Medications</p>
                <p className="text-3xl font-bold text-gray-800">{medications?.length || 0}</p>
                <p className="text-xs text-gray-500">({activePrescriptions} active)</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-full">
                <Pill className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer relative" onClick={() => {
          // Scroll to health records upload section
          const uploadSection = document.getElementById('health-records-section');
          if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}>
          {isUpdating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Health Records</p>
                <p className="text-3xl font-bold text-gray-800">{healthRecords?.length || 0}</p>
                <p className="text-xs text-gray-500">(click to upload)</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {visualizations && visualizations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Health Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={visualizations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visualizations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Upcoming Appointments
            </CardTitle>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-purple-500"
              onClick={() => navigate('/appointments')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingAppointmentsList.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointmentsList.map((appointment: any) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-blue-100 rounded-full">
                      {appointment.type === 'video' || appointment.communicationMethod === 'video' ? (
                        <Video className="w-5 h-5 text-blue-600" />
                      ) : appointment.type === 'phone' || appointment.communicationMethod === 'phone' ? (
                        <Phone className="w-5 h-5 text-green-600" />
                      ) : appointment.type === 'chat' || appointment.communicationMethod === 'chat' ? (
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Calendar className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{appointment.doctorName}</h4>
                      <p className="text-sm text-gray-600">{appointment.doctorSpecialty || appointment.specialty || appointment.appointmentType}</p>
                      <Badge className={`mt-1 ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'scheduled' ? 'Pending' : 
                         appointment.status === 'confirmed' ? 'Confirmed' :
                         appointment.status === 'cancelled' ? 'Declined' :
                         appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">{appointment.appointmentTime || 'Time TBD'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming appointments</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/appointments')}
              >
                Book Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Records & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Records */}
        <Card id="health-records-section">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-600" />
                Health Records
              </CardTitle>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-orange-500 to-red-500"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {healthRecords && healthRecords.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {healthRecords.slice(0, 5).map((record: any) => (
                  <div key={record._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{record.title}</h4>
                      <p className="text-sm text-gray-600">{record.type} • {new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingRecord(record)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteHealthRecord(record._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No health records yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-purple-600" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => markAllAsRead()}
                >
                  Mark All Read
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                  onClick={() => setIsNotificationDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.slice(0, 5).map((notification: any) => (
                  <div 
                    key={notification._id} 
                    className={`flex items-start justify-between p-3 rounded-lg transition-colors ${
                      notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex-1" onClick={() => !notification.isRead && handleMarkNotificationAsRead(notification._id)}>
                      <h4 className={`font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.scheduledFor && new Date(notification.scheduledFor).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNotification(notification._id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Health Record Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Health Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadHealthRecord} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="record-type">Record Type*</Label>
              <Select 
                value={uploadFormData.type}
                onValueChange={(value) => setUploadFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="record-title">Title*</Label>
              <Input
                id="record-title"
                placeholder="e.g., Blood Test Results"
                value={uploadFormData.title}
                onChange={(e) => setUploadFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="record-description">Description</Label>
              <Textarea
                id="record-description"
                placeholder="Add any notes..."
                value={uploadFormData.description}
                onChange={(e) => setUploadFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor-name">Doctor Name</Label>
              <Input
                id="doctor-name"
                placeholder="Dr. Smith"
                value={uploadFormData.doctorName}
                onChange={(e) => setUploadFormData((prev) => ({ ...prev, doctorName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File*</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  required
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB)
              </p>
            </div>

            <DialogFooter>
              <Button 
                type="submit"
                disabled={!uploadFormData.title || !selectedFile || isCreatingRecord}
                className="w-full"
              >
                {isCreatingRecord ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Record'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Health Record Dialog */}
      {viewingRecord && (
        <Dialog open={!!viewingRecord} onOpenChange={() => setViewingRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{viewingRecord.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Type</p>
                <p className="text-sm text-gray-600">{viewingRecord.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-sm text-gray-600">{new Date(viewingRecord.date).toLocaleDateString()}</p>
              </div>
              {viewingRecord.doctorName && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Doctor</p>
                  <p className="text-sm text-gray-600">{viewingRecord.doctorName}</p>
                </div>
              )}
              {viewingRecord.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Description</p>
                  <p className="text-sm text-gray-600">{viewingRecord.description}</p>
                </div>
              )}
            </div>
            {renderRecordPreview(viewingRecord)}
          </DialogContent>
        </Dialog>
      )}

      {/* Create Notification Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Reminder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNotification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type*</Label>
              <Select
                value={newNotification.type}
                onValueChange={(value) => setNewNotification((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="notification-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-title">Title*</Label>
              <Input
                id="notification-title"
                placeholder="Take medication"
                value={newNotification.title}
                onChange={(e) => setNewNotification((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-message">Message*</Label>
              <Textarea
                id="notification-message"
                placeholder="Remember to take your morning pills"
                value={newNotification.message}
                onChange={(e) => setNewNotification((prev) => ({ ...prev, message: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-time">Schedule For</Label>
              <Input
                id="notification-time"
                type="datetime-local"
                value={newNotification.scheduledFor}
                onChange={(e) => setNewNotification((prev) => ({ ...prev, scheduledFor: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-priority">Priority</Label>
              <Select 
                value={newNotification.priority}
                onValueChange={(value) => setNewNotification((prev) => ({ ...prev, priority: value as NotificationPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button 
                type="submit"
                disabled={!newNotification.title || !newNotification.message || isCreatingNotification}
                className="w-full"
              >
                {isCreatingNotification ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Reminder'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
