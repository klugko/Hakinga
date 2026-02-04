import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Copy, Check, Play, Link as LinkIcon } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Card, Input, Select } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { generateSessionCode } from '@/lib/utils';

function CreatePrivateSessionPage() {
  const navigate = useNavigate();
  const { success } = useToast();

  const [sessionCode] = useState(() => generateSessionCode());
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [settings, setSettings] = useState({
    maxPlayers: '4',
    difficulty: 'medium',
    length: 'medium',
  });

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    success('Session code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSession = () => {
    navigate(`/private/lobby/${sessionCode}`);
  };

  const handleJoinSession = () => {
    if (joinCode.length === 6) {
      navigate(`/private/lobby/${joinCode}`);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#22c55e]/20 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Private Session</h1>
          <p className="text-[#a1a1aa] mt-1">
            Create or join a private typing race with friends
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Session */}
          <Card variant="bordered" padding="lg">
            <h2 className="text-xl font-semibold text-white mb-6">Create New Session</h2>

            {/* Session Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Your Session Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-3 font-mono text-xl tracking-widest text-center text-white">
                  {sessionCode}
                </div>
                <Button
                  variant={copied ? 'primary' : 'secondary'}
                  onClick={handleCopyCode}
                  className="px-4"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <p className="text-xs text-[#71717a] mt-2">
                Share this code with friends to let them join
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-4 mb-6">
              <Select
                label="Max Players"
                options={[
                  { value: '2', label: '2 Players' },
                  { value: '4', label: '4 Players' },
                  { value: '6', label: '6 Players' },
                  { value: '8', label: '8 Players' },
                ]}
                value={settings.maxPlayers}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPlayers: e.target.value }))}
              />

              <Select
                label="Difficulty"
                options={[
                  { value: 'easy', label: 'Easy - Common words' },
                  { value: 'medium', label: 'Medium - Mixed vocabulary' },
                  { value: 'hard', label: 'Hard - Complex text' },
                ]}
                value={settings.difficulty}
                onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value }))}
              />

              <Select
                label="Text Length"
                options={[
                  { value: 'short', label: 'Short (~25 words)' },
                  { value: 'medium', label: 'Medium (~90 words)' },
                  { value: 'long', label: 'Long (~180 words)' },
                ]}
                value={settings.length}
                onChange={(e) => setSettings(prev => ({ ...prev, length: e.target.value }))}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              leftIcon={<Play className="w-5 h-5" />}
              onClick={handleCreateSession}
            >
              Create Session
            </Button>
          </Card>

          {/* Join Session */}
          <Card variant="bordered" padding="lg">
            <h2 className="text-xl font-semibold text-white mb-6">Join Existing Session</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Enter Session Code
              </label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="XXXXXX"
                className="text-center font-mono text-xl tracking-widest uppercase"
                leftIcon={<LinkIcon className="w-4 h-4" />}
              />
              <p className="text-xs text-[#71717a] mt-2">
                Get the code from your friend who created the session
              </p>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              leftIcon={<Users className="w-5 h-5" />}
              onClick={handleJoinSession}
              disabled={joinCode.length !== 6}
            >
              Join Session
            </Button>

            {/* How it works */}
            <div className="mt-8 pt-6 border-t border-[#2a2a2a]">
              <h3 className="font-medium text-white mb-4">How Private Sessions Work</h3>
              <ul className="space-y-3 text-sm text-[#a1a1aa]">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#8b5cf6]/20 rounded text-[#8b5cf6] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  Create a session and share the code with friends
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#8b5cf6]/20 rounded text-[#8b5cf6] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  Wait in the lobby until everyone joins and is ready
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#8b5cf6]/20 rounded text-[#8b5cf6] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  The host starts the race and everyone types the same text
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#8b5cf6]/20 rounded text-[#8b5cf6] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  See live progress and final results with rankings
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export { CreatePrivateSessionPage };
