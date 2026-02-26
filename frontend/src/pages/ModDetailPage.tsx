import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Download, Calendar, User, Gamepad2, FileArchive, HardDrive, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetModById, useIncrementDownloadCount } from '../hooks/useQueries';

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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: bigint): string {
  const n = Number(bytes);
  if (n === 0) return '0 B';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ModDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/mod/$id' });
  const { data: mod, isLoading, isError } = useGetModById(id);
  const incrementDownload = useIncrementDownloadCount();

  const handleDownload = async () => {
    if (!mod) return;
    try {
      await incrementDownload.mutateAsync(mod.id);
      toast.success('Download started!', {
        description: `Downloading ${mod.fileName}`,
      });
    } catch {
      toast.error('Failed to register download');
    }
  };

  const categoryClass = mod ? (CATEGORY_COLORS[mod.category] ?? CATEGORY_COLORS['Other']) : '';

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

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3 bg-white/5" />
            <Skeleton className="h-5 w-1/3 bg-white/5" />
          </div>
          <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-4">
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-4 w-3/4 bg-white/5" />
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">Mod Not Found</h2>
          <p className="text-muted-foreground mb-6">This mod may have been removed or the link is invalid.</p>
          <Button
            onClick={() => navigate({ to: '/' })}
            className="bg-neon text-black font-bold hover:bg-neon/90"
          >
            Browse All Mods
          </Button>
        </div>
      )}

      {/* Mod Detail */}
      {mod && !isLoading && (
        <article>
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight text-foreground flex-1">
                {mod.title}
              </h1>
              <span className={`text-sm font-semibold px-3 py-1 rounded border ${categoryClass}`}>
                {mod.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-neon/70" />
              <span className="text-sm font-medium text-neon/80 bg-neon/10 px-3 py-1 rounded-full border border-neon/20">
                Need for Speed: {mod.game}
              </span>
            </div>
          </div>

          {/* Main card */}
          <div className="bg-surface border border-white/5 rounded-xl overflow-hidden mb-6">
            {/* Top neon accent */}
            <div className="h-0.5 w-full bg-gradient-to-r from-neon/0 via-neon to-neon/0" />

            <div className="p-6 md:p-8">
              {/* Description */}
              <div className="mb-8">
                <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon/70 mb-3">
                  Description
                </h2>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {mod.description}
                </p>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-background/50 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <User className="w-3 h-3" /> Author
                  </div>
                  <p className="font-semibold text-sm text-foreground truncate">{mod.author}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Download className="w-3 h-3" /> Downloads
                  </div>
                  <p className="font-bold text-sm text-neon">{mod.downloadCount.toString()}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <HardDrive className="w-3 h-3" /> File Size
                  </div>
                  <p className="font-semibold text-sm text-foreground">{formatFileSize(mod.fileSize)}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3 h-3" /> Uploaded
                  </div>
                  <p className="font-semibold text-xs text-foreground">{formatDate(mod.uploadTimestamp)}</p>
                </div>
              </div>

              {/* File info */}
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-white/5 mb-6">
                <FileArchive className="w-8 h-8 text-neon/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{mod.fileName}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(mod.fileSize)}</p>
                </div>
              </div>

              {/* Download button */}
              <Button
                onClick={handleDownload}
                disabled={incrementDownload.isPending}
                className="w-full bg-neon text-black font-bold text-base py-6 hover:bg-neon/90 hover:shadow-neon transition-all duration-200 gap-2"
              >
                {incrementDownload.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Mod
                  </>
                )}
              </Button>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
