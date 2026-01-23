import { useState } from 'react';
import { Users, UserPlus, Search, Mail, Gamepad2, Gauge } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Button, Input, Avatar, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Modal } from '@/components/ui';
import { mockFriends, cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

function FriendsPage() {
  const { success } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');

  const filteredFriends = mockFriends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvite = () => {
    if (inviteUsername) {
      success(`Friend request sent to ${inviteUsername}`);
      setInviteUsername('');
      setIsInviteModalOpen(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-[#8b5cf6]" />
              Friends
            </h1>
            <p className="text-[#a1a1aa] mt-1">
              {mockFriends.length} friends, {mockFriends.filter(f => f.status === 'online').length} online
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Add Friend
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="all">All ({mockFriends.length})</TabsTrigger>
            <TabsTrigger value="online">
              Online ({mockFriends.filter(f => f.status === 'online').length})
            </TabsTrigger>
            <TabsTrigger value="requests">Requests (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <FriendsList friends={filteredFriends} />
          </TabsContent>

          <TabsContent value="online">
            <FriendsList friends={filteredFriends.filter(f => f.status === 'online' || f.status === 'in-game')} />
          </TabsContent>

          <TabsContent value="requests">
            <Card variant="bordered" padding="lg" className="text-center">
              <Mail className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
              <p className="text-[#a1a1aa]">No pending friend requests</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invite Modal */}
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Add Friend"
        >
          <div className="space-y-4">
            <Input
              label="Username"
              placeholder="Enter username to add"
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            />
            <p className="text-sm text-[#a1a1aa]">
              Enter the username of the player you want to add as a friend.
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleSendInvite}>
                Send Request
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}

function FriendsList({ friends }: { friends: typeof mockFriends }) {
  const { success } = useToast();

  if (friends.length === 0) {
    return (
      <Card variant="bordered" padding="lg" className="text-center">
        <Users className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
        <p className="text-[#a1a1aa]">No friends found</p>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'in-game':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'in-game':
        return 'In Game';
      default:
        return 'Offline';
    }
  };

  return (
    <Card variant="bordered" padding="none">
      <div className="divide-y divide-[#2a2a2a]">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between p-4 hover:bg-[#1a1a1a]/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Avatar
                name={friend.username}
                size="lg"
                status={friend.status}
              />
              <div>
                <p className="font-medium text-white">{friend.username}</p>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant={getStatusColor(friend.status) as 'success' | 'primary' | 'default'} size="sm">
                    {getStatusText(friend.status)}
                  </Badge>
                  <span className="text-[#71717a] flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {friend.stats.avgWpm} WPM
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(friend.status === 'online' || friend.status === 'in-game') && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Gamepad2 className="w-4 h-4" />}
                  onClick={() => success(`Challenge sent to ${friend.username}`)}
                >
                  Challenge
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export { FriendsPage };
