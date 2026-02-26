import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  Trash2,
  Upload,
  FolderOpen,
  LogIn,
  Loader2,
  Calendar,
  Gamepad2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetModsByAuthor, useDeleteMod } from '../hooks/useQueries';
import type { Mod } from '../backend';

const CATEGORY_COLORS: Record<string, string> = {
  Cars: 'bg-red-500/20 text-red-400 border-red-500/30',
  Tracks: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Textures: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Gameplay: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  UI: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatFileSize(bytes: bigint): string {
  const n = Number(bytes);
  if (n === 0) return '0 B';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface ModRowProps {
  mod: Mod;
  onDelete: (modId: bigint) => void;
  isDeleting: boolean;
}

function ModRow({ mod, onDelete, isDeleting }: ModRowProps) {
  const categoryClass = CATEGORY_COLORS[mod.category] ?? CATEGORY_COLORS['Other'];

  return (
    <div className="bg-surface border border-white/5 rounded-xl overflow-hidden hover:border-neon/20 transition-all duration-200 group">
      {/* Top neon accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-neon/0 via-neon/40 to-neon/0 group-hover:via-neon transition-all duration-300" />

      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link
              to="/mod/$id"
              params={{ id: mod.id.toString() }}
              className="font-display font-bold text-lg text-foreground hover:text-neon transition-colors truncate"
            >
              {mod.title}
            </Link>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border shrink-0 ${categoryClass}`}>
              {mod.category}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-3 h-3 text-neon/60" />
              NFS: {mod.game}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(mod.uploadTimestamp)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {mod.downloadCount.toString()} downloads
            </span>
            <span className="text-muted-foreground/60">{formatFileSize(mod.fileSize)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-surface border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Delete Mod</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to delete <span className="text-foreground font-semibold">"{mod.title}"</span>?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 text-muted-foreground hover:text-foreground">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(mod.id)}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete Mod
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export default function MyModsPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const principal = identity?.getPrincipal().toString() ?? null;
  const { data: mods, isLoading, isError } = useGetModsByAuthor(principal);
  const deleteMod = useDeleteMod();

  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleDelete = async (modId: bigint) => {
    setDeletingId(modId);
    try {
      await deleteMod.mutateAsync(modId);
      toast.success('Mod deleted', {
        description: 'Your mod has been removed from the garage.',
      });
    } catch (err) {
      const error = err as Error;
      toast.error('Delete failed', {
        description: error.message?.includes('Not authorized')
          ? 'You are not authorized to delete this mod.'
          : 'Something went wrong. Please try again.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Auth guard
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Mods
        </button>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon/10 border border-neon/20 mb-6">
            <LogIn className="w-10 h-10 text-neon" />
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight text-foreground mb-3">
            Login to View <span className="text-neon">My Mods</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Sign in with Internet Identity to manage your uploaded mods.
          </p>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="bg-neon text-black font-bold hover:bg-neon/90 hover:shadow-neon transition-all duration-200 gap-2 px-8"
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Mods
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight mb-2">
            My <span className="text-neon">Mods</span>
          </h1>
          <p className="text-muted-foreground">Manage your uploaded mods.</p>
        </div>
        <Button
          onClick={() => navigate({ to: '/upload' })}
          className="bg-neon text-black font-bold hover:bg-neon/90 hover:shadow-neon transition-all duration-200 gap-2 shrink-0"
        >
          <Upload className="w-4 h-4" />
          Upload New Mod
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-white/5 rounded-xl p-5">
              <Skeleton className="h-5 w-1/2 bg-white/5 mb-3" />
              <Skeleton className="h-4 w-2/3 bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="font-display font-bold text-xl text-foreground mb-2">Failed to load mods</h3>
          <p className="text-muted-foreground">Something went wrong. Please try refreshing the page.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && mods && mods.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon/5 border border-neon/10 mb-6">
            <FolderOpen className="w-10 h-10 text-neon/40" />
          </div>
          <h3 className="font-display font-bold text-2xl text-foreground mb-2">No mods yet</h3>
          <p className="text-muted-foreground mb-8">
            You haven't uploaded any mods. Share your creations with the NFS community!
          </p>
          <Button
            onClick={() => navigate({ to: '/upload' })}
            className="bg-neon text-black font-bold hover:bg-neon/90 hover:shadow-neon transition-all duration-200 gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Your First Mod
          </Button>
        </div>
      )}

      {/* Mod list */}
      {!isLoading && !isError && mods && mods.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {mods.length} mod{mods.length !== 1 ? 's' : ''} uploaded
          </p>
          {mods.map((mod) => (
            <ModRow
              key={mod.id.toString()}
              mod={mod}
              onDelete={handleDelete}
              isDeleting={deletingId === mod.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
