import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Keyboard, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { ApiException } from '@/lib/api';

const registerSchema = z
  .object({
    email: z.string().email('Email invalide'),
    username: z
      .string()
      .min(3, 'Le username doit contenir au moins 3 caracteres')
      .max(20, 'Le username ne peut pas depasser 20 caracteres')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Le username ne peut contenir que des lettres, chiffres et underscores'
      ),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['passwordConfirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Register page component
 */
export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      showSuccess('Compte cree avec succes !');
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiException) {
        showError(err.apiError.message);
      } else {
        showError('Une erreur est survenue');
      }
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-text mb-2">
          <Keyboard className="w-8 h-8 text-primary" />
          <span>Hakinga</span>
        </Link>
        <p className="text-text-secondary">Creez votre compte pour commencer</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>Remplissez le formulaire pour creer votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Nom d'utilisateur"
              type="text"
              placeholder="votre_username"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.username?.message}
              hint="3-20 caracteres, lettres, chiffres et _"
              {...register('username')}
            />

            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="Votre mot de passe"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              hint="Min 8 caracteres, 1 majuscule, 1 minuscule, 1 chiffre"
              {...register('password')}
            />

            <Input
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmez votre mot de passe"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hover:text-text transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              error={errors.passwordConfirmation?.message}
              {...register('passwordConfirmation')}
            />

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Creer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Deja un compte ?{' '}
              <Link to="/login" className="text-primary hover:text-primary-hover transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
