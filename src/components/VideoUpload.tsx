import { useState, useRef } from 'react';
import { Upload, X, Video, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateDemoVideoFile, DEMO_PRESETS } from '@/utils/sampleVideoGenerator';

interface VideoUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoUpload({ isOpen, onClose }: VideoUploadProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingDemoKey, setGeneratingDemoKey] = useState<string | null>(null);
  const [uploadAllStatus, setUploadAllStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a video file smaller than 100MB",
          variant: "destructive"
        });
        return;
      }
      
      setVideoFile(file);
    }
  };

  const handleGeneratePreset = async (presetKey: string) => {
    try {
      setGeneratingDemoKey(presetKey);
      toast({
        title: "Generating Demo Video...",
        description: "Rendering 9:16 vertical animation...",
      });

      const { file, title: presetTitle, description: presetDesc } = await generateDemoVideoFile(
        presetKey as any,
        4
      );

      setVideoFile(file);
      setTitle(presetTitle);
      setDescription(presetDesc);

      toast({
        title: "Demo Video Ready! 🎬",
        description: "Click 'Upload Video' to publish it to the feed.",
      });
    } catch (err: any) {
      console.error('Demo generation error:', err);
      toast({
        title: "Generation failed",
        description: err.message || "Could not generate demo video",
        variant: "destructive"
      });
    } finally {
      setGeneratingDemoKey(null);
    }
  };

  const handleUploadAllDemos = async () => {
    if (!user) return;
    try {
      const keys = Object.keys(DEMO_PRESETS);
      setUploading(true);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const preset = DEMO_PRESETS[key];
        const statusMsg = `Generating & Uploading ${i + 1}/${keys.length}: ${preset.name}...`;
        setUploadAllStatus(statusMsg);
        
        toast({
          title: `Step ${i + 1} of ${keys.length}`,
          description: `Generating and uploading ${preset.name}...`,
        });

        const { file, title: presetTitle, description: presetDesc } = await generateDemoVideoFile(
          key as any,
          4
        );

        const timestamp = Date.now() + i * 1000;
        const fileName = `${user.id}/${timestamp}.webm`;

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('videos')
          .insert({
            title: presetTitle,
            description: presetDesc,
            video_url: publicUrl,
            user_id: user.id,
            duration: 4,
            is_public: true
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "All 4 Demo Videos Uploaded! 🚀",
        description: "Your feed is now populated with all 4 videos.",
      });

      window.dispatchEvent(new CustomEvent('video-uploaded'));
      onClose();
    } catch (err: any) {
      console.error('Batch upload error:', err);
      toast({
        title: "Upload failed",
        description: err.message || "Could not upload all videos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadAllStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!user || !videoFile || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a video",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const timestamp = Date.now();
      const fileExtension = videoFile.name.split('.').pop() || 'webm';
      const fileName = `${user.id}/${timestamp}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, videoFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          video_url: publicUrl,
          user_id: user.id,
          duration: 4,
          is_public: true
        })
        .select()
        .single();

      if (dbError) {
        await supabase.storage.from('videos').remove([fileName]);
        throw dbError;
      }

      toast({
        title: "Video uploaded successfully! 🎉",
        description: "Your video is now live on OpenTok."
      });

      window.dispatchEvent(new CustomEvent('video-uploaded'));

      setTitle('');
      setDescription('');
      setVideoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md bg-card/95 backdrop-blur border-border"
        aria-describedby="upload-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Video className="w-5 h-5 text-primary" />
            Upload Video
          </DialogTitle>
          <p id="upload-description" className="text-sm text-muted-foreground">
            Upload a video or generate one of our creative demo presets.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Demo Preset Buttons */}
          <div className="p-3 bg-secondary/50 rounded-lg border border-border/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-primary">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Quick Demo Generators
              </span>
            </div>

            {/* Upload All 4 Button */}
            <Button
              type="button"
              disabled={uploading || generatingDemoKey !== null}
              onClick={handleUploadAllDemos}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-xs h-9 shadow-glow-primary flex items-center justify-center gap-2"
            >
              {uploadAllStatus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{uploadAllStatus}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🚀 Auto-Upload All 4 Demos (1-Click)</span>
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {Object.entries(DEMO_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={generatingDemoKey !== null || uploading}
                  onClick={() => handleGeneratePreset(key)}
                  className="text-xs h-8 justify-start truncate hover:border-primary/60 hover:text-primary transition-all"
                >
                  {generatingDemoKey === key ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : null}
                  <span className="truncate">{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Video File Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Video File *</label>
            {!videoFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary transition-colors bg-secondary/20"
              >
                <Upload className="w-7 h-7 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select a video file
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP4 or WebM (Max 100MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border/60">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Video className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm truncate">
                    {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeVideo}
                  className="h-6 w-6 p-0 shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Upload Button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={uploading || generatingDemoKey !== null}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!videoFile || !title.trim() || uploading || generatingDemoKey !== null}
              className="bg-gradient-primary hover:opacity-90 text-white shadow-glow-primary"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}