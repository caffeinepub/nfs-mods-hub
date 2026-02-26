import { useNavigate } from '@tanstack/react-router';
import { Download, Calendar, User, Gamepad2 } from 'lucide-react';
import type { Mod } from '../backend';

interface ModCardProps {
  mod: Mod;
}

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

export default function ModCard({ mod }: ModCardProps) {
  const navigate = useNavigate();
  const categoryClass = CATEGORY_COLORS[mod.category] ?? CATEGORY_COLORS['Other'];
  const previewUrl = mod.previewImage ? mod.previewImage.getDirectURL() : null;

  return (
    <article
      onClick={() => navigate({ to: '/mod/$id', params: { id: mod.id.toString() } })}
      className="group relative bg-surface border border-white/5 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:border-neon/50 hover:shadow-neon-card hover:-translate-y-1 flex flex-col"
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-neon/0 via-neon/80 to-neon/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_#c8ff00]" />

      {/* Preview Image */}
      <div className="relative w-full aspect-video overflow-hidden bg-background/60 shrink-0">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${mod.title} preview`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <img
            src="/assets/generated/mod-preview-placeholder.dim_800x450.png"
            alt="No preview available"
            className="w-full h-full object-cover opacity-40"
          />
        )}
        {/* Category badge overlay */}
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded border backdrop-blur-sm ${categoryClass}`}>
          {mod.category}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-display font-bold text-base text-foreground leading-tight group-hover:text-neon group-hover:neon-text-glow-sm transition-colors duration-200 line-clamp-2 mb-2">
          {mod.title}
        </h3>

        {/* Description */}
        {mod.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {mod.description}
          </p>
        )}

        {/* Game badge */}
        <div className="flex items-center gap-1.5 mb-4">
          <Gamepad2 className="w-3.5 h-3.5 text-neon/70" />
          <span className="text-xs font-medium text-neon/80 bg-neon/10 px-2 py-0.5 rounded-full border border-neon/20">
            {mod.game}
          </span>
        </div>

        {/* Footer metadata */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {mod.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(mod.uploadTimestamp)}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="w-3 h-3" />
            {mod.downloadCount.toString()}
          </span>
        </div>
      </div>
    </article>
  );
}
