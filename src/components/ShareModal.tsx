import { useState } from 'react';
import { Share, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  shareCount: number;
  onShareCountUpdate: (count: number) => void;
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  videoId, 
  videoTitle, 
  shareCount, 
  onShareCountUpdate 
}: ShareModalProps) {
  const [copying, setCopying] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const videoUrl = `${window.location.origin}?video=${videoId}`;

  const recordShare = async (shareType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shares')
        .insert({
          video_id: videoId,
          user_id: user.id,
          share_type: shareType
        });

      if (!error) {
        onShareCountUpdate(shareCount + 1);
      }
    } catch (error) {
      console.error('Error recording share:', error);
    }
  };

  const copyToClipboard = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(videoUrl);
      await recordShare('copy_link');
      toast({
        title: "Link copied!",
        description: "Video link has been copied to clipboard"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
    }
  };

  const shareToSocial = async (platform: string) => {
    const encodedTitle = encodeURIComponent(videoTitle);
    const encodedUrl = encodeURIComponent(videoUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'reddit':
        shareUrl = `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    await recordShare(platform);
    onClose();
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      action: copyToClipboard,
      loading: copying
    },
    {
      name: 'Twitter',
      icon: ExternalLink,
      action: () => shareToSocial('twitter'),
      bgColor: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Facebook',
      icon: ExternalLink,
      action: () => shareToSocial('facebook'),
      bgColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'LinkedIn',
      icon: ExternalLink,
      action: () => shareToSocial('linkedin'),
      bgColor: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'Reddit',
      icon: ExternalLink,
      action: () => shareToSocial('reddit'),
      bgColor: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Video URL Display */}
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-sm text-muted-foreground mb-1">Video URL:</p>
            <p className="text-sm break-all font-mono">{videoUrl}</p>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-1 gap-2">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                className={`justify-start gap-3 h-12 ${option.bgColor || ''}`}
                onClick={option.action}
                disabled={option.loading}
              >
                {option.loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <option.icon className="w-4 h-4" />
                )}
                {option.name}
              </Button>
            ))}
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Shared {shareCount} {shareCount === 1 ? 'time' : 'times'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}