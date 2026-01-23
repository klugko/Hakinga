import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Gamepad2,
} from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'in_game';
  avgWpm: number;
}

interface FriendRequest {
  id: string;
  username: string;
  date: string;
}

const mockFriends: Friend[] = [
  { id: '1', username: 'SpeedTyper', status: 'online', avgWpm: 95 },
  { id: '2', username: 'KeyMaster', status: 'in_game', avgWpm: 88 },
  { id: '3', username: 'TypeNinja', status: 'offline', avgWpm: 76 },
  { id: '4', username: 'FlashFingers', status: 'online', avgWpm: 102 },
];

const mockRequests: FriendRequest[] = [
  { id: '1', username: 'NewTyper', date: '2024-01-15' },
  { id: '2', username: 'KeyboardPro', date: '2024-01-14' },
];

const getStatusColor = (status: string) => {
  if (status === 'online') return 'bg-success';
  if (status === 'in_game') return 'bg-primary';
  return 'bg-text-muted';
};

const getStatusLabel = (status: string) => {
  if (status === 'online') return 'En ligne';
  if (status === 'in_game') return 'En partie';
  return 'Hors ligne';
};

/**
 * Friends management page
 */
export function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string }>>([]);

  const handleSearch = () => {
    if (searchQuery.length < 3) return;
    setSearchResults([
      { id: 'search1', username: searchQuery + '123' },
      { id: 'search2', username: searchQuery + '_pro' },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
          <Users className="w-5 h-5 text-success" />
          <span className="text-success font-medium">Amis</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">Gerez vos amis</h1>
        <p className="text-text-secondary">
          Ajoutez des amis et comparez vos performances
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Ajouter un ami
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Rechercher par username..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <Avatar fallback={result.username} size="sm" />
                    <span className="font-medium text-text">{result.username}</span>
                  </div>
                  <Button size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
                    Ajouter
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="friends">
        <TabsList className="mb-6">
          <TabsTrigger value="friends">
            <Users className="w-4 h-4 mr-2" />
            Amis ({mockFriends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            <UserPlus className="w-4 h-4 mr-2" />
            Demandes ({mockRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card>
            <CardContent className="py-4">
              {mockFriends.length > 0 ? (
                <div className="space-y-3">
                  {mockFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-surface-hover"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar fallback={friend.username} size="md" />
                          <div
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${getStatusColor(
                              friend.status
                            )}`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-text">{friend.username}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              size="sm"
                              variant={friend.status === 'online' ? 'success' : 'default'}
                            >
                              {getStatusLabel(friend.status)}
                            </Badge>
                            <span className="text-sm text-text-muted">{friend.avgWpm} WPM</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {friend.status !== 'offline' && (
                          <Button variant="outline" size="sm" leftIcon={<Gamepad2 className="w-4 h-4" />}>
                            Defier
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text mb-2">Pas encore d'amis</h3>
                  <p className="text-text-secondary">
                    Recherchez des utilisateurs pour les ajouter en amis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardContent className="py-4">
              {mockRequests.length > 0 ? (
                <div className="space-y-3">
                  {mockRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-surface-hover"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar fallback={request.username} size="md" />
                        <div>
                          <p className="font-medium text-text">{request.username}</p>
                          <p className="text-sm text-text-muted">Demande du {request.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
                          Accepter
                        </Button>
                        <Button variant="ghost" size="sm" leftIcon={<X className="w-4 h-4" />}>
                          Refuser
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text mb-2">Aucune demande</h3>
                  <p className="text-text-secondary">
                    Vous n'avez pas de demandes d'amis en attente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
