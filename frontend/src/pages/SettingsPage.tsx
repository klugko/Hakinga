import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ModalActions } from '@/components/ui/Modal';
import {
  User,
  Lock,
  Palette,
  Bell,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Le username doit contenir au moins 3 caracteres')
    .max(20, 'Le username ne peut pas depasser 20 caracteres')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Le username ne peut contenir que des lettres, chiffres et underscores'
    ),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const themeSchemes = [
  { value: 'midnight_blue', label: 'Midnight Blue', color: '#1a1a2e' },
  { value: 'deep_purple', label: 'Deep Purple', color: '#1a0a2e' },
  { value: 'carbon_black', label: 'Carbon Black', color: '#0a0a0f' },
  { value: 'forest_green', label: 'Forest Green', color: '#0a1a0f' },
];

const accentColors = [
  { value: 'indigo', label: 'Indigo', color: '#6366f1' },
  { value: 'cyan', label: 'Cyan', color: '#22d3ee' },
  { value: 'emerald', label: 'Emerald', color: '#10b981' },
  { value: 'amber', label: 'Amber', color: '#f59e0b' },
];

/**
 * Settings page for user preferences
 */
export function SettingsPage() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('carbon_black');
  const [selectedAccent, setSelectedAccent] = useState('indigo');

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (_data: ProfileFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      success('Profil mis a jour');
    } catch {
      showError('Erreur lors de la mise a jour');
    }
  };

  const onPasswordSubmit = async (_data: PasswordFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      success('Mot de passe change');
      passwordForm.reset();
    } catch {
      showError('Erreur lors du changement de mot de passe');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showError('Veuillez entrer votre mot de passe');
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      success('Compte supprime');
      setShowDeleteModal(false);
    } catch {
      showError('Erreur lors de la suppression');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Parametres</h1>
        <p className="text-text-secondary mt-1">Gerez votre compte et vos preferences</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profil
            </CardTitle>
            <CardDescription>Modifiez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <Input
                label="Nom d'utilisateur"
                {...profileForm.register('username')}
                error={profileForm.formState.errors.username?.message}
              />
              <Input label="Email" value={user?.email || ''} disabled hint="L'email ne peut pas etre modifie" />
              <Button type="submit" isLoading={profileForm.formState.isSubmitting}>
                Sauvegarder
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Mot de passe
            </CardTitle>
            <CardDescription>Changez votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <Input
                label="Mot de passe actuel"
                type={showPasswordCurrent ? 'text' : 'password'}
                {...passwordForm.register('currentPassword')}
                error={passwordForm.formState.errors.currentPassword?.message}
                rightIcon={
                  <button type="button" onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}>
                    {showPasswordCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <Input
                label="Nouveau mot de passe"
                type={showPasswordNew ? 'text' : 'password'}
                {...passwordForm.register('newPassword')}
                error={passwordForm.formState.errors.newPassword?.message}
                rightIcon={
                  <button type="button" onClick={() => setShowPasswordNew(!showPasswordNew)}>
                    {showPasswordNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                {...passwordForm.register('confirmPassword')}
                error={passwordForm.formState.errors.confirmPassword?.message}
              />
              <Button type="submit" isLoading={passwordForm.formState.isSubmitting}>
                Changer le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Apparence
            </CardTitle>
            <CardDescription>Personnalisez l'interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-3 block">
                  Schema de couleurs
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {themeSchemes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setSelectedTheme(theme.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedTheme === theme.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-border-hover'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-2 border border-border"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="text-xs font-medium text-text">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary mb-3 block">
                  Couleur d'accent
                </label>
                <div className="flex gap-3">
                  {accentColors.map((accent) => (
                    <button
                      key={accent.value}
                      onClick={() => setSelectedAccent(accent.value)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedAccent === accent.value
                          ? 'border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: accent.color }}
                      title={accent.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Gerez vos preferences de notification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 'sound', label: 'Sons de notification', description: 'Jouer un son lors des notifications' },
                { id: 'race', label: 'Courses trouvees', description: 'Notifier quand une course est prete' },
                { id: 'friends', label: 'Demandes d\'amis', description: 'Notifier pour les nouvelles demandes' },
                { id: 'insights', label: 'Insights quotidiens', description: 'Recevoir des conseils personnalises' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text">{item.label}</p>
                    <p className="text-sm text-text-muted">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white" />
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-error/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-error">
              <Trash2 className="w-5 h-5" />
              Zone de danger
            </CardTitle>
            <CardDescription>Actions irreversibles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary mb-4">
              La suppression de votre compte est definitive. Toutes vos donnees personnelles seront
              supprimees, mais vos statistiques de session seront anonymisees pour l'analyse ML.
            </p>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le compte ?"
        description="Cette action est irreversible. Entrez votre mot de passe pour confirmer."
      >
        <Input
          type="password"
          label="Mot de passe"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder="Votre mot de passe"
        />
        <ModalActions>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Supprimer definitivement
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}
