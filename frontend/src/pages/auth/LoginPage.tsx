import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Keyboard, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button, Input, Card } from '@/components/ui';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const { error, success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await login({ email, password });

    if (result.success) {
      success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      const errorMessage = result.error || 'Invalid email or password';
      error(errorMessage);

      if (errorMessage.toLowerCase().includes('password')) {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-xl flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Hakinga</span>
          </Link>
        </div>

        <Card variant="bordered" padding="lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-[#a1a1aa] mt-1">Sign in to continue your typing journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              disabled={isLoading}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#8b5cf6] focus:ring-[#8b5cf6]"
                />
                <span className="text-sm text-[#a1a1aa]">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#a1a1aa]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#8b5cf6] hover:text-[#a78bfa] font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>

        {/* Demo credentials hint */}
        <p className="text-center text-sm text-[#71717a] mt-4">
          Use any email and a password with 6+ characters to login (demo mode)
        </p>
      </div>
    </div>
  );
}

export { LoginPage };
