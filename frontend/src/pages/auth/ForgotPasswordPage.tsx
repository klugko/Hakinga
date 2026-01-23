import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Keyboard, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi, ApiException } from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot password page component
 */
export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { error: showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (err) {
      if (err instanceof ApiException) {
        showError(err.apiError.message);
      } else {
        showError('Une erreur est survenue');
      }
    }
  };

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
            <h2 className="text-xl font-semibold text-text mb-2">Email envoye</h2>
            <p className="text-text-secondary mb-6">
              Si un compte existe avec cette adresse email, vous recevrez un lien de
              reinitialisation dans quelques minutes.
            </p>
            <Link to="/login">
              <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Retour a la connexion
              </Button>
            </Link>
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
        <p className="text-text-secondary">Reinitialiser votre mot de passe</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mot de passe oublie</CardTitle>
          <CardDescription>
            Entrez votre adresse email pour recevoir un lien de reinitialisation
          </CardDescription>
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

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Envoyer le lien
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour a la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
