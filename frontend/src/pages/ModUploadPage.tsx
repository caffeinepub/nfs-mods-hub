import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Upload, FileArchive, CheckCircle2, AlertCircle, Loader2, LogIn, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUploadMod } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ExternalBlob } from '../backend';

const NFS_GAMES = [
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

const CATEGORIES = ['Cars', 'Tracks', 'Textures', 'Gameplay', 'UI', 'Other'];

interface FormData {
  title: string;
  description: string;
  game: string;
  category: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  game?: string;
  category?: string;
  file?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ModUploadPage() {
  const navigate = useNavigate();
  const uploadMod = useUploadMod();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { login, loginStatus, identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    game: '',
    category: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.game) newErrors.game = 'Please select a game';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!selectedFile) newErrors.file = 'Please select a mod file';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !identity) return;

    const principal = identity.getPrincipal().toString();

    let previewImage: ExternalBlob | undefined = undefined;
    if (previewImageFile) {
      const arrayBuffer = await previewImageFile.arrayBuffer();
      previewImage = ExternalBlob.fromBytes(new Uint8Array(arrayBuffer));
    }

    try {
      await uploadMod.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        game: formData.game,
        category: formData.category,
        author: principal,
        fileName: selectedFile!.name,
        fileSize: BigInt(selectedFile!.size),
        previewImage,
      });
      toast.success('Mod uploaded successfully!', {
        description: `"${formData.title}" has been added to the garage.`,
      });
      navigate({ to: '/my-mods' });
    } catch (err) {
      toast.error('Upload failed', {
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const handlePreviewImageChange = (file: File | null) => {
    if (file) {
      setPreviewImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewImageUrl(url);
    }
  };

  const clearPreviewImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
    setPreviewImageFile(null);
    setPreviewImageUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Auth guard
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Mods
        </button>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon/10 border border-neon/20 mb-6 shadow-neon-sm">
            <LogIn className="w-10 h-10 text-neon" />
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight text-foreground mb-3">
            Login to <span className="text-neon neon-text-glow-sm">Upload</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            You need to be logged in to upload mods. Sign in with Internet Identity to share your creations with the NFS community.
          </p>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="bg-neon text-black font-bold hover:bg-neon/90 transition-all duration-200 gap-2 px-8 shadow-neon-btn hover:shadow-neon-lg neon-button-active"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Login to Upload
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Mods
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight mb-2">
          Upload <span className="text-neon neon-text-glow-sm">Mod</span>
        </h1>
        <p className="text-muted-foreground">Share your creation with the NFS community.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold text-foreground">
            Mod Title <span className="text-neon">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Lamborghini Huracán STO"
            className="bg-surface border-white/10 focus:border-neon/50 text-foreground placeholder:text-muted-foreground"
          />
          {errors.title && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-foreground">
            Description <span className="text-neon">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe your mod, installation instructions, features..."
            rows={4}
            className="bg-surface border-white/10 focus:border-neon/50 text-foreground placeholder:text-muted-foreground resize-none"
          />
          {errors.description && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.description}
            </p>
          )}
        </div>

        {/* Game & Category row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              NFS Game <span className="text-neon">*</span>
            </Label>
            <Select value={formData.game} onValueChange={(v) => updateField('game', v)}>
              <SelectTrigger className="bg-surface border-white/10 focus:border-neon/50 text-foreground data-[placeholder]:text-muted-foreground">
                <SelectValue placeholder="Select game..." />
              </SelectTrigger>
              <SelectContent className="bg-surface-elevated border-white/10">
                {NFS_GAMES.map((game) => (
                  <SelectItem key={game} value={game} className="text-foreground focus:bg-neon/10 focus:text-neon">
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.game && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.game}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Category <span className="text-neon">*</span>
            </Label>
            <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
              <SelectTrigger className="bg-surface border-white/10 focus:border-neon/50 text-foreground data-[placeholder]:text-muted-foreground">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="bg-surface-elevated border-white/10">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-foreground focus:bg-neon/10 focus:text-neon">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.category}
              </p>
            )}
          </div>
        </div>

        {/* Preview Image Upload (optional) */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">
            Preview Image{' '}
            <span className="text-muted-foreground font-normal text-xs">(optional)</span>
          </Label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handlePreviewImageChange(e.target.files?.[0] ?? null)}
          />
          {previewImageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-neon/30 bg-surface">
              <div className="aspect-video w-full">
                <img
                  src={previewImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="bg-surface/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-neon hover:text-black transition-colors"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={clearPreviewImage}
                  className="bg-destructive/80 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-destructive transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
              <div className="px-3 py-2 border-t border-white/5 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{previewImageFile?.name}</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-neon/30 hover:bg-white/2 rounded-lg p-6 text-center cursor-pointer transition-all duration-200"
            >
              <div className="flex flex-col items-center gap-2">
                <ImagePlus className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm font-semibold text-foreground">Add a preview screenshot</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP or GIF</p>
              </div>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">
            Mod File <span className="text-neon">*</span>
          </Label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-neon bg-neon/5 shadow-neon-sm'
                : selectedFile
                ? 'border-neon/40 bg-neon/5'
                : 'border-white/10 hover:border-neon/30 hover:bg-white/2'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-neon drop-shadow-[0_0_8px_#c8ff00]" />
                <p className="font-semibold text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                <p className="text-xs text-neon/70">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileArchive className="w-10 h-10 text-muted-foreground/50" />
                <p className="font-semibold text-foreground">Drop your mod file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
                <p className="text-xs text-muted-foreground/60">Any file type accepted</p>
              </div>
            )}
          </div>
          {errors.file && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.file}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={uploadMod.isPending}
          className="w-full bg-neon text-black font-bold text-base py-6 hover:bg-neon/90 transition-all duration-200 gap-2 shadow-neon-btn hover:shadow-neon-lg neon-button-active"
        >
          {uploadMod.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Mod
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
