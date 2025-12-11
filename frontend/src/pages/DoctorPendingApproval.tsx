import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Stethoscope } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';

export default function DoctorPendingApproval() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      navigate('/auth', { replace: true });
      return;
    }

    // Check approval status periodically
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = user?.id || user?._id;
        if (!userId) return;

        const response = await fetch(`${API_BASE_URL}/doctors?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          const doctor = data.data[0];
          if (doctor.status === 'approved') {
            navigate('/doctor-dashboard', { replace: true });
          } else if (doctor.status === 'rejected') {
            navigate('/doctor/rejected', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000); // Check every 3 seconds for faster response
    return () => clearInterval(interval);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pending Admin Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <Stethoscope className="w-12 h-12 mx-auto text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Your Doctor Account is Under Review</h3>
            <p className="text-gray-600">
              Thank you for completing the onboarding process. Your doctor registration is currently being reviewed by our admin team.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-green-800">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1 text-left list-disc list-inside">
              <li>Our admin team will review your registration</li>
              <li>You'll receive access to your dashboard once approved</li>
              <li>You'll appear in appointment booking dropdowns after approval</li>
              <li>This page will automatically update when your status changes</li>
            </ul>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500">
              This page will automatically refresh. You can also check back later.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

