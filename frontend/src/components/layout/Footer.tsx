import { Keyboard, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#0f0f0f] border-t border-[#2a2a2a] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Hakinga</span>
            <span className="text-xs text-[#71717a]">v1.0.0</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-[#a1a1aa]">
            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#2a2a2a] text-center">
          <p className="text-xs text-[#71717a]">
            &copy; {new Date().getFullYear()} Hakinga. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
