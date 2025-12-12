import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import RequestChat from '@/components/RequestChat';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function MedicationRequestChatPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const pharmacyId = searchParams.get('pharmacyId') || '';
  const patientId = user?.id || user?._id || '';

  if (!requestId || !pharmacyId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Missing required parameters. Please go back and try again.</p>
            <Button onClick={() => navigate('/medication-request')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <RequestChat
        medicalRequestId={requestId}
        pharmacyId={pharmacyId}
        patientId={patientId}
        onClose={() => navigate('/medication-request')}
      />
    </div>
  );
}

