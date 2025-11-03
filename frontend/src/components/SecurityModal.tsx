import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Lock, 
  Eye, 
  Smartphone, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Globe,
  Clock,
  MapPin
} from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const securityEvents = [
  {
    id: 1,
    type: 'login',
    description: 'Successful login from Chrome on Windows',
    location: 'New York, NY',
    timestamp: '2 hours ago',
    status: 'success'
  },
  {
    id: 2,
    type: 'password_change',
    description: 'Password changed successfully',
    location: 'New York, NY',
    timestamp: '3 days ago',
    status: 'success'
  },
  {
    id: 3,
    type: 'failed_login',
    description: 'Failed login attempt',
    location: 'Unknown location',
    timestamp: '1 week ago',
    status: 'warning'
  }
];

export default function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-green-500" />
              Security & Privacy Center
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Security Status Overview */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500 rounded-full">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Account Security Status</h3>
                    <p className="text-green-600">Your account is well protected</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                  Excellent
                </Badge>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium text-green-800">2FA Enabled</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium text-green-800">Strong Password</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium text-green-800">Secure Sessions</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium text-green-800">Data Encrypted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Authentication Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-gray-600">Last changed 3 days ago</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    Change
                  </Button>
                </div>
                
                {showPasswordForm && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                        Update Password
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPasswordForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">
                        {twoFactorEnabled ? 'Enabled via SMS' : 'Not enabled'}
                      </p>
                    </div>
                  </div>
                  <Badge className={twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {twoFactorEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Recovery Codes
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Data Sharing Permissions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Healthcare Providers</span>
                      <Badge className="bg-green-100 text-green-800">Allowed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Family Members</span>
                      <Badge className="bg-green-100 text-green-800">Allowed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Research Studies</span>
                      <Badge className="bg-red-100 text-red-800">Denied</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Data Retention</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Your health data is stored securely and retained according to medical record requirements.
                  </p>
                  <Button variant="outline" size="sm">
                    Download My Data
                  </Button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Account Deletion</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Permanently delete your account and all associated data.
                  </p>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Security Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      event.status === 'success' ? 'bg-green-100' :
                      event.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {event.status === 'success' ? (
                        <CheckCircle className={`w-4 h-4 ${
                          event.status === 'success' ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{event.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    {event.status === 'warning' && (
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}