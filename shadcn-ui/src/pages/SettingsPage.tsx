import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Trash2,
  Save,
  User,
  Key,
  Smartphone as Phone,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'light' as 'light' | 'dark' | 'auto',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    language: 'en',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    medicationReminders: true,
    appointmentReminders: true,
    vitalAlerts: true,
    
    // Privacy & Security
    twoFactorAuth: false,
    dataSharing: false,
    analytics: true,
    locationTracking: false,
    
    // App Preferences
    autoSync: true,
    offlineMode: false,
    soundEffects: true,
    hapticFeedback: true,
    
    // Data Management
    autoBackup: true,
    backupFrequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    dataRetention: '1year' as '6months' | '1year' | '2years' | 'forever'
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    // Here you would typically make an API call to change the password
    alert('Password changed successfully');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
  };

  const exportData = () => {
    // Here you would typically generate and download user data
    alert('Data export started. You will receive an email when ready.');
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Type "DELETE" to confirm.')) {
        // Here you would typically make an API call to delete the account
        alert('Account deletion initiated. You will receive a confirmation email.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and privacy settings</p>
        </div>
        <Button onClick={() => {/* Save all settings */}} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Theme</Label>
                  <p className="text-sm text-gray-500">Choose your preferred theme</p>
                </div>
                <Select value={settings.theme} onValueChange={(value: any) => updateSetting('theme', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="w-4 h-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="w-4 h-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="auto">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4" />
                        <span>Auto</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Font Size</Label>
                  <p className="text-sm text-gray-500">Adjust text size for better readability</p>
                </div>
                <Select value={settings.fontSize} onValueChange={(value: any) => updateSetting('fontSize', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Language</Label>
                  <p className="text-sm text-gray-500">Select your preferred language</p>
                </div>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Medication Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminded to take your medications</p>
                </div>
                <Switch
                  checked={settings.medicationReminders}
                  onCheckedChange={(checked) => updateSetting('medicationReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminded about upcoming appointments</p>
                </div>
                <Switch
                  checked={settings.appointmentReminders}
                  onCheckedChange={(checked) => updateSetting('appointmentReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Vital Alerts</Label>
                  <p className="text-sm text-gray-500">Get alerts for abnormal vital readings</p>
                </div>
                <Switch
                  checked={settings.vitalAlerts}
                  onCheckedChange={(checked) => updateSetting('vitalAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Security Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Data Sharing</Label>
                  <p className="text-sm text-gray-500">Allow sharing of anonymized data for research</p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => updateSetting('dataSharing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Analytics</Label>
                  <p className="text-sm text-gray-500">Help improve the app by sharing usage analytics</p>
                </div>
                <Switch
                  checked={settings.analytics}
                  onCheckedChange={(checked) => updateSetting('analytics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Location Tracking</Label>
                  <p className="text-sm text-gray-500">Allow the app to access your location</p>
                </div>
                <Switch
                  checked={settings.locationTracking}
                  onCheckedChange={(checked) => updateSetting('locationTracking', checked)}
                />
              </div>

              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                App Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Sync</Label>
                  <p className="text-sm text-gray-500">Automatically sync data across devices</p>
                </div>
                <Switch
                  checked={settings.autoSync}
                  onCheckedChange={(checked) => updateSetting('autoSync', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Offline Mode</Label>
                  <p className="text-sm text-gray-500">Enable offline functionality</p>
                </div>
                <Switch
                  checked={settings.offlineMode}
                  onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-gray-500">Play sounds for app interactions</p>
                </div>
                <Switch
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Haptic Feedback</Label>
                  <p className="text-sm text-gray-500">Vibrate on touch interactions</p>
                </div>
                <Switch
                  checked={settings.hapticFeedback}
                  onCheckedChange={(checked) => updateSetting('hapticFeedback', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-gray-500">Automatically backup your data</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Backup Frequency</Label>
                  <p className="text-sm text-gray-500">How often to backup your data</p>
                </div>
                <Select value={settings.backupFrequency} onValueChange={(value: any) => updateSetting('backupFrequency', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Data Retention</Label>
                  <p className="text-sm text-gray-500">How long to keep your data</p>
                </div>
                <Select value={settings.dataRetention} onValueChange={(value: any) => updateSetting('dataRetention', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t space-y-3">
                <Button variant="outline" onClick={exportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                <Button variant="destructive" onClick={deleteAccount} className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange} className="flex-1">
                  Change Password
                </Button>
                <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
