import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Download, Calendar, User, Gamepad2, FileArchive, HardDrive, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
        description: `Downloading "${mod.title}"`,
      });
    } catch {
      toast.error('Download failed', {
        description: 'Could not process the download. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Skeleton className="h-6 w-32 mb-8" />
        <Skeleton className="w-full aspect-video rounded-xl mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Mods
        </button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="font-display font-black text-2xl mb-2">Mod Not Found</h2>
          <p className="text-muted-foreground">This mod doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const categoryClass = CATEGORY_COLORS[mod.category] ?? CATEGORY_COLORS['Other'];
  const previewUrl = mod.previewImage ? mod.previewImage.getDirectURL() : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Mods
      </button>

      {/* Preview Image */}
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface border border-white/5 mb-8 shadow-neon-sm">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${mod.title} preview`}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/assets/generated/mod-preview-placeholder.dim_800x450.png"
            alt="No preview available"
            className="w-full h-full object-cover opacity-40"
          />
        )}
      </div>

      {/* Title & Category */}
      <div className="flex flex-wrap items-start gap-3 mb-4">
        <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight text-foreground flex-1">
          {mod.title}
        </h1>
        <span className={`text-sm font-semibold px-3 py-1 rounded border ${categoryClass} shrink-0 mt-1`}>
          {mod.category}
        </span>
      </div>

      {/* Game tag */}
      <div className="flex items-center gap-2 mb-6">
        <Gamepad2 className="w-4 h-4 text-neon/70" />
        <span className="text-sm font-medium text-neon/80 bg-neon/10 px-3 py-1 rounded-full border border-neon/20">
          {mod.game}
        </span>
      </div>

      {/* Description */}
      {mod.description && (
        <p className="text-muted-foreground leading-relaxed mb-8 text-base">
          {mod.description}
        </p>
      )}

      {/* Metadata grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <User className="w-3.5 h-3.5" />
            Author
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{mod.author}</p>
        </div>
        <div className="bg-surface border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Uploaded
          </div>
          <p className="text-sm font-semibold text-foreground">{formatDate(mod.uploadTimestamp)}</p>
        </div>
        <div className="bg-surface border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Download className="w-3.5 h-3.5" />
            Downloads
          </div>
          <p className="text-sm font-semibold text-neon">{mod.downloadCount.toString()}</p>
        </div>
        <div className="bg-surface border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <HardDrive className="w-3.5 h-3.5" />
            File Size
          </div>
          <p className="text-sm font-semibold text-foreground">{formatFileSize(mod.fileSize)}</p>
        </div>
      </div>

      {/* File info & Download */}
      <div className="bg-surface border border-white/5 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center shrink-0">
            <FileArchive className="w-5 h-5 text-neon" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{mod.fileName}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(mod.fileSize)}</p>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={incrementDownload.isPending}
          className="bg-neon text-black font-bold hover:bg-neon/90 transition-all duration-200 gap-2 shrink-0 shadow-neon-btn hover:shadow-neon-lg neon-button-active"
        >
          {incrementDownload.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Mod
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
