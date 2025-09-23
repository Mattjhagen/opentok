import { useState } from 'react';
import { Share, Copy, MessageCircle, Mail, Twitter, Facebook, Link, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  videoUrl?: string;
  shareCount: number;
  onShareCountUpdate: (count: number) => void;
}

export function EnhancedShareModal({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  videoUrl,
  shareCount,
  onShareCountUpdate
}: EnhancedShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const baseUrl = window.location.origin;
  const fullShareUrl = `${baseUrl}/video/${videoId}`;

  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing Not Supported",
        description: "Your browser doesn't support native sharing. Use the copy link option instead.",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.share({
        title: videoTitle,
        text: `Check out this video on OpenTok: ${videoTitle}`,
        url: fullShareUrl,
      });
      
      await recordShare('native');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast({
          title: "Share Failed",
          description: "Failed to share. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const shareToSocial = async (platform: string) => {
    const encodedUrl = encodeURIComponent(fullShareUrl);
    const encodedTitle = encodeURIComponent(videoTitle);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=OpenTok,Video`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      await recordShare(platform);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this video: ${videoTitle}`);
    const body = encodeURIComponent(
      `I found this interesting video on OpenTok and thought you might like it:\n\n${videoTitle}\n\nWatch it here: ${fullShareUrl}\n\n- Shared from OpenTok`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    recordShare('email');
  };

  const generateQRCode = async () => {
    setIsGeneratingQr(true);
    try {
      // Using a free QR code API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullShareUrl)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "QR Code Failed",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const downloadVideo = async () => {
    if (!videoUrl) {
      toast({
        title: "Download Not Available",
        description: "Video download is not available for this content",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      await recordShare('download');
    } catch (error) {
      console.error('Error downloading video:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download video",
        variant: "destructive"
      });
    }
  };

  const recordShare = async (method: string) => {
    try {
      const { error } = await supabase
        .from('shares')
        .insert({
          video_id: videoId,
          user_id: user?.id,
          share_type: method
        });

      if (!error) {
        onShareCountUpdate(shareCount + 1);
      }
    } catch (error) {
      console.error('Error recording share:', error);
    }
  };

  const socialPlatforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: Link, color: 'text-blue-700' },
    { id: 'reddit', name: 'Reddit', icon: MessageCircle, color: 'text-orange-500' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
    { id: 'telegram', name: 'Telegram', icon: MessageCircle, color: 'text-blue-500' },
  ];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share Video
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4">
            {/* Native Share */}
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                className="w-full bg-gradient-primary hover:opacity-90 text-white"
              >
                <Share className="w-4 h-4 mr-2" />
                Share with Native App
              </Button>
            )}

            {/* Copy Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Link</label>
              <div className="flex gap-2">
                <Input
                  value={fullShareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(fullShareUrl, 'Link')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Share to Social Media</label>
              <div className="grid grid-cols-3 gap-2">
                {socialPlatforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <Button
                      key={platform.id}
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial(platform.id)}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <IconComponent className={`w-4 h-4 ${platform.color}`} />
                      <span className="text-xs">{platform.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Email */}
            <Button
              variant="outline"
              onClick={shareViaEmail}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Share via Email
            </Button>

            {/* Download */}
            {videoUrl && (
              <Button
                variant="outline"
                onClick={downloadVideo}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Video
              </Button>
            )}
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Embed Code</CardTitle>
                <CardDescription>
                  Copy this code to embed the video on your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <textarea
                    value={`<iframe src="${baseUrl}/embed/${videoId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`}
                    readOnly
                    className="w-full h-20 p-2 text-xs bg-secondary rounded border resize-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(
                      `<iframe src="${baseUrl}/embed/${videoId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`,
                      'Embed code'
                    )}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Embed Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="text-center space-y-4">
              {qrCodeUrl ? (
                <div className="space-y-2">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="mx-auto border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(fullShareUrl, 'QR Code URL')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Generate a QR code for easy sharing
                  </p>
                  <Button
                    onClick={generateQRCode}
                    disabled={isGeneratingQr}
                    variant="outline"
                  >
                    {isGeneratingQr ? 'Generating...' : 'Generate QR Code'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Share className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {shareCount} shares
            </span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
