import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Keyboard,
  Users,
  Trophy,
  ArrowRight,
  Github,
  Brain,
  Target,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui';

const TYPING_TEXTS = [
  'Type faster than ever before',
  'Compete with players worldwide',
  'AI-powered personalized training',
  'Master your keyboard skills',
];

function LandingPage() {
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
    const currentText = TYPING_TEXTS[typingIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentText.length) {
            setDisplayText(currentText.slice(0, displayText.length + 1));
            simulateKeyPress(currentText[displayText.length]);
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setTypingIndex((prev) => (prev + 1) % TYPING_TEXTS.length);
          }
        }
      },
      isDeleting ? 30 : 80
    );
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, typingIndex]);

  const simulateKeyPress = (char: string) => {
    const key = char.toUpperCase();
    setActiveKeys((prev) => [...prev, key]);
    setTimeout(() => {
      setActiveKeys((prev) => prev.filter((k) => k !== key));
    }, 150);
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 hero-grid opacity-50" />
      <div className="fixed inset-0 radial-overlay" />

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-xl flex items-center justify-center animate-glow">
                <Keyboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Hakinga
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#a1a1aa] hover:text-white transition-colors">
                Features
              </a>
              <a href="#ai" className="text-[#a1a1aa] hover:text-white transition-colors">
                AI Training
              </a>
              <a href="#leaderboard" className="text-[#a1a1aa] hover:text-white transition-colors">
                Leaderboard
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-[#a1a1aa] hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="primary"
                  className="relative overflow-hidden group"
                >
                  <span className="relative z-10">Play Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#8b5cf6] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 animate-scale-in">
            <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-sm text-[#a1a1aa]">
              Powered by Machine Learning
            </span>
            <span className="px-2 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-semibold rounded-full">
              NEW
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none tracking-tight">
            <span className="block">BECOME A</span>
            <span className="block gradient-text-animated">
              TYPING LEGEND
            </span>
          </h1>

          {/* Typing Animation */}
          <div className="h-12 mb-8 flex items-center justify-center">
            <span className="text-xl md:text-2xl text-[#a1a1aa] font-mono">
              {'> '}
              <span className="text-white">{displayText}</span>
              <span className="animate-cursor inline-block w-0.5 h-6 bg-[#8b5cf6] ml-1" />
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register">
              <Button
                variant="primary"
                size="lg"
                className="text-lg px-8 py-4 animate-glow"
                rightIcon={<Play className="w-5 h-5" />}
              >
                Start Playing Free
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-4 glass border-[#2a2a2a]"
              >
                Discover Features
              </Button>
            </a>
          </div>

          {/* Animated Keyboard */}
          <div className="hidden lg:block max-w-2xl mx-auto mb-12 animate-float">
            <div className="glass rounded-2xl p-6 shadow-2xl">
              {keyboardRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex justify-center gap-1.5 mb-1.5"
                  style={{ marginLeft: rowIndex * 20 }}
                >
                  {row.map((key) => (
                    <div
                      key={key}
                      className={`keyboard-key w-12 h-12 flex items-center justify-center text-sm font-bold transition-all duration-100 ${
                        activeKeys.includes(key)
                          ? 'active text-white'
                          : 'text-[#71717a]'
                      }`}
                    >
                      {key}
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex justify-center mt-1.5">
                <div
                  className={`keyboard-key w-64 h-10 flex items-center justify-center text-xs font-bold transition-all duration-100 ${
                    activeKeys.includes(' ') ? 'active' : 'text-[#71717a]'
                  }`}
                >
                  SPACE
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '50K+', label: 'Active Players', delay: '0s' },
              { value: '10M+', label: 'Races Completed', delay: '0.1s' },
              { value: '150+', label: 'WPM Record', delay: '0.2s' },
              { value: '98%', label: 'Satisfaction', delay: '0.3s' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center stat-number"
                style={{ animationDelay: stat.delay }}
              >
                <div className="text-3xl md:text-4xl font-black text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-[#71717a]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-[#71717a]" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[#8b5cf6] text-sm font-semibold tracking-wider uppercase mb-4 block">
              Game Modes
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Multiple Ways to Play
            </h2>
            <p className="text-xl text-[#a1a1aa] max-w-2xl mx-auto">
              Whether you prefer solo practice or competitive racing, we have the perfect mode for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Keyboard,
                title: 'Solo Training',
                description: 'Practice at your own pace with adaptive difficulty. Perfect for warming up or focused improvement.',
                color: '#8b5cf6',
                gradient: 'from-[#8b5cf6] to-[#6d28d9]',
              },
              {
                icon: Users,
                title: 'Private Races',
                description: 'Create private rooms and challenge your friends. Real-time competition with live progress tracking.',
                color: '#22c55e',
                gradient: 'from-[#22c55e] to-[#16a34a]',
              },
              {
                icon: Trophy,
                title: 'Ranked Matches',
                description: 'Compete in global tournaments and climb the leaderboard. Prove you are the fastest typist.',
                color: '#f59e0b',
                gradient: 'from-[#f59e0b] to-[#d97706]',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative glass rounded-2xl p-8 hover:scale-105 transition-all duration-300 neon-border"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:animate-glow`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#a1a1aa] leading-relaxed">
                  {feature.description}
                </p>
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${feature.color}10 0%, transparent 70%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8b5cf6]/5 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#8b5cf6] text-sm font-semibold tracking-wider uppercase mb-4 block">
                AI-Powered
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Train Smarter,
                <br />
                <span className="gradient-text-animated">Not Harder</span>
              </h2>
              <p className="text-xl text-[#a1a1aa] mb-8">
                Our Machine Learning algorithms analyze every keystroke to understand your unique typing patterns and create a personalized training program.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Brain,
                    title: 'Weakness Detection',
                    description: 'AI identifies your problematic characters and patterns',
                  },
                  {
                    icon: Target,
                    title: 'Targeted Exercises',
                    description: 'Custom drills designed specifically for your weak points',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Progress Prediction',
                    description: 'See your projected WPM improvement over time',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#8b5cf6]/30 transition-colors">
                      <item.icon className="w-6 h-6 text-[#8b5cf6]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[#a1a1aa]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Visualization */}
            <div className="relative">
              <div className="glass rounded-3xl p-8 animate-float">
                {/* Typing Profile Preview */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#a1a1aa]">
                      Your Typing Profile
                    </span>
                    <span className="px-2 py-1 bg-[#22c55e]/20 text-[#22c55e] text-xs font-semibold rounded-full">
                      LIVE
                    </span>
                  </div>

                  {/* Keyboard Heatmap */}
                  <div className="grid grid-cols-10 gap-1 mb-6">
                    {keyboardRows[0].map((key) => (
                      <div
                        key={key}
                        className="aspect-square rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: `rgba(139, 92, 246, ${0.1 + Math.random() * 0.5})`,
                          color: `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`,
                        }}
                      >
                        {key}
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'WPM', value: '85', trend: '+12%' },
                      { label: 'Accuracy', value: '97%', trend: '+3%' },
                      { label: 'Level', value: 'Expert', trend: '' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-[#71717a]">{stat.label}</div>
                        {stat.trend && (
                          <div className="text-xs text-[#22c55e]">{stat.trend}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Weak Characters */}
                  <div className="bg-[#0f0f0f] rounded-xl p-4">
                    <div className="text-xs text-[#71717a] mb-2">Focus Characters</div>
                    <div className="flex gap-2">
                      {['Q', 'Z', 'X', ';'].map((char) => (
                        <span
                          key={char}
                          className="px-3 py-1 bg-[#ef4444]/20 text-[#ef4444] rounded-lg text-sm font-mono font-bold"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#8b5cf6]/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#6d28d9]/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Ready to
            <span className="gradient-text-animated"> Level Up</span>?
          </h2>
          <p className="text-xl text-[#a1a1aa] mb-10 max-w-2xl mx-auto">
            Join thousands of players who are already improving their typing speed with Hakinga. It is free to start.
          </p>
          <Link to="/register">
            <Button
              variant="primary"
              size="lg"
              className="text-xl px-12 py-6 animate-glow font-bold"
              rightIcon={<ArrowRight className="w-6 h-6" />}
            >
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-lg flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Hakinga</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-[#71717a]">
            <a href="#" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[#71717a] hover:text-white hover:bg-[#8b5cf6]/20 transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { LandingPage };
