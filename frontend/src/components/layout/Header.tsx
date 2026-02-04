import { Link, useLocation } from 'react-router-dom';
import {
  Keyboard,
  LayoutDashboard,
  Trophy,
  History,
  Users,
  Settings,
  LogOut,
  X,
  User,
  Zap,
  ChevronDown,
  Flame,
  Target,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/solo', label: 'Practice', icon: Target },
  { path: '/private/create', label: 'Private', icon: Users },
  { path: '/leaderboard', label: 'Ranks', icon: Trophy },
  { path: '/history', label: 'History', icon: History },
];

function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      const activeItem = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeItem) {
        setIndicatorStyle({
          left: activeItem.offsetLeft,
          width: activeItem.offsetWidth,
        });
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isUserMenuOpen && !(e.target as Element).closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  const userLevel = Math.floor((user?.stats?.totalSessions || 0) / 10) + 1;
  const xpProgress = ((user?.stats?.totalSessions || 0) % 10) * 10;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-lg shadow-black/20'
            : 'bg-transparent'
        )}
      >
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 group relative">
              <div className="relative">
                <div className="absolute inset-0 bg-[#8b5cf6] rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <Keyboard className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight">
                  HAKINGA
                </span>
                <span className="text-[10px] text-[#8b5cf6] font-medium tracking-widest -mt-1">
                  TYPE TO WIN
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav ref={navRef} className="hidden lg:flex items-center relative">
              {/* Sliding indicator */}
              <div
                className="absolute bottom-0 h-[2px] bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] rounded-full transition-all duration-300 ease-out"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />

              <div className="flex items-center bg-[#1a1a1a]/50 rounded-2xl p-1 border border-[#2a2a2a]/50">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      data-active={isActive}
                      className={cn(
                        'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'text-white'
                          : 'text-[#71717a] hover:text-white'
                      )}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/20 to-[#6d28d9]/20 rounded-xl" />
                      )}
                      <Icon
                        className={cn(
                          'w-4 h-4 relative z-10 transition-all',
                          isActive && 'text-[#8b5cf6]'
                        )}
                      />
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#8b5cf6] rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Quick Play Button */}
              <Link
                to="/solo"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl text-white text-sm font-bold hover:shadow-lg hover:shadow-[#8b5cf6]/25 transform hover:scale-105 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Quick Play</span>
              </Link>

              {/* User Stats Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a]/50 rounded-xl border border-[#2a2a2a]/50">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-sm font-bold text-white">
                    {user?.stats?.bestWpm || 0}
                  </span>
                  <span className="text-xs text-[#71717a]">WPM</span>
                </div>
                <div className="w-px h-4 bg-[#2a2a2a]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#71717a]">LVL</span>
                  <span className="text-sm font-bold text-[#8b5cf6]">{userLevel}</span>
                </div>
              </div>

              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    'hidden md:flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all',
                    isUserMenuOpen
                      ? 'bg-[#8b5cf6]/20 ring-2 ring-[#8b5cf6]/50'
                      : 'hover:bg-[#1a1a1a]'
                  )}
                >
                  <div className="relative">
                    <Avatar name={user?.username} size="sm" />
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-[#0f0f0f]" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-white leading-none">
                      {user?.username}
                    </span>
                    {/* XP Progress bar */}
                    <div className="w-16 h-1 bg-[#2a2a2a] rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] rounded-full transition-all"
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-[#71717a] transition-transform',
                      isUserMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-xl shadow-black/50 overflow-hidden animate-scale-in origin-top-right">
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-r from-[#8b5cf6]/10 to-[#6d28d9]/10 border-b border-[#2a2a2a]">
                      <div className="flex items-center gap-3">
                        <Avatar name={user?.username} size="md" />
                        <div>
                          <div className="font-semibold text-white">{user?.username}</div>
                          <div className="text-xs text-[#71717a]">{user?.email}</div>
                        </div>
                      </div>
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-center p-2 bg-[#0f0f0f]/50 rounded-lg">
                          <div className="text-lg font-bold text-white">
                            {user?.stats?.bestWpm || 0}
                          </div>
                          <div className="text-[10px] text-[#71717a]">Best WPM</div>
                        </div>
                        <div className="text-center p-2 bg-[#0f0f0f]/50 rounded-lg">
                          <div className="text-lg font-bold text-white">
                            {user?.stats?.totalSessions || 0}
                          </div>
                          <div className="text-[10px] text-[#71717a]">Sessions</div>
                        </div>
                        <div className="text-center p-2 bg-[#0f0f0f]/50 rounded-lg">
                          <div className="text-lg font-bold text-[#8b5cf6]">{userLevel}</div>
                          <div className="text-[10px] text-[#71717a]">Level</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#a1a1aa] hover:text-white hover:bg-[#252525] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#a1a1aa] hover:text-white hover:bg-[#252525] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Settings</span>
                      </Link>
                      <div className="h-px bg-[#2a2a2a] my-2" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="relative w-5 h-4 flex flex-col justify-between">
                  <span
                    className={cn(
                      'block h-0.5 bg-white rounded-full transition-all duration-300',
                      isMobileMenuOpen && 'rotate-45 translate-y-1.5'
                    )}
                  />
                  <span
                    className={cn(
                      'block h-0.5 bg-white rounded-full transition-all duration-300',
                      isMobileMenuOpen && 'opacity-0 scale-0'
                    )}
                  />
                  <span
                    className={cn(
                      'block h-0.5 bg-white rounded-full transition-all duration-300',
                      isMobileMenuOpen && '-rotate-45 -translate-y-1.5'
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-[#0f0f0f] border-l border-[#2a2a2a] transition-transform duration-300 ease-out lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <Avatar name={user?.username} size="md" />
            <div>
              <div className="font-semibold text-white">{user?.username}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8b5cf6] font-medium">Level {userLevel}</span>
                <div className="w-12 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8b5cf6] rounded-full"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#1a1a1a] transition-colors"
          >
            <X className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl">
            <div className="w-10 h-10 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{user?.stats?.bestWpm || 0}</div>
              <div className="text-xs text-[#71717a]">Best WPM</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl">
            <div className="w-10 h-10 bg-[#22c55e]/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">
                {user?.stats?.avgAccuracy?.toFixed(0) || 0}%
              </div>
              <div className="text-xs text-[#71717a]">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-transparent text-white'
                    : 'text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                    isActive ? 'bg-[#8b5cf6]' : 'bg-[#1a1a1a]'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-[#71717a]')} />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-[#8b5cf6] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2a2a2a] bg-[#0f0f0f]">
          <Link
            to="/solo"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl text-white font-bold mb-3"
          >
            <Zap className="w-5 h-5" />
            Quick Play
          </Link>
          <div className="flex gap-2">
            <Link
              to="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] rounded-xl text-[#a1a1aa] hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#ef4444]/10 rounded-xl text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export { Header };
