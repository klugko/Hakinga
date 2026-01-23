import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Footer } from '@/components/layout/Footer';
import {
  Keyboard,
  Zap,
  Trophy,
  Brain,
  Users,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Keyboard,
    title: 'Pratique Solo',
    description:
      'Ameliorez votre vitesse et votre precision a votre propre rythme avec des textes adaptes a votre niveau.',
  },
  {
    icon: Zap,
    title: 'Competitions en Temps Reel',
    description:
      'Affrontez d\'autres joueurs dans des courses de dactylographie palpitantes et grimpez dans le classement.',
  },
  {
    icon: Brain,
    title: 'Apprentissage ML',
    description:
      'Notre IA analyse vos frappes pour identifier vos faiblesses et vous proposer des exercices personnalises.',
  },
  {
    icon: Trophy,
    title: 'Classements et Recompenses',
    description:
      'Comparez vos performances, debloquez des achievements et montrez vos badges de competence.',
  },
  {
    icon: Users,
    title: 'Sessions Privees',
    description:
      'Creez des sessions privees pour jouer avec vos amis et organisez vos propres competitions.',
  },
  {
    icon: Target,
    title: 'Exercices Cibles',
    description:
      'Des drills personnalises qui ciblent specifiquement vos caracteres et bigrammes problematiques.',
  },
];

const stats = [
  { value: '200+', label: 'WPM Record' },
  { value: '10K+', label: 'Utilisateurs' },
  { value: '1M+', label: 'Sessions' },
  { value: '99.9%', label: 'Uptime' },
];

/**
 * Landing page for unauthenticated users
 */
export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-text hover:text-primary transition-colors"
            >
              <Keyboard className="w-6 h-6 text-primary" />
              <span>Hakinga</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-text-secondary hover:text-text transition-colors">
                Fonctionnalités
              </a>
              <a href="#ai" className="text-text-secondary hover:text-text transition-colors">
                IA
              </a>
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button>S'inscrire</Button>
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface animate-fade-in">
            <div className="px-4 py-4 space-y-4">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-text-secondary hover:text-text transition-colors py-2"
              >
                Fonctionnalités
              </a>
              <a
                href="#ai"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-text-secondary hover:text-text transition-colors py-2"
              >
                IA
              </a>
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth>
                    Connexion
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button fullWidth>S'inscrire</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Nouvelle version avec IA integree
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
              Maitrisez la dactylographie avec{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                l'intelligence artificielle
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Hakinga combine competition en temps reel et apprentissage personnalise par Machine
              Learning pour vous aider a taper plus vite et plus precisement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Commencer gratuitement
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Se connecter
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-text">{stat.value}</p>
                  <p className="text-sm text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Tout ce dont vous avez besoin pour progresser
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Une plateforme complete qui s'adapte a votre niveau et vous guide vers l'excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} variant="hover" className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="ai" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-text mb-6">
                L'IA qui comprend votre frappe
              </h2>
              <p className="text-lg text-text-secondary mb-8">
                Notre systeme de Machine Learning analyse chacune de vos frappes pour creer un
                profil detaille de vos forces et faiblesses.
              </p>

              <ul className="space-y-4">
                {[
                  'Identification des caracteres problematiques',
                  'Detection des bigrammes et trigrammes difficiles',
                  'Analyse du rythme et de la fatigue',
                  'Recommandations d\'exercices personnalises',
                  'Prediction de votre progression',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link to="/register">
                  <Button rightIcon={<TrendingUp className="w-4 h-4" />}>
                    Decouvrir mon profil
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-border p-8">
                <div className="h-full flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Vitesse moyenne</span>
                      <span className="text-2xl font-bold text-text">78 WPM</span>
                    </div>
                    <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <span className="text-text-secondary">Precision</span>
                      <span className="text-2xl font-bold text-success">96.5%</span>
                    </div>
                    <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                      <div className="h-full w-[96%] bg-success rounded-full" />
                    </div>

                    <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-primary font-medium">
                        Conseil ML: Travaillez sur les touches "e" et "r" - 23% de vos erreurs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-6">
            Pret a ameliorer votre frappe ?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Rejoignez des milliers d'utilisateurs qui ont deja ameliore leur vitesse de frappe avec
            Hakinga.
          </p>
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Commencer maintenant
            </Button>
          </Link>
        </div>
      </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
