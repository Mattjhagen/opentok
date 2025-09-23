import { createContext, useContext, useState, useRef } from 'react';

interface VideoContextType {
  currentPlayingVideo: string | null;
  setCurrentPlayingVideo: (videoId: string | null) => void;
  pauseAllVideos: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string | null>(null);
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  const pauseAllVideos = () => {
    videoElementsRef.current.forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });
  };

  const handleSetCurrentPlayingVideo = (videoId: string | null) => {
    // Pause all other videos
    videoElementsRef.current.forEach((video, id) => {
      if (id !== videoId && video && !video.paused) {
        video.pause();
      }
    });
    setCurrentPlayingVideo(videoId);
  };

  const value = {
    currentPlayingVideo,
    setCurrentPlayingVideo: handleSetCurrentPlayingVideo,
    pauseAllVideos,
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};
