import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, SlidersHorizontal, Upload, Zap, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import ModCard from '../components/ModCard';
import { useListMods } from '../hooks/useQueries';

const CATEGORIES = ['All', 'Cars', 'Tracks', 'Textures', 'Gameplay', 'UI', 'Other'];
const GAMES = [
  'All',
  'Underground',
  'Underground 2',
  'Most Wanted',
  'Carbon',
  'ProStreet',
  'The Run',
  'Rivals',
  'Heat',
  'Unbound',
];

export default function ModListingPage() {
  const navigate = useNavigate();
  const { data: mods, isLoading, isError } = useListMods();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGame, setSelectedGame] = useState('All');

  const filteredMods = useMemo(() => {
    if (!mods) return [];
    return mods
      .filter((mod) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          mod.title.toLowerCase().includes(q) ||
          mod.game.toLowerCase().includes(q) ||
          mod.author.toLowerCase().includes(q);
        const matchesCategory = selectedCategory === 'All' || mod.category === selectedCategory;
        const matchesGame = selectedGame === 'All' || mod.game === selectedGame;
        return matchesSearch && matchesCategory && matchesGame;
      })
      .sort((a, b) => Number(b.uploadTimestamp - a.uploadTimestamp));
  }, [mods, search, selectedCategory, selectedGame]);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden">
        <img
          src="/assets/generated/nfs-hero-banner.dim_1400x400.png"
          alt="NFS Mods Hub - Race. Customize. Dominate."
          className="w-full object-cover"
          style={{ maxHeight: '400px' }}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        {/* Fallback hero */}
        <div
          className="hidden w-full items-center justify-center"
          style={{ height: '320px', background: 'linear-gradient(135deg, #0a0a0a 0%, #111 40%, #0d1a00 100%)' }}
        >
          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-10 h-10 text-neon" />
              <h1 className="font-display font-black text-5xl md:text-6xl tracking-tight">
                NFS <span className="text-neon">MODS</span> HUB
              </h1>
            </div>
            <p className="text-muted-foreground text-lg font-medium tracking-widest uppercase">
              Race · Customize · Dominate
            </p>
          </div>
        </div>
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        {mods && mods.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-4 h-4 text-neon" />
            <span className="text-sm text-muted-foreground">
              <span className="text-neon font-bold">{mods.length}</span> mods available
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search mods by title, game, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface border-white/10 focus:border-neon/50 focus:ring-neon/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36 bg-surface border-white/10 focus:border-neon/50 text-foreground">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-surface-elevated border-white/10">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-foreground focus:bg-neon/10 focus:text-neon">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="w-40 bg-surface border-white/10 focus:border-neon/50 text-foreground">
                <SelectValue placeholder="Game" />
              </SelectTrigger>
              <SelectContent className="bg-surface-elevated border-white/10">
                {GAMES.map((game) => (
                  <SelectItem key={game} value={game} className="text-foreground focus:bg-neon/10 focus:text-neon">
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface border border-white/5 rounded-lg p-5 space-y-3">
                <Skeleton className="h-5 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-2/3 bg-white/5" />
                <Skeleton className="h-6 w-24 bg-white/5 rounded-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-3 w-20 bg-white/5" />
                  <Skeleton className="h-3 w-12 bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20">
            <div className="text-destructive text-lg font-semibold mb-2">Failed to load mods</div>
            <p className="text-muted-foreground">Please try refreshing the page.</p>
          </div>
        )}

        {/* Mods Grid */}
        {!isLoading && !isError && filteredMods.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMods.map((mod) => (
              <ModCard key={mod.id.toString()} mod={mod} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredMods.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon/10 border border-neon/20 mb-6">
              <Package className="w-10 h-10 text-neon/60" />
            </div>
            {mods && mods.length === 0 ? (
              <>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">No mods yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to upload a mod to the garage!</p>
                <Button
                  onClick={() => navigate({ to: '/upload' })}
                  className="bg-neon text-black font-bold hover:bg-neon/90 gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload First Mod
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">No mods found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
