import { useState } from 'react';
import { Settings, User, Bell, Lock, LogOut, ChevronRight, Moon, Volume2 } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Button, Input, Modal } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card variant="bordered" padding="lg" className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
      <p className="text-sm text-[#a1a1aa] mb-4">{description}</p>
      {children}
    </Card>
  );
}

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors',
        enabled ? 'bg-[#8b5cf6]' : 'bg-[#2a2a2a]'
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
          enabled ? 'left-6' : 'left-1'
        )}
      />
    </button>
  );
}

function SettingsPage() {
  const { user, logout } = useAuth();
  const { success, error } = useToast();

  const [settings, setSettings] = useState({
    soundEffects: true,
    notifications: true,
    darkMode: true,
    showWpmLive: true,
    showAccuracyLive: true,
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    success('Setting updated');
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }
    success('Password changed successfully');
    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call the API
    logout();
    success('Account deleted');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#8b5cf6]" />
            Settings
          </h1>
          <p className="text-[#a1a1aa] mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Section */}
        <SettingsSection title="Profile" description="Update your personal information">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f]">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm font-medium text-white">Username</p>
                  <p className="text-sm text-[#a1a1aa]">{user?.username}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a]" />
            </div>
          </div>
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences" description="Customize your typing experience">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f]">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm font-medium text-white">Sound Effects</p>
                  <p className="text-sm text-[#a1a1aa]">Play sounds for key presses and events</p>
                </div>
              </div>
              <Toggle
                enabled={settings.soundEffects}
                onChange={() => handleToggle('soundEffects')}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f]">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm font-medium text-white">Notifications</p>
                  <p className="text-sm text-[#a1a1aa]">Receive notifications for achievements</p>
                </div>
              </div>
              <Toggle
                enabled={settings.notifications}
                onChange={() => handleToggle('notifications')}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f]">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm font-medium text-white">Dark Mode</p>
                  <p className="text-sm text-[#a1a1aa]">Use dark theme (always on)</p>
                </div>
              </div>
              <Toggle
                enabled={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Typing Display Section */}
        <SettingsSection title="Typing Display" description="Customize what you see during typing sessions">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f]">
              <div>
                <p className="text-sm font-medium text-white">Show WPM Live</p>
                <p className="text-sm text-[#a1a1aa]">Display real-time WPM during typing</p>
              </div>
              <Toggle
                enabled={settings.showWpmLive}
                onChange={() => handleToggle('showWpmLive')}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f]">
              <div>
                <p className="text-sm font-medium text-white">Show Accuracy Live</p>
                <p className="text-sm text-[#a1a1aa]">Display real-time accuracy during typing</p>
              </div>
              <Toggle
                enabled={settings.showAccuracyLive}
                onChange={() => handleToggle('showAccuracyLive')}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection title="Security" description="Manage your account security">
          <div className="space-y-4">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#71717a]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Change Password</p>
                  <p className="text-sm text-[#a1a1aa]">Update your password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a]" />
            </button>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title="Danger Zone" description="Irreversible actions">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
              <div>
                <p className="text-sm font-medium text-white">Delete Account</p>
                <p className="text-sm text-[#a1a1aa]">Permanently delete your account and all data</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                Delete
              </Button>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-[#ef4444]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-[#ef4444]">Log Out</p>
                  <p className="text-sm text-[#a1a1aa]">Sign out of your account</p>
                </div>
              </div>
            </button>
          </div>
        </SettingsSection>

        {/* Change Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Change Password"
        >
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setIsPasswordModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Account"
        >
          <div className="space-y-4">
            <p className="text-[#a1a1aa]">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}

export { SettingsPage };
