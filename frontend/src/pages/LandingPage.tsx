import { Link } from 'react-router-dom';
import { Keyboard, Zap, Users, Trophy, ArrowRight, Github, Twitter } from 'lucide-react';
import { Button } from '@/components/ui';

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-lg border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-lg flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Hakinga</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-sm text-[#8b5cf6]">Master typing in a new way</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Improve Your Typing
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]">
              Speed & Accuracy
            </span>
          </h1>

          <p className="text-xl text-[#a1a1aa] mb-8 max-w-2xl mx-auto">
            Practice typing with engaging exercises, compete with friends in real-time races, and track your progress with detailed analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Practicing Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                I already have an account
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-[#71717a]">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">1M+</div>
              <div className="text-sm text-[#71717a]">Sessions Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">85+</div>
              <div className="text-sm text-[#71717a]">Avg WPM Improvement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to become a typing master
            </h2>
            <p className="text-[#a1a1aa] max-w-2xl mx-auto">
              From solo practice to competitive races, Hakinga provides all the tools you need to improve your typing skills.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center mb-4">
                <Keyboard className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Solo Practice</h3>
              <p className="text-[#a1a1aa]">
                Practice at your own pace with texts of varying difficulty and length. Track your progress and improve steadily.
              </p>
            </div>

            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              <div className="w-12 h-12 bg-[#22c55e]/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#22c55e]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Private Races</h3>
              <p className="text-[#a1a1aa]">
                Create private sessions and challenge your friends to typing races. See who's the fastest in real-time.
              </p>
            </div>

            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              <div className="w-12 h-12 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Leaderboards</h3>
              <p className="text-[#a1a1aa]">
                Compete for the top spots on global and weekly leaderboards. Earn achievements and show off your skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to improve your typing?
          </h2>
          <p className="text-[#a1a1aa] mb-8">
            Join thousands of users who are already improving their typing speed with Hakinga.
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Hakinga</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#71717a]">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#1a1a1a] transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#1a1a1a] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { LandingPage };
