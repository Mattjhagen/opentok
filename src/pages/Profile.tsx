import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, ExternalLink, Video, Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlayer } from '@/components/VideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  follower_count: number;
  following_count: number;
  video_count: number;
  created_at: string;
}

interface UserVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  likes: number;
  comments: number;
  shares: number;
}

function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Clean username (remove @ if present)
      const cleanUsername = username?.startsWith('@') ? username.slice(1) : username;
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        
        // If profile doesn't exist and this is the current user, create it
        if (profileError.code === 'PGRST116' && currentUser && cleanUsername === currentUser.user_metadata?.username) {
          console.log('Creating profile for current user...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: currentUser.id,
              username: cleanUsername,
              display_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || 'User',
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          
          setProfile(newProfile);
          setIsCurrentUser(true);
          return; // Skip video fetching for now
        }
        
        throw profileError;
      }
      
      if (!profileData) {
        throw new Error('Profile not found');
      }
      
      setProfile(profileData);

      // Check if this is the current user's profile
      setIsCurrentUser(currentUser?.id === profileData.id);

      // Fetch user's videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          *,
          likes:video_id(count),
          comments:video_id(count),
          shares:video_id(count)
        `)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      const transformedVideos = videosData?.map((video: any) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        created_at: video.created_at,
        likes: video.likes?.[0]?.count || 0,
        comments: video.comments?.[0]?.count || 0,
        shares: video.shares?.[0]?.count || 0,
      })) || [];

      setVideos(transformedVideos);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.display_name} (@${profile?.username})`,
          text: `Check out ${profile?.display_name}'s profile on OpenTok!`,
          url: profileUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link copied!",
        description: "Profile link has been copied to your clipboard.",
      });
    }
  };

  const handleShareVideo = async (videoId: string, videoTitle: string) => {
    const videoUrl = `${window.location.origin}/video/${videoId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoTitle,
          text: `Check out this video by ${profile?.display_name}!`,
          url: videoUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(videoUrl);
      toast({
        title: "Link copied!",
        description: "Video link has been copied to your clipboard.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-64 bg-muted rounded animate-pulse"></div>
          <div className="h-32 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">
            The user you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold">{profile.display_name}</h2>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="mt-2">
                      You
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {profile.bio && (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}

                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.video_count}</div>
                    <div className="text-sm text-muted-foreground">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.follower_count}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.following_count}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleShareProfile}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                  {isCurrentUser && (
                    <Button variant="outline">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Videos ({videos.length})
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Liked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-4">
            {videos.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
                  <p className="text-muted-foreground">
                    {isCurrentUser 
                      ? "Upload your first video to get started!" 
                      : `${profile.display_name} hasn't uploaded any videos yet.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <VideoPlayer
                        src={video.video_url}
                        poster={video.thumbnail_url}
                        autoPlay={false}
                        muted={true}
                        loop={false}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {video.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {video.comments}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="w-3 h-3" />
                            {video.shares}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShareVideo(video.id, video.title)}
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked">
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No liked videos</h3>
                <p className="text-muted-foreground">
                  {isCurrentUser 
                    ? "Like some videos to see them here!" 
                    : `${profile.display_name}'s liked videos are private.`
                  }
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Profile;
