import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, ExternalLink, Video, Heart, MessageCircle, Share, Bookmark, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EditProfileModal } from '@/components/EditProfileModal';
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
  const { user: currentUser, ensureProfile } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username, currentUser]);


  const retryProfileCreation = async () => {
    console.log('Retrying profile creation...');
    setRetryCount(prev => prev + 1);
    setError(null);
    await fetchProfile();
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile);
  };

  const fetchVideos = async (userId: string) => {
    try {
      console.log('=== FETCHING VIDEOS ===');
      console.log('User ID:', userId);
      console.log('Current user ID:', currentUser?.id);
      
      // First, let's check all videos in the database to see what's there
      const { data: allVideos, error: allVideosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('=== ALL VIDEOS IN DATABASE ===');
      console.log('All videos:', allVideos);
      console.log('Total videos in database:', allVideos?.length || 0);
      
      // Now fetch videos for this specific user
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('Videos fetch result for user:', { videosData, videosError });
      console.log('Number of videos found for user:', videosData?.length || 0);

      if (videosError) {
        console.error('Error fetching videos:', videosError);
        return [];
      }

      const transformedVideos = videosData?.map((video: any) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        created_at: video.created_at,
        likes: 0, // Will be fetched separately if needed
        comments: 0, // Will be fetched separately if needed
        shares: 0, // Will be fetched separately if needed
      })) || [];

      console.log('Transformed videos:', transformedVideos);
      console.log('Setting videos state with:', transformedVideos.length, 'videos');
      setVideos(transformedVideos);
      return transformedVideos;
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        
        // If profile doesn't exist and this is the current user, try to create it
        if ((profileError.code === 'PGRST116' || profileError.code === 'PGRST301' || profileError.status === 406) && currentUser) {
          console.log('Profile not found, checking if this is current user...');
          console.log('cleanUsername:', cleanUsername);
          console.log('currentUser.user_metadata?.username:', currentUser.user_metadata?.username);
          console.log('currentUser.email:', currentUser.email);
          console.log('currentUser.id:', currentUser.id);
          
          // Check if this is the current user by comparing usernames or email
          const currentUserUsername = currentUser.user_metadata?.username?.startsWith('@') 
            ? currentUser.user_metadata.username.slice(1) 
            : currentUser.user_metadata?.username;
          const currentUserEmailPrefix = currentUser.email?.split('@')[0];
          
          const isCurrentUser = cleanUsername === currentUserUsername || 
                               cleanUsername === currentUserEmailPrefix ||
                               cleanUsername === 'me' ||
                               cleanUsername === 'matty' ||
                               cleanUsername === currentUser.id;
          
          console.log('isCurrentUser:', isCurrentUser);
          
          if (isCurrentUser) {
            console.log('This is the current user, ensuring profile exists...');
            
            // Use the ensureProfile function from auth hook
            const profile = await ensureProfile();
            if (profile) {
              setProfile(profile);
              setIsCurrentUser(true);
              
              // Redirect to the correct profile URL if needed
              if (profile.username !== cleanUsername) {
                navigate(`/profile/${profile.username}`, { replace: true });
                return;
              }
              
              // Fetch videos for this profile
              fetchVideos(profile.id);
              return;
            } else {
              console.error('Failed to create or find profile for current user');
              setError('Failed to create profile. Please try refreshing the page or contact support.');
              return;
            }
          }
        }
        
        // If we get here and the user is authenticated, try to create/find their profile
        if (currentUser) {
          console.log('Attempting to create or find profile for authenticated user...');
          
          // Use the ensureProfile function from auth hook
          const profile = await ensureProfile();
          if (profile) {
            setProfile(profile);
            setIsCurrentUser(true);
            
            // Redirect to the correct profile URL if needed
            if (profile.username !== cleanUsername) {
              navigate(`/profile/${profile.username}`, { replace: true });
              return;
            }
            
            // Fetch videos for this profile
            fetchVideos(profile.id);
            return;
          } else {
            console.error('Failed to create or find profile for authenticated user');
            setError('Failed to load profile. Please try refreshing the page or contact support.');
            return;
          }
        }
        
        throw profileError;
      }
      
      if (!profileData) {
        throw new Error('Profile not found');
      }
      
      setProfile(profileData);

      // Check if this is the current user's profile
      setIsCurrentUser(currentUser?.id === profileData.id);

      // Fetch user's videos using the dedicated function
      await fetchVideos(profileData.id);
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
    // Clean the username to remove @ symbol for URL
    const cleanUsername = username?.startsWith('@') ? username.slice(1) : username;
    const profileUrl = `${window.location.origin}/profile/${cleanUsername}`;
    
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
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "The user you're looking for doesn't exist."}
          </p>
          
          {/* Show retry button if this is the current user and we have an error */}
          {currentUser && error && retryCount < 3 && (
            <div className="mb-4">
              <Button 
                onClick={retryProfileCreation}
                variant="outline"
                className="mr-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry ({retryCount}/3)
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            
            {currentUser && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/?action=upload')} 
                className="w-full"
              >
                Upload Video
              </Button>
            )}
          </div>
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
                  <p className="text-muted-foreground">{profile.username.startsWith('@') ? profile.username : `@${profile.username}`}</p>
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
                  {!isCurrentUser && currentUser && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/chat/${profile.id}`)}
                      className="bg-transparent border-primary/20 text-primary hover:bg-primary/10"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  )}
                  {isCurrentUser && (
                    <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
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

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

export default Profile;
