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
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch videos...');
      
      // First, try to fetch videos without the join to see if that's the issue
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (videosError) {
        console.error('Error fetching videos:', videosError);
        throw videosError;
      }

      console.log('Fetched videos from database:', videosData);
      console.log('Number of videos found:', videosData?.length || 0);

      if (!videosData || videosData.length === 0) {
        console.log('No videos found in database');
        setVideos([]);
        toast({
          title: "No Videos Yet",
          description: "Upload your first video to get started!",
          variant: "default",
        });
        return;
      }

      // Now fetch profiles separately to avoid join issues
      const userIds = [...new Set(videosData.map(video => video.user_id))];
      console.log('Fetching profiles for user IDs:', userIds);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles data
      }

      console.log('Fetched profiles:', profilesData);

      // Create a map of profiles for easy lookup
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Safely transform the data to match VideoCard interface
      const transformedVideos = videosData.map((video: any) => {
        try {
          const profile = profilesMap.get(video.user_id);
          return {
            id: video.id || 'unknown',
            videoSrc: video.video_url || '',
            user: {
              id: video.user_id || 'unknown',
              username: profile?.username || 'unknown',
              displayName: profile?.display_name || 'Unknown User',
              avatar: profile?.avatar_url || null,
              verified: false,
            },
            description: video.description || video.title || 'No description',
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isBookmarked: false,
            algorithmScore: Math.random() * 0.3 + 0.7,
            algorithmFactors: ['Recent upload', 'User engagement', 'Content quality'],
          };
        } catch (transformError) {
          console.error('Error transforming video:', video, transformError);
          return null;
        }
      }).filter(Boolean); // Remove any null entries

      console.log('Transformed videos:', transformedVideos);
      setVideos(transformedVideos);
      
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Set empty array to prevent crashes
      setVideos([]);
      setError('Failed to load videos');
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

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Videos</h3>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchVideos();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
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