import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoContext } from '@/contexts/VideoContext';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  videoId?: string;
}

export function VideoPlayer({ 
  src, 
  poster, 
  autoPlay = true, 
  muted = false, 
  loop = true,
  videoId
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  
  // Safely get video context with fallback
  let currentPlayingVideo: string | null = null;
  let setCurrentPlayingVideo: (videoId: string | null) => void = () => {};
  
  try {
    const context = useVideoContext();
    currentPlayingVideo = context.currentPlayingVideo;
    setCurrentPlayingVideo = context.setCurrentPlayingVideo;
  } catch (error) {
    console.warn('VideoContext not available, using fallback:', error);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => {
      // Try to unmute when video can play
      if (video.muted && !isMuted) {
        video.muted = false;
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [isMuted]);

  // Handle dynamic changes to autoPlay and muted props
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Update muted state
    video.muted = muted;
    setIsMuted(muted);

    // Handle autoPlay changes
    if (autoPlay && !video.paused) {
      // Video is already playing, no need to do anything
      return;
    }

    if (autoPlay) {
      // Try to play the video
      video.play().catch((error) => {
        console.log('Autoplay failed:', error);
        // If autoplay fails, mute the video and try again
        video.muted = true;
        setIsMuted(true);
        video.play().catch(console.error);
      });
    } else {
      // Pause the video
      video.pause();
    }
  }, [autoPlay, muted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    
    // If unmuting, try to play the video
    if (!video.muted && video.paused) {
      video.play().catch(console.error);
    }
  };

  return (
    <div 
      className="relative w-full h-full group cursor-pointer"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className="w-full h-full object-cover bg-card"
      />
      
      {/* Mute Indicator (always visible when muted) */}
      {isMuted && (
        <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm rounded-full p-2">
          <VolumeX className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Video Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            className="w-16 h-16 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 border-0"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-foreground" />
            ) : (
              <Play className="w-8 h-8 text-foreground ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`w-10 h-10 rounded-full backdrop-blur-sm border-0 ${
                isMuted 
                  ? 'bg-red-500/20 hover:bg-red-500/30' 
                  : 'bg-background/20 hover:bg-background/30'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              title={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-foreground" />
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 border-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4 text-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}