import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import {
  Clock,
  Keyboard,
  Zap,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Difficulty } from '@/types';

interface SessionItem {
  id: string;
  type: 'solo' | 'public' | 'private';
  wpm: number;
  accuracy: number;
  duration: number;
  difficulty: Difficulty;
  date: string;
  rank?: number;
}

const mockSessions: SessionItem[] = [
  { id: '1', type: 'solo', wpm: 75, accuracy: 96.1, duration: 120000, difficulty: 'medium', date: '2024-01-15T14:30:00' },
  { id: '2', type: 'public', wpm: 68, accuracy: 93.8, duration: 95000, difficulty: 'medium', date: '2024-01-14T18:45:00', rank: 2 },
  { id: '3', type: 'solo', wpm: 72, accuracy: 95.2, duration: 180000, difficulty: 'hard', date: '2024-01-14T10:15:00' },
  { id: '4', type: 'private', wpm: 70, accuracy: 94.5, duration: 110000, difficulty: 'medium', date: '2024-01-13T20:00:00', rank: 1 },
  { id: '5', type: 'solo', wpm: 65, accuracy: 92.3, duration: 150000, difficulty: 'easy', date: '2024-01-12T16:30:00' },
  { id: '6', type: 'public', wpm: 71, accuracy: 94.8, duration: 100000, difficulty: 'medium', date: '2024-01-11T12:00:00', rank: 3 },
  { id: '7', type: 'solo', wpm: 78, accuracy: 97.0, duration: 130000, difficulty: 'medium', date: '2024-01-10T09:00:00' },
  { id: '8', type: 'solo', wpm: 69, accuracy: 93.5, duration: 140000, difficulty: 'hard', date: '2024-01-09T15:45:00' },
];

const getTypeIcon = (type: string) => {
  if (type === 'solo') return <Keyboard className="w-5 h-5 text-primary" />;
  if (type === 'public') return <Zap className="w-5 h-5 text-accent" />;
  return <Users className="w-5 h-5 text-success" />;
};

const getTypeLabel = (type: string) => {
  if (type === 'solo') return 'Solo';
  if (type === 'public') return 'Publique';
  return 'Privee';
};

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Session history page
 */
export function HistoryPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSessions = mockSessions.filter((session) => {
    if (typeFilter !== 'all' && session.type !== typeFilter) return false;
    if (difficultyFilter !== 'all' && session.difficulty !== difficultyFilter) return false;
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.ceil(filteredSessions.length / pageSize);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Historique des sessions</h1>
        <p className="text-text-secondary mt-1">
          Consultez et analysez vos performances passees
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtres:</span>
            </div>
            <div className="grid grid-cols-3 gap-4 flex-1">
              <Select
                options={[
                  { value: 'all', label: 'Tous les types' },
                  { value: 'solo', label: 'Solo' },
                  { value: 'public', label: 'Publique' },
                  { value: 'private', label: 'Privee' },
                ]}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              />
              <Select
                options={[
                  { value: 'all', label: 'Toutes difficultes' },
                  { value: 'easy', label: 'Facile' },
                  { value: 'medium', label: 'Moyen' },
                  { value: 'hard', label: 'Difficile' },
                ]}
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              />
              <Select
                options={[
                  { value: 'all', label: 'Toute periode' },
                  { value: '7', label: '7 derniers jours' },
                  { value: '30', label: '30 derniers jours' },
                ]}
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Sessions ({filteredSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedSessions.length > 0 ? (
            <div className="space-y-3">
              {paginatedSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/session/${session.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-surface-hover hover:bg-surface-active transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      session.type === 'solo'
                        ? 'bg-primary/10'
                        : session.type === 'public'
                        ? 'bg-accent/10'
                        : 'bg-success/10'
                    }`}>
                      {getTypeIcon(session.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text">{getTypeLabel(session.type)}</span>
                        <Badge size="sm">{session.difficulty}</Badge>
                        {session.rank && (
                          <Badge
                            variant={session.rank === 1 ? 'warning' : session.rank <= 3 ? 'success' : 'default'}
                            size="sm"
                          >
                            #{session.rank}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-muted">{formatDate(session.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-text-muted">Duree</p>
                      <p className="font-medium text-text">{formatDuration(session.duration)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{session.wpm} WPM</p>
                      <p className="text-sm text-text-muted">{session.accuracy}%</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">Aucune session trouvee</h3>
              <p className="text-text-secondary">
                Essayez de modifier vos filtres ou commencez une nouvelle session
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <p className="text-sm text-text-muted">
                Page {currentPage} sur {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
