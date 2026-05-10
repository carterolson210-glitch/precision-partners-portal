import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  User,
  Bell,
  Calculator,
  Calendar,
  Palette,
  Users,
  Link,
  Shield,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Copy,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  ChevronRight,
  Mail,
  Clock,
  MapPin,
  FileText,
  BarChart3,
  Zap,
  Wrench,
  Building,
  Globe,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  MonitorSpeaker,
  Palette as PaletteIcon,
  Type,
  Sidebar,
  Grid3X3,
  Minimize2,
  Maximize2,
  Key,
  Webhook,
  Cloud,
  HardDrive,
  Cookie,
  Lock,
  UserMinus,
  UserPlus,
  Crown,
  ShieldCheck,
  Eye as EyeIcon,
  Edit,
  Trash
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: 'Admin' | 'Engineer' | 'Viewer';
  status: 'Active' | 'Inactive';
  email: string;
}

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Profile & Account
  const [fullName, setFullName] = useState('John Doe');
  const [jobTitle, setJobTitle] = useState('Senior Engineer');
  const [companyName, setCompanyName] = useState('Precision Partners Engineering');
  const [email, setEmail] = useState('john.doe@precisionpartners.com');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState('3 days');
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [calculationAlerts, setCalculationAlerts] = useState(true);
  const [teamActivityNotifications, setTeamActivityNotifications] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState('Real-time');

  // Units & Calculation Defaults
  const [unitSystem, setUnitSystem] = useState<'Imperial' | 'Metric' | 'Mixed'>('Imperial');
  const [defaultLoadType, setDefaultLoadType] = useState('Dead Load');
  const [safetyFactor, setSafetyFactor] = useState(1.5);
  const [decimalPrecision, setDecimalPrecision] = useState(2);
  const [autoSaveCalculations, setAutoSaveCalculations] = useState(true);
  const [defaultMaterial, setDefaultMaterial] = useState('Steel');
  const [showStepByStep, setShowStepByStep] = useState(true);

  // Scheduling & Calendar
  const [calendarView, setCalendarView] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [googleCalendarSync, setGoogleCalendarSync] = useState(false);
  const [outlookSync, setOutlookSync] = useState(false);
  const [appleCalendarSync, setAppleCalendarSync] = useState(false);
  const [defaultAppointmentDuration, setDefaultAppointmentDuration] = useState('1 hr');
  const [bufferTime, setBufferTime] = useState('15 min');
  const [clientSelfScheduling, setClientSelfScheduling] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'System'>('System');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [fontSize, setFontSize] = useState(16);
  const [sidebarLayout, setSidebarLayout] = useState<'Collapsed' | 'Expanded' | 'Auto'>('Auto');
  const [compactMode, setCompactMode] = useState(false);
  const [dashboardWidgets, setDashboardWidgets] = useState({
    loadSummary: true,
    upcomingJobs: true,
    clientList: true,
    recentReports: true
  });

  // Team & Permissions
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Doe', role: 'Admin', status: 'Active', email: 'john.doe@precisionpartners.com' },
    { id: '2', name: 'Jane Smith', role: 'Engineer', status: 'Active', email: 'jane.smith@precisionpartners.com' },
    { id: '3', name: 'Bob Johnson', role: 'Viewer', status: 'Inactive', email: 'bob.johnson@precisionpartners.com' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Engineer' | 'Viewer'>('Engineer');
  const [removeMemberConfirm, setRemoveMemberConfirm] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  // Integrations
  const [apiKey, setApiKey] = useState('sk-1234567890abcdef');
  const [webhookUrl, setWebhookUrl] = useState('https://api.precisionpartners.com/webhook');
  const [connectedApps, setConnectedApps] = useState({
    quickbooks: { connected: true, lastSynced: '2024-01-15 10:30 AM' },
    autocad: { connected: false, lastSynced: null },
    procore: { connected: true, lastSynced: '2024-01-14 3:45 PM' },
    googleDrive: { connected: true, lastSynced: '2024-01-15 9:15 AM' },
    dropbox: { connected: false, lastSynced: null }
  });
  const [exportFormats, setExportFormats] = useState({
    pdf: true,
    excel: true,
    csv: false,
    json: true
  });

  // Data & Privacy
  const [dataRetention, setDataRetention] = useState('3 years');
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });
  const [showDataDeleteModal, setShowDataDeleteModal] = useState(false);
  const [dataDeleteConfirm, setDataDeleteConfirm] = useState('');

  const sections = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'units', label: 'Units & Calculations', icon: Calculator },
    { id: 'scheduling', label: 'Scheduling & Calendar', icon: Calendar },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'team', label: 'Team & Permissions', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'privacy', label: 'Data & Privacy', icon: Shield }
  ];

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSave = (section: string) => {
    // Mock save logic
    toast.success(`${section} settings saved successfully!`);
    setHasUnsavedChanges(false);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    // Mock password change
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    if (deleteAccountConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    // Mock account deletion
    toast.success('Account deletion initiated. You will receive a confirmation email.');
    setShowDeleteModal(false);
    setDeleteAccountConfirm('');
  };

  const handleInviteMember = () => {
    if (!validateEmail(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    // Mock invite
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  const handleRemoveMember = () => {
    if (removeMemberConfirm !== 'REMOVE') {
      toast.error('Please type REMOVE to confirm');
      return;
    }
    if (memberToRemove) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
      toast.success(`${memberToRemove.name} has been removed from the team`);
    }
    setShowRemoveModal(false);
    setRemoveMemberConfirm('');
    setMemberToRemove(null);
  };

  const handleExportData = () => {
    // Mock data export
    toast.success('Data export initiated. You will receive a download link via email.');
  };

  const handleDataDeletion = () => {
    if (dataDeleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    // Mock data deletion
    toast.success('Data deletion request submitted. You will receive a confirmation email.');
    setShowDataDeleteModal(false);
    setDataDeleteConfirm('');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile & Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profilePhoto || undefined} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </div>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setHasUnsavedChanges(true); }}
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title / Role</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => { setJobTitle(e.target.value); setHasUnsavedChanges(true); }}
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => { setCompanyName(e.target.value); setHasUnsavedChanges(true); }}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setHasUnsavedChanges(true); }}
                    className={email && !validateEmail(email) ? 'border-red-500' : ''}
                  />
                  {email && !validateEmail(email) && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPasswords ? 'Hide' : 'Show'} Passwords
                  </Button>
                  <Button onClick={handlePasswordChange}>Change Password</Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => { setTwoFactorEnabled(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 mb-4">
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </p>
                    <div>
                      <Label htmlFor="deleteConfirm">Type "DELETE" to confirm</Label>
                      <Input
                        id="deleteConfirm"
                        value={deleteAccountConfirm}
                        onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                        placeholder="DELETE"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Profile')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => { setEmailNotifications(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications within the app</p>
                </div>
                <Switch
                  id="inAppNotifications"
                  checked={inAppNotifications}
                  onCheckedChange={(checked) => { setInAppNotifications(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div>
                <Label htmlFor="deadlineReminders">Project Deadline Reminders</Label>
                <Select value={deadlineReminders} onValueChange={(value) => { setDeadlineReminders(value); setHasUnsavedChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 day">1 day before</SelectItem>
                    <SelectItem value="3 days">3 days before</SelectItem>
                    <SelectItem value="1 week">1 week before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="appointmentReminders">Client Appointment Reminders</Label>
                  <p className="text-sm text-gray-600">Get reminded about upcoming client appointments</p>
                </div>
                <Switch
                  id="appointmentReminders"
                  checked={appointmentReminders}
                  onCheckedChange={(checked) => { setAppointmentReminders(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="calculationAlerts">Load Calculation Result Alerts</Label>
                  <p className="text-sm text-gray-600">Receive alerts when calculations are completed</p>
                </div>
                <Switch
                  id="calculationAlerts"
                  checked={calculationAlerts}
                  onCheckedChange={(checked) => { setCalculationAlerts(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="teamActivityNotifications">Team Activity Feed Notifications</Label>
                  <p className="text-sm text-gray-600">Get notified about team activities</p>
                </div>
                <Switch
                  id="teamActivityNotifications"
                  checked={teamActivityNotifications}
                  onCheckedChange={(checked) => { setTeamActivityNotifications(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div>
                <Label htmlFor="notificationFrequency">Notification Frequency</Label>
                <Select value={notificationFrequency} onValueChange={(value) => { setNotificationFrequency(value); setHasUnsavedChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Real-time">Real-time</SelectItem>
                    <SelectItem value="Daily digest">Daily digest</SelectItem>
                    <SelectItem value="Weekly summary">Weekly summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Notifications')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'units':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Units & Calculation Defaults
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Default Unit System</Label>
                <div className="flex gap-4 mt-2">
                  {['Imperial', 'Metric', 'Mixed'].map((system) => (
                    <label key={system} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="unitSystem"
                        value={system}
                        checked={unitSystem === system}
                        onChange={(e) => { setUnitSystem(e.target.value as any); setHasUnsavedChanges(true); }}
                      />
                      {system}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="defaultLoadType">Default Load Type</Label>
                <Select value={defaultLoadType} onValueChange={(value) => { setDefaultLoadType(value); setHasUnsavedChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dead Load">Dead Load</SelectItem>
                    <SelectItem value="Live Load">Live Load</SelectItem>
                    <SelectItem value="Wind Load">Wind Load</SelectItem>
                    <SelectItem value="Seismic Load">Seismic Load</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="safetyFactor">Default Safety Factor</Label>
                <Input
                  id="safetyFactor"
                  type="number"
                  step="0.1"
                  value={safetyFactor}
                  onChange={(e) => { setSafetyFactor(parseFloat(e.target.value)); setHasUnsavedChanges(true); }}
                />
              </div>

              <div>
                <Label htmlFor="decimalPrecision">Decimal Precision</Label>
                <Select value={decimalPrecision.toString()} onValueChange={(value) => { setDecimalPrecision(parseInt(value)); setHasUnsavedChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 decimal places</SelectItem>
                    <SelectItem value="3">3 decimal places</SelectItem>
                    <SelectItem value="4">4 decimal places</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSaveCalculations">Auto-save Calculation Results</Label>
                  <p className="text-sm text-gray-600">Automatically save calculation results</p>
                </div>
                <Switch
                  id="autoSaveCalculations"
                  checked={autoSaveCalculations}
                  onCheckedChange={(checked) => { setAutoSaveCalculations(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div>
                <Label htmlFor="defaultMaterial">Default Material</Label>
                <Select value={defaultMaterial} onValueChange={(value) => { setDefaultMaterial(value); setHasUnsavedChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Steel">Steel</SelectItem>
                    <SelectItem value="Concrete">Concrete</SelectItem>
                    <SelectItem value="Timber">Timber</SelectItem>
                    <SelectItem value="Aluminum">Aluminum</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showStepByStep">Show Calculation Step-by-Step Breakdown</Label>
                  <p className="text-sm text-gray-600">Display detailed calculation steps</p>
                </div>
                <Switch
                  id="showStepByStep"
                  checked={showStepByStep}
                  onCheckedChange={(checked) => { setShowStepByStep(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Units & Calculations')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'scheduling':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduling & Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Default Calendar View</Label>
                <div className="flex gap-4 mt-2">
                  {['Day', 'Week', 'Month'].map((view) => (
                    <label key={view} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="calendarView"
                        value={view}
                        checked={calendarView === view}
                        onChange={(e) => { setCalendarView(e.target.value as any); setHasUnsavedChanges(true); }}
                      />
                      {view}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workingHoursStart">Working Hours Start</Label>
                  <Input
                    id="workingHoursStart"
                    type="time"
                    value={workingHoursStart}
                    onChange={(e) => { setWorkingHoursStart(e.target.value); setHasUnsavedChanges(true); }}
                  />
                </div>
                <div>
                  <Label htmlFor="workingHoursEnd">Working Hours End</Label>
                  <Input
                    id="workingHoursEnd"
                    type="time"
                    value={workingHoursEnd}
                    onChange={(e) => { setWorkingHoursEnd(e.target.value); setHasUnsavedChanges(true); }}
                  />
                </div>
              </div>

              <div>
                <Label>Working Days</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <label key={day} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={workingDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWorkingDays([...workingDays, day]);
                          } else {
                            setWorkingDays(workingDays.filter(d => d !== day));
                          }
                          setHasUnsavedChanges(true);
                        }}
                      />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="timeZone">Time Zone</Label>
                <Select value={timeZone} onValueChange={(value) => { setTimeZone(value); setHasUnsavedChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Calendar Sync</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Google Calendar</span>
                    <Switch
                      checked={googleCalendarSync}
                      onCheckedChange={(checked) => { setGoogleCalendarSync(checked); setHasUnsavedChanges(true); }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Outlook</span>
                    <Switch
                      checked={outlookSync}
                      onCheckedChange={(checked) => { setOutlookSync(checked); setHasUnsavedChanges(true); }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Apple Calendar</span>
                    <Switch
                      checked={appleCalendarSync}
                      onCheckedChange={(checked) => { setAppleCalendarSync(checked); setHasUnsavedChanges(true); }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="defaultAppointmentDuration">Default Appointment Duration</Label>
                <Select value={defaultAppointmentDuration} onValueChange={(value) => { setDefaultAppointmentDuration(value); setHasUnsavedChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 min">30 minutes</SelectItem>
                    <SelectItem value="1 hr">1 hour</SelectItem>
                    <SelectItem value="2 hr">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bufferTime">Buffer Time Between Appointments</Label>
                <Select value={bufferTime} onValueChange={(value) => { setBufferTime(value); setHasUnsavedChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="15 min">15 minutes</SelectItem>
                    <SelectItem value="30 min">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="clientSelfScheduling">Client Self-Scheduling</Label>
                  <p className="text-sm text-gray-600">Allow clients to book appointments via a public link</p>
                </div>
                <Switch
                  id="clientSelfScheduling"
                  checked={clientSelfScheduling}
                  onCheckedChange={(checked) => { setClientSelfScheduling(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Scheduling & Calendar')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'appearance':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Theme</Label>
                <div className="flex gap-4 mt-2">
                  {['Light', 'Dark', 'System'].map((themeOption) => (
                    <label key={themeOption} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="theme"
                        value={themeOption}
                        checked={theme === themeOption}
                        onChange={(e) => { setTheme(e.target.value as any); setHasUnsavedChanges(true); }}
                      />
                      {themeOption}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Accent Color</Label>
                <div className="flex gap-2 mt-2">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${accentColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => { setAccentColor(color); setHasUnsavedChanges(true); }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Font Size</Label>
                <div className="mt-2">
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => { setFontSize(value[0]); setHasUnsavedChanges(true); }}
                    max={24}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Small</span>
                    <span>{fontSize}px</span>
                    <span>Large</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Sidebar Layout</Label>
                <div className="flex gap-4 mt-2">
                  {['Collapsed', 'Expanded', 'Auto'].map((layout) => (
                    <label key={layout} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sidebarLayout"
                        value={layout}
                        checked={sidebarLayout === layout}
                        onChange={(e) => { setSidebarLayout(e.target.value as any); setHasUnsavedChanges(true); }}
                      />
                      {layout}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Dashboard Widget Arrangement</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'loadSummary', label: 'Load Summary' },
                    { key: 'upcomingJobs', label: 'Upcoming Jobs' },
                    { key: 'clientList', label: 'Client List' },
                    { key: 'recentReports', label: 'Recent Reports' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span>{label}</span>
                      <Switch
                        checked={dashboardWidgets[key as keyof typeof dashboardWidgets]}
                        onCheckedChange={(checked) => {
                          setDashboardWidgets(prev => ({ ...prev, [key]: checked }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compactMode">Compact Mode</Label>
                  <p className="text-sm text-gray-600">Reduce spacing and padding for a denser layout</p>
                </div>
                <Switch
                  id="compactMode"
                  checked={compactMode}
                  onCheckedChange={(checked) => { setCompactMode(checked); setHasUnsavedChanges(true); }}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Appearance')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'team':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                        <Badge variant="outline">{member.role}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setMemberToRemove(member);
                            setShowRemoveModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Invite New Team Member</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="inviteEmail">Email Address</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="newmember@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inviteRole">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Engineer">Engineer</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleInviteMember}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Role-Based Permissions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Permission</th>
                        <th className="border border-gray-300 p-2 text-center">Admin</th>
                        <th className="border border-gray-300 p-2 text-center">Engineer</th>
                        <th className="border border-gray-300 p-2 text-center">Viewer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        'View Calculations',
                        'Edit Calculations',
                        'Delete Calculations',
                        'View Reports',
                        'Edit Reports',
                        'Delete Reports',
                        'View Schedules',
                        'Edit Schedules',
                        'Delete Schedules',
                        'View Client Data',
                        'Edit Client Data',
                        'Delete Client Data',
                        'Manage Settings'
                      ].map((permission) => (
                        <tr key={permission}>
                          <td className="border border-gray-300 p-2">{permission}</td>
                          <td className="border border-gray-300 p-2 text-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {['View Calculations', 'Edit Calculations', 'View Reports', 'Edit Reports', 'View Schedules', 'Edit Schedules', 'View Client Data'].includes(permission) ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {permission.startsWith('View') ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove Team Member</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to remove {memberToRemove?.name} from the team? This action cannot be undone.
                  </p>
                  <div>
                    <Label htmlFor="removeConfirm">Type "REMOVE" to confirm</Label>
                    <Input
                      id="removeConfirm"
                      value={removeMemberConfirm}
                      onChange={(e) => setRemoveMemberConfirm(e.target.value)}
                      placeholder="REMOVE"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowRemoveModal(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleRemoveMember}>Remove Member</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Team & Permissions')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'integrations':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">API Access</h3>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input value={apiKey.replace(/./g, '*')} readOnly />
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhookUrl"
                      value={webhookUrl}
                      onChange={(e) => { setWebhookUrl(e.target.value); setHasUnsavedChanges(true); }}
                    />
                    <Button>Test</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Connected Apps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'QuickBooks', key: 'quickbooks' },
                    { name: 'AutoCAD', key: 'autocad' },
                    { name: 'Procore', key: 'procore' },
                    { name: 'Google Drive', key: 'googleDrive' },
                    { name: 'Dropbox', key: 'dropbox' }
                  ].map(({ name, key }) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Cloud className="w-8 h-8 text-gray-600" />
                            <div>
                              <p className="font-medium">{name}</p>
                              <p className="text-sm text-gray-600">
                                {connectedApps[key as keyof typeof connectedApps].connected
                                  ? `Last synced: ${connectedApps[key as keyof typeof connectedApps].lastSynced}`
                                  : 'Not connected'
                                }
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={connectedApps[key as keyof typeof connectedApps].connected}
                            onCheckedChange={(checked) => {
                              setConnectedApps(prev => ({
                                ...prev,
                                [key]: { ...prev[key as keyof typeof prev], connected: checked }
                              }));
                              setHasUnsavedChanges(true);
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Export Formats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'pdf', label: 'PDF' },
                    { key: 'excel', label: 'Excel' },
                    { key: 'csv', label: 'CSV' },
                    { key: 'json', label: 'JSON' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportFormats[key as keyof typeof exportFormats]}
                        onChange={(e) => {
                          setExportFormats(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Integrations')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'privacy':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Data Management</h3>
                <Button onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export All My Data
                </Button>
                <p className="text-sm text-gray-600">
                  Download a copy of all your data including calculations, reports, and account information.
                </p>
              </div>

              <div>
                <Label htmlFor="dataRetention">Data Retention Policy</Label>
                <Select value={dataRetention} onValueChange={(value) => { setDataRetention(value); setHasUnsavedChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="3 years">3 years</SelectItem>
                    <SelectItem value="5 years">5 years</SelectItem>
                    <SelectItem value="Indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  How long we keep your data after account deactivation.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cookie Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Essential Cookies</Label>
                      <p className="text-sm text-gray-600">Required for the website to function</p>
                    </div>
                    <Switch
                      checked={cookiePreferences.essential}
                      onCheckedChange={(checked) => {
                        setCookiePreferences(prev => ({ ...prev, essential: checked }));
                        setHasUnsavedChanges(true);
                      }}
                      disabled
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Analytics Cookies</Label>
                      <p className="text-sm text-gray-600">Help us improve our service</p>
                    </div>
                    <Switch
                      checked={cookiePreferences.analytics}
                      onCheckedChange={(checked) => {
                        setCookiePreferences(prev => ({ ...prev, analytics: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Cookies</Label>
                      <p className="text-sm text-gray-600">Used for personalized advertising</p>
                    </div>
                    <Switch
                      checked={cookiePreferences.marketing}
                      onCheckedChange={(checked) => {
                        setCookiePreferences(prev => ({ ...prev, marketing: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-red-600">Data Deletion</h3>
                <Dialog open={showDataDeleteModal} onOpenChange={setShowDataDeleteModal}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Request Data Deletion
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Data Deletion</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 mb-4">
                      This will permanently delete all your data from our servers. This action cannot be undone.
                    </p>
                    <div>
                      <Label htmlFor="dataDeleteConfirm">Type "DELETE" to confirm</Label>
                      <Input
                        id="dataDeleteConfirm"
                        value={dataDeleteConfirm}
                        onChange={(e) => setDataDeleteConfirm(e.target.value)}
                        placeholder="DELETE"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowDataDeleteModal(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDataDeletion}>Delete Data</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <p className="text-sm text-gray-600">
                  Permanently delete all your data and account information.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Privacy Policy</h3>
                <p className="text-sm text-gray-600">
                  Last updated: January 15, 2024
                </p>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View Privacy Policy
                </Button>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Data & Privacy')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" />
                Settings
              </h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {hasUnsavedChanges && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800">You have unsaved changes</span>
              </div>
            )}
            {renderSection()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;