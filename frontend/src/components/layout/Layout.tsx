import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Main layout wrapper with header and footer
 */
export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/**
 * Clean layout for typing sessions without distractions
 */
export function SessionLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

/**
 * Auth layout for login/register pages
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Outlet />
    </div>
  );
}
