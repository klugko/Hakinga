import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Keyboard, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authApi, ApiException } from '@/lib/api';

const resetPasswordSchema = z
  .object({
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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Reset password page component
 */
export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      showError('Lien de reinitialisation invalide');
      return;
    }

    try {
      await authApi.resetPassword(token, data.password);
      setIsSubmitted(true);
      showSuccess('Mot de passe reinitialise avec succes');
    } catch (err) {
      if (err instanceof ApiException) {
        showError(err.apiError.message);
      } else {
        showError('Une erreur est survenue');
      }
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-text mb-2">
            <Keyboard className="w-8 h-8 text-primary" />
            <span>Hakinga</span>
          </Link>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-text mb-2">Lien invalide</h2>
            <p className="text-text-secondary mb-6">
              Ce lien de reinitialisation est invalide ou a expire.
            </p>
            <Link to="/forgot-password">
              <Button>Demander un nouveau lien</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-text mb-2">
            <Keyboard className="w-8 h-8 text-primary" />
            <span>Hakinga</span>
          </Link>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-text mb-2">Mot de passe reinitialise</h2>
            <p className="text-text-secondary mb-6">
              Votre mot de passe a ete change avec succes.
            </p>
            <Button onClick={() => navigate('/login')}>Se connecter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-text mb-2">
          <Keyboard className="w-8 h-8 text-primary" />
          <span>Hakinga</span>
        </Link>
        <p className="text-text-secondary">Definir un nouveau mot de passe</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau mot de passe</CardTitle>
          <CardDescription>Choisissez un mot de passe securise</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="Votre nouveau mot de passe"
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
              Reinitialiser le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
