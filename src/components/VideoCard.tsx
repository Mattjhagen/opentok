import { useState, useEffect, useRef } from 'react';
import { Heart, Share, Bookmark, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoPlayer } from './VideoPlayer';
import { CommentsModal } from './CommentsModal';
import { EnhancedShareModal } from './EnhancedShareModal';
import { useVideoInteractions } from '@/hooks/useVideoInteractions';
import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
  id: string;
  videoSrc: string;
  thumbnail?: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    verified?: boolean;
  };
  description: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  algorithmScore?: number;
  algorithmFactors?: string[];
}

export function VideoCard({
  id,
  videoSrc,
  thumbnail,
  user,
  description,
  likes: initialLikes,
  comments: initialComments,
  shares: initialShares,
  isLiked: initialIsLiked = false,
  isBookmarked = false,
  algorithmScore = 0.85,
  algorithmFactors = ['Engagement rate', 'Recent activity', 'Similar interests']
}: VideoCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [shares, setShares] = useState(initialShares);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const {
    isLiked,
    likeCount,
    commentCount,
    shareCount,
    toggleLike,
    loading: likeLoading,
    updateCommentCount,
    updateShareCount
  } = useVideoInteractions({
    videoId: id,
    onLikeUpdate: (liked, count) => setLikes(count),
    onCommentCountUpdate: (count) => setComments(count),
    onShareCountUpdate: (count) => setShares(count)
  });

  // Handle profile navigation
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Profile click triggered for user:', user);
    const cleanUsername = user.username.startsWith('@') ? user.username.slice(1) : user.username;
    console.log('Navigating to profile:', `/profile/${cleanUsername}`);
    navigate(`/profile/${cleanUsername}`);
  };

  // Intersection Observer to detect when video is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.5, // Video is considered visible when 50% is in view
        rootMargin: '0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div ref={cardRef} className="relative w-full h-screen bg-card snap-start snap-always">
      {/* Video Player */}
      <VideoPlayer 
        src={videoSrc} 
        poster={thumbnail}
        autoPlay={isVisible}
        muted={!isVisible}
        loop={true}
      />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex z-10">
        {/* Left side - User info and description */}
        <div className="flex-1 flex flex-col justify-end p-4 pb-20 md:pb-8">
          <div className="space-y-3">
            {/* User info */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleProfileClick}
                className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 hover:scale-105 cursor-pointer p-1 rounded-lg hover:bg-white/5"
                title={`View ${user.displayName}'s profile`}
              >
                <Avatar className="w-12 h-12 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-white font-medium">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{user.displayName}</h3>
                    {user.verified && (
                      <div className="w-4 h-4 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground hover:text-primary/80 transition-colors">
                    {user.username.startsWith('@') ? user.username : `@${user.username}`}
                  </p>
                </div>
              </button>
              
            </div>

            {/* Description */}
            <p className="text-foreground text-sm leading-relaxed max-w-sm">
              {description}
            </p>

            {/* Algorithm Transparency */}
            <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 max-w-sm border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Algorithm Score</span>
                <span className="text-xs text-primary font-bold">{(algorithmScore * 100).toFixed(0)}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Factors: {algorithmFactors.join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-col items-center justify-end gap-4 p-4 pb-20 md:pb-8">
          {/* Like button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="lg"
              className={`w-12 h-12 rounded-full backdrop-blur-sm border-0 ${
                isLiked 
                  ? 'bg-gradient-primary text-white shadow-glow-primary' 
                  : 'bg-background/20 hover:bg-background/30 text-foreground'
              }`}
              onClick={toggleLike}
              disabled={likeLoading}
            >
              {likeLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
              ) : (
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              )}
            </Button>
            <span className="text-xs text-foreground font-medium">{formatNumber(likeCount || likes)}</span>
          </div>

          {/* Comment button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="lg"
              className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 border-0 text-foreground"
              onClick={() => setIsCommentsOpen(true)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="text-xs text-foreground font-medium">{formatNumber(commentCount || comments)}</span>
          </div>

          {/* Share button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="lg"
              className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 border-0 text-foreground"
              onClick={() => setIsShareOpen(true)}
            >
              <Share className="w-6 h-6" />
            </Button>
            <span className="text-xs text-foreground font-medium">{formatNumber(shareCount || shares)}</span>
          </div>

          {/* Bookmark button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="lg"
              className={`w-12 h-12 rounded-full backdrop-blur-sm border-0 ${
                isBookmarked 
                  ? 'bg-gradient-accent text-white shadow-glow-accent' 
                  : 'bg-background/20 hover:bg-background/30 text-foreground'
              }`}
            >
              <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        videoId={id}
        commentCount={commentCount || comments}
        onCommentCountUpdate={updateCommentCount}
      />
      
      <EnhancedShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        videoId={id}
        videoTitle={description}
        videoUrl={videoSrc}
        shareCount={shareCount || shares}
        onShareCountUpdate={updateShareCount}
      />
    </div>
  );
}