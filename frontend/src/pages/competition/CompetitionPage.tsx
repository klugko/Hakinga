import { Link } from 'react-router-dom';
import { Trophy, Users, Zap, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';

function CompetitionPage() {
  const upcomingRaces = [
    { id: 1, name: 'Quick Race', players: 8, startIn: '2:00', difficulty: 'medium' },
    { id: 2, name: 'Speed Challenge', players: 12, startIn: '5:00', difficulty: 'hard' },
    { id: 3, name: 'Beginner Friendly', players: 5, startIn: '8:00', difficulty: 'easy' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f59e0b]/20 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-[#f59e0b]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Competition</h1>
          <p className="text-[#a1a1aa] mt-1">
            Race against other typists in real-time competitions
          </p>
        </div>

        {/* Quick Join */}
        <Card variant="bordered" padding="lg" className="mb-8 text-center">
          <Zap className="w-12 h-12 text-[#f59e0b] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Quick Join</h2>
          <p className="text-[#a1a1aa] mb-6">
            Jump into the next available race instantly
          </p>
          <Button variant="primary" size="lg" leftIcon={<Zap className="w-5 h-5" />}>
            Join Random Race
          </Button>
        </Card>

        {/* Upcoming Races */}
        <h2 className="text-xl font-semibold text-white mb-4">Upcoming Races</h2>
        <div className="space-y-4 mb-8">
          {upcomingRaces.map((race) => (
            <Card key={race.id} variant="bordered" padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-[#8b5cf6]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{race.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {race.players} players
                      </span>
                      <Badge
                        variant={
                          race.difficulty === 'easy' ? 'success' :
                          race.difficulty === 'medium' ? 'warning' : 'error'
                        }
                        size="sm"
                      >
                        {race.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-[#71717a]">Starts in</p>
                    <p className="font-mono text-lg text-white">{race.startIn}</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Join
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Private Race */}
        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#22c55e]/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#22c55e]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Private Race</h3>
                <p className="text-[#a1a1aa]">Create a private room and invite your friends</p>
              </div>
            </div>
            <Link to="/private/create">
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Room
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export { CompetitionPage };
