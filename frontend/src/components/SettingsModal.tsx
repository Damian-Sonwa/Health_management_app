import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  X,
  Camera,
  Save,
  Moon,
  Sun
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserPreferences {
  language: string;
  theme: string;
  fontSize: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    reminders: boolean;
  };
  privacy: {
    shareHealthData: boolean;
    showOnlineStatus: boolean;
    allowDataAnalytics: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
  };
  reminderSound: string;
  timezone: string;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    theme: 'light',
    fontSize: 'medium',
    notifications: {
      email: true,
      push: true,
      sms: false,
      reminders: true
    },
    privacy: {
      shareHealthData: false,
      showOnlineStatus: true,
      allowDataAnalytics: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false
    },
    reminderSound: 'bell',
    timezone: 'UTC'
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/preferences`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        setPreferences(result.data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (updates: Partial<UserPreferences>) => {
    try {
      const response = await fetch(`${API_BASE}/preferences`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const result = await response.json();
        setPreferences(result.data);
        
        // Apply theme changes immediately
        if (updates.theme) {
          applyTheme(updates.theme);
        }
        if (updates.fontSize) {
          applyFontSize(updates.fontSize);
        }
        
        alert('Preferences updated successfully!');
      } else {
        alert('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Error updating preferences');
    }
  };

  const applyTheme = (theme: string) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const applyFontSize = (fontSize: string) => {
    const root = document.documentElement;
    const sizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.fontSize = sizeMap[fontSize as keyof typeof sizeMap] || '16px';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-gray-500" />
              Settings & Preferences
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="/images/PatientAvatar.jpg" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Sarah Johnson</h3>
                    <p className="text-gray-600">Patient ID: #12345</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Sarah" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Johnson" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="sarah.johnson@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" defaultValue="1989-05-15" />
                  </div>
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Input id="bloodType" defaultValue="A+" />
                  </div>
                </div>
                
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked) => updatePreference({ 
                        notifications: { ...preferences.notifications, email: checked } 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Browser and mobile notifications</p>
                    </div>
                    <Switch 
                      id="push-notifications" 
                      checked={preferences.notifications.push}
                      onCheckedChange={(checked) => updatePreference({ 
                        notifications: { ...preferences.notifications, push: checked } 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Text message alerts</p>
                    </div>
                    <Switch 
                      id="sms-notifications" 
                      checked={preferences.notifications.sms}
                      onCheckedChange={(checked) => updatePreference({ 
                        notifications: { ...preferences.notifications, sms: checked } 
                      })}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Health Reminders</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="medication-reminders">Medication Reminders</Label>
                        <p className="text-sm text-gray-600">Daily medication alerts</p>
                      </div>
                      <Switch 
                        id="medication-reminders" 
                        checked={preferences.notifications.reminders}
                        onCheckedChange={(checked) => updatePreference({ 
                          notifications: { ...preferences.notifications, reminders: checked } 
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                        <p className="text-sm text-gray-600">Upcoming appointment alerts</p>
                      </div>
                      <Switch 
                        id="appointment-reminders" 
                        checked={preferences.notifications.reminders}
                        onCheckedChange={(checked) => updatePreference({ 
                          notifications: { ...preferences.notifications, reminders: checked } 
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="vitals-reminders">Vitals Check Reminders</Label>
                        <p className="text-sm text-gray-600">Regular health monitoring alerts</p>
                      </div>
                      <Switch 
                        id="vitals-reminders" 
                        checked={preferences.notifications.reminders}
                        onCheckedChange={(checked) => updatePreference({ 
                          notifications: { ...preferences.notifications, reminders: checked } 
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {preferences.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <div>
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-gray-600">Toggle dark theme</p>
                    </div>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={preferences.theme === 'dark'}
                    onCheckedChange={(checked) => {
                      updatePreference({ theme: checked ? 'dark' : 'light' });
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={preferences.language}
                    onValueChange={(value) => updatePreference({ language: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select 
                    value={preferences.fontSize}
                    onValueChange={(value) => updatePreference({ fontSize: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={preferences.timezone}
                    onValueChange={(value) => updatePreference({ timezone: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (EST)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CST)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-sharing">Data Sharing</Label>
                      <p className="text-sm text-gray-600">Allow sharing health data with care team</p>
                    </div>
                    <Switch id="data-sharing" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Analytics</Label>
                      <p className="text-sm text-gray-600">Help improve the platform with usage data</p>
                    </div>
                    <Switch id="analytics" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">Marketing Communications</Label>
                      <p className="text-sm text-gray-600">Receive health tips and product updates</p>
                    </div>
                    <Switch id="marketing" />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Account Security</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Enable Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}