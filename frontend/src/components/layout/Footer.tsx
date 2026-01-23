import { Link } from 'react-router-dom';
import { Keyboard, Github, Twitter } from 'lucide-react';

/**
 * Footer component with links and social
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-text">
              <Keyboard className="w-6 h-6 text-primary" />
              <span>Hakinga</span>
            </Link>
            <p className="mt-4 text-sm text-text-secondary max-w-md">
              Plateforme intelligente d'entrainement a la dactylographie. Ameliorez votre vitesse et
              votre precision grace au Machine Learning et a la competition en temps reel.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">
              Fonctionnalites
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/solo"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Pratique Solo
                </Link>
              </li>
              <li>
                <Link
                  to="/competition"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Competition
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Classement
                </Link>
              </li>
              <li>
                <Link
                  to="/typing-profile"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Analyse ML
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Aide
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Confidentialite
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-text-muted text-center">
            {currentYear} Hakinga. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
