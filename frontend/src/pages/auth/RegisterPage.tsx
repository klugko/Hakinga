import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Keyboard, Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button, Input, Card } from '@/components/ui';
import { cn } from '@/lib/utils';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { error, success } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength checks
  const passwordChecks = [
    { label: 'At least 6 characters', valid: formData.password.length >= 6 },
    { label: 'Contains a number', valid: /\d/.test(formData.password) },
    { label: 'Contains uppercase', valid: /[A-Z]/.test(formData.password) },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await register(formData);

    if (result.success) {
      success('Account created successfully!');
      navigate('/dashboard');
    } else {
      const errorMessage = result.error || 'Failed to create account';
      error(errorMessage);

      if (errorMessage.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('username')) {
        setErrors(prev => ({ ...prev, username: errorMessage }));
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
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-[#a1a1aa] mt-1">Start improving your typing skills today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              leftIcon={<User className="w-4 h-4" />}
              disabled={isLoading}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              disabled={isLoading}
            />

            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
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

              {/* Password strength indicators */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Check className={cn('w-3 h-3', check.valid ? 'text-[#22c55e]' : 'text-[#71717a]')} />
                      <span className={check.valid ? 'text-[#22c55e]' : 'text-[#71717a]'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
              disabled={isLoading}
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-0.5 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#8b5cf6] focus:ring-[#8b5cf6]"
              />
              <label htmlFor="terms" className="text-sm text-[#a1a1aa]">
                I agree to the{' '}
                <a href="#" className="text-[#8b5cf6] hover:text-[#a78bfa]">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#8b5cf6] hover:text-[#a78bfa]">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#a1a1aa]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#8b5cf6] hover:text-[#a78bfa] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export { RegisterPage };
