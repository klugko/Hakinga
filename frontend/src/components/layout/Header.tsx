import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  Keyboard,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Trophy,
  Users,
  Zap,
  Target,
  BarChart3,
  Bell,
} from 'lucide-react';

const navLinks = [
  { href: '/solo', label: 'Solo', icon: Keyboard },
  { href: '/competition', label: 'Competition', icon: Zap },
  { href: '/leaderboard', label: 'Classement', icon: Trophy },
];

const authNavLinks = [
  { href: '/profile', label: 'Profil', icon: User },
  { href: '/typing-profile', label: 'Analyse ML', icon: BarChart3 },
  { href: '/training', label: 'Entrainement', icon: Target },
  { href: '/friends', label: 'Amis', icon: Users },
];

/**
 * Main navigation header component
 */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="flex items-center gap-2 text-xl font-bold text-text hover:text-primary transition-colors"
            >
              <Keyboard className="w-6 h-6 text-primary" />
              <span>Hakinga</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  className="relative p-2 text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <Avatar fallback={user?.username} size="sm" />
                    <span className="hidden sm:block text-sm font-medium text-text">
                      {user?.username}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 py-2 bg-surface rounded-lg border border-border shadow-lg z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-text">{user?.username}</p>
                          <p className="text-xs text-text-muted">{user?.email}</p>
                        </div>
                        {authNavLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.href}
                              to={link.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
                            >
                              <Icon className="w-4 h-4" />
                              {link.label}
                            </Link>
                          );
                        })}
                        <div className="border-t border-border mt-2 pt-2">
                          <Link
                            to="/settings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Parametres
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error hover:bg-surface-hover transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Deconnexion
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Connexion
                </Button>
                <Button onClick={() => navigate('/register')}>S'inscrire</Button>
              </div>
            )}

            <button
              className="md:hidden p-2 text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated && (
              <>
                <div className="border-t border-border my-2 pt-2">
                  {authNavLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive(link.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
            {!isAuthenticated && (
              <div className="border-t border-border my-2 pt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Connexion
                </Button>
                <Button
                  fullWidth
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  S'inscrire
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
