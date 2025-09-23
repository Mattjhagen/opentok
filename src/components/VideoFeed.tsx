import { useState, useEffect } from 'react';
import { VideoCard } from './VideoCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  likes: { count: number; user_liked: boolean }[];
  comments: { count: number }[];
  shares: { count: number }[];
}

export function VideoFeed() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id(username, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      console.log('Fetched videos from database:', data);
      console.log('Number of videos found:', data?.length || 0);

      // Transform the data to match VideoCard interface
      const transformedVideos = data?.map((video: any) => ({
        id: video.id,
        videoSrc: video.video_url,
        user: {
          id: video.user_id,
          username: video.profiles?.username || 'unknown',
          displayName: video.profiles?.display_name || 'Unknown User',
          avatar: video.profiles?.avatar_url,
          verified: false, // You can add verification logic later
        },
        description: video.description || video.title,
        likes: 0, // Will be fetched separately
        comments: 0, // Will be fetched separately
        shares: 0, // Will be fetched separately
        isLiked: false, // Will be checked separately
        isBookmarked: false, // You can add bookmarking logic later
        algorithmScore: Math.random() * 0.3 + 0.7, // Mock algorithm score
        algorithmFactors: ['Recent upload', 'User engagement', 'Content quality'],
      })) || [];

      setVideos(transformedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-screen bg-card animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="h-64 w-64 bg-muted rounded-lg mb-4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to upload a video and start the community!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {videos.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
}