import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, MessageCircle, Share2, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVideoInteractions } from '@/hooks/useVideoInteractions';
import { EnhancedShareModal } from '@/components/EnhancedShareModal';
import { checkIfVideosExist } from '@/utils/videoUtils';

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

function Video() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [videosExist, setVideosExist] = useState<boolean | null>(null);

  const {
    isLiked,
    likeCount,
    commentCount,
    shareCount,
    handleLike,
    handleShare,
    isLoading: interactionsLoading
  } = useVideoInteractions(videoId || '');

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching video with ID:', videoId);
      console.log('Current URL:', window.location.href);
      console.log('Video ID from URL params:', videoId);

      const { data, error: fetchError } = await supabase
        .from('videos')
        .select(`
          *,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('id', videoId)
        .single();

      console.log('Video fetch result:', { data, error: fetchError });
      console.log('Video data details:', {
        id: data?.id,
        title: data?.title,
        video_url: data?.video_url,
        user_id: data?.user_id,
        profiles: data?.profiles
      });

      if (fetchError) {
        console.error('Error fetching video:', fetchError);
        
        // Check if it's a "not found" error
        if (fetchError.code === 'PGRST116') {
          // Check if any videos exist in the database
          const videosExist = await checkIfVideosExist();
          setVideosExist(videosExist);
          
          if (!videosExist) {
            setError('No videos have been uploaded yet. Be the first to upload a video!');
          } else {
            setError('Video not found - this video may have been deleted or the link is invalid');
          }
        } else {
          setError('Failed to load video');
        }
        return;
      }

      if (!data) {
        console.log('No video data returned');
        setError('Video not found');
        return;
      }

      // Validate video URL
      if (!data.video_url || data.video_url.includes('NULL') || !data.video_url.startsWith('http')) {
        console.error('Invalid video URL:', data.video_url);
        setError('Video file is corrupted or missing. Please contact the uploader.');
        return;
      }

      // Test if video URL is accessible
      try {
        const response = await fetch(data.video_url, { method: 'HEAD' });
        if (!response.ok) {
          console.error('Video URL not accessible:', response.status, response.statusText);
          setError('Video file is not accessible. It may have been deleted or moved.');
          return;
        }
        console.log('Video URL is accessible:', data.video_url);
      } catch (urlError) {
        console.error('Error testing video URL:', urlError);
        setError('Video file is not accessible. Please check your internet connection.');
        return;
      }

      console.log('Video loaded successfully:', data);
      setVideo(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = () => {
    if (video) {
      handleShare();
      setIsShareModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Video Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The video you're looking for doesn't exist or has been removed.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {videosExist === false ? (
              <>
                No videos have been uploaded to the platform yet.
                <br />Be the first to share a video with the community!
              </>
            ) : (
              <>
                This might happen if:
                <br />• The video was deleted or moved
                <br />• The link is incorrect or expired
                <br />• The video ID is invalid
                <br />• The video file is corrupted
                <br />
                <br />Try refreshing the page or check the console for more details.
              </>
            )}
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button variant="outline" onClick={() => navigate('/?action=upload')} className="w-full">
              {videosExist === false ? 'Upload First Video' : 'Upload Video'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">OpenTok</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Video Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                  <VideoPlayer
                    src={video.video_url}
                    poster={video.thumbnail_url}
                    muted={false}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            {/* User Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {video.profiles.avatar_url ? (
                      <img
                        src={video.profiles.avatar_url}
                        alt={video.profiles.display_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {video.profiles.username.startsWith('@') 
                        ? video.profiles.username 
                        : `@${video.profiles.username}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {video.profiles.display_name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Details */}
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-2">{video.title}</h2>
                {video.description && (
                  <p className="text-muted-foreground mb-4">{video.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  {video.duration && (
                    <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interactions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    disabled={interactionsLoading}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    {likeCount}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {commentCount}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareClick}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    {shareCount}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">#video</Badge>
                  <Badge variant="secondary">#shorts</Badge>
                  <Badge variant="secondary">#opentok</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {video && (
        <EnhancedShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          videoId={video.id}
          videoTitle={video.title}
          videoUrl={video.video_url}
          shareCount={shareCount}
          onShareCountUpdate={(count) => {
            // Update share count if needed
            console.log('Share count updated:', count);
          }}
        />
      )}
    </div>
  );
}

export default Video;
