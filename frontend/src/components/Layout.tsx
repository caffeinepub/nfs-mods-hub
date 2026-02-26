import { Link, useNavigate } from '@tanstack/react-router';
import { Upload, Zap, LogIn, LogOut, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface LayoutProps {
  children: React.ReactNode;
}

function abbreviatePrincipal(principal: string): string {
  if (principal.length <= 10) return principal;
  return `${principal.slice(0, 5)}…${principal.slice(-3)}`;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const principalText = identity ? abbreviatePrincipal(identity.getPrincipal().toString()) : '';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-neon/20 bg-surface/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Zap className="w-5 h-5 text-neon drop-shadow-[0_0_6px_#c8ff00]" />
              <span className="font-display font-black text-xl tracking-widest uppercase text-neon neon-pulse select-none">
                NFS MODS HUB
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-semibold tracking-wide text-muted-foreground hover:text-neon transition-colors duration-200 [&.active]:text-neon [&.active]:neon-text-glow-sm hover:neon-text-glow-sm relative group/navlink"
              >
                Browse Mods
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-neon group-hover/navlink:w-full [.active_&]:w-full transition-all duration-300 shadow-[0_0_6px_#c8ff00]" />
              </Link>
              {isAuthenticated && (
                <Link
                  to="/my-mods"
                  className="text-sm font-semibold tracking-wide text-muted-foreground hover:text-neon transition-colors duration-200 [&.active]:text-neon [&.active]:neon-text-glow-sm hover:neon-text-glow-sm flex items-center gap-1.5 relative group/navlink"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  My Mods
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-neon group-hover/navlink:w-full [.active_&]:w-full transition-all duration-300 shadow-[0_0_6px_#c8ff00]" />
                </Link>
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <Button
                  onClick={() => navigate({ to: '/upload' })}
                  className="hidden sm:flex bg-neon text-black font-bold hover:bg-neon/90 transition-all duration-200 gap-2 shadow-neon-btn hover:shadow-neon-lg neon-button-active"
                >
                  <Upload className="w-4 h-4" />
                  Upload Mod
                </Button>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:block text-xs text-muted-foreground font-mono bg-surface border border-white/10 px-2 py-1 rounded">
                    {principalText}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="bg-neon text-black font-bold hover:bg-neon/90 transition-all duration-200 gap-2 shadow-neon-btn hover:shadow-neon-lg neon-button-active"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging in…
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Login
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neon/10 bg-surface mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon drop-shadow-[0_0_6px_#c8ff00]" />
              <span className="font-display font-black text-lg tracking-widest uppercase">
                NFS <span className="text-neon neon-text-glow-sm">MODS</span> HUB
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              The ultimate destination for Need for Speed mods. Race, customize, dominate.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} · Built with{' '}
              <span className="text-neon">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'nfs-mods-hub')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
