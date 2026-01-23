import { useState } from 'react';
import { User, Mail, Calendar, Gauge, Target, Clock, Trophy, Edit2, Camera } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Button, Avatar, Badge, Input, Modal, Progress } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { mockAchievements, formatDate, formatTime } from '@/lib/utils';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { success } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  if (!user) return null;

  const handleSaveProfile = () => {
    updateUser({
      username: editForm.username,
      email: editForm.email,
    });
    setIsEditModalOpen(false);
    success('Profile updated successfully!');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card variant="bordered" padding="lg" className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar name={user.username} size="xl" className="w-24 h-24 text-2xl" />
              <button className="absolute bottom-0 right-0 p-2 bg-[#8b5cf6] rounded-full hover:bg-[#7c3aed] transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                <Badge variant="primary">Pro Typer</Badge>
              </div>
              <div className="flex flex-col md:flex-row gap-4 text-sm text-[#a1a1aa]">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(user.createdAt)}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              leftIcon={<Edit2 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
                <Gauge className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{user.stats.avgWpm}</p>
                <p className="text-xs text-[#a1a1aa]">Avg WPM</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22c55e]/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{user.stats.avgAccuracy}%</p>
                <p className="text-xs text-[#a1a1aa]">Accuracy</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{user.stats.bestWpm}</p>
                <p className="text-xs text-[#a1a1aa]">Best WPM</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{user.stats.totalSessions}</p>
                <p className="text-xs text-[#a1a1aa]">Sessions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <Card variant="bordered" padding="lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#f59e0b]" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  achievement.unlockedAt
                    ? 'bg-[#22c55e]/5 border-[#22c55e]/20'
                    : 'bg-[#1a1a1a] border-[#2a2a2a] opacity-60'
                }`}
              >
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{achievement.name}</h3>
                  <p className="text-sm text-[#a1a1aa]">{achievement.description}</p>
                  {achievement.progress !== undefined && !achievement.unlockedAt && (
                    <div className="mt-2">
                      <Progress
                        value={achievement.progress}
                        max={achievement.maxProgress}
                        size="sm"
                      />
                      <p className="text-xs text-[#71717a] mt-1">
                        {achievement.progress} / {achievement.maxProgress}
                      </p>
                    </div>
                  )}
                </div>
                {achievement.unlockedAt && (
                  <Badge variant="success" size="sm">Unlocked</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile"
        >
          <div className="space-y-4">
            <Input
              label="Username"
              value={editForm.username}
              onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}

export { ProfilePage };
