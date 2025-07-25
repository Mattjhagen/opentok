import { VideoCard } from './VideoCard';

// Mock data for demonstration
const mockVideos = [
  {
    id: '1',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    user: {
      id: '1',
      username: 'creator_one',
      displayName: 'Creative One',
      avatar: undefined,
      verified: true,
    },
    description: '🎨 Amazing animation short film! This is how we bring creativity to life with open algorithms. #OpenTok #Creative #Animation',
    likes: 12400,
    comments: 892,
    shares: 234,
    isLiked: false,
    isBookmarked: true,
    algorithmScore: 0.92,
    algorithmFactors: ['High engagement rate', 'Trending hashtags', 'Creator popularity'],
  },
  {
    id: '2',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    user: {
      id: '2',
      username: 'tech_guru',
      displayName: 'Tech Guru',
      avatar: undefined,
      verified: false,
    },
    description: '🤖 The future of open source video platforms! Complete algorithm transparency means you control what you see. #OpenSource #Technology #Future',
    likes: 8750,
    comments: 456,
    shares: 178,
    isLiked: true,
    isBookmarked: false,
    algorithmScore: 0.87,
    algorithmFactors: ['Similar interests', 'Recent activity', 'Open source content'],
  },
  {
    id: '3',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    user: {
      id: '3',
      username: 'vine_veteran',
      displayName: 'Vine Veteran',
      avatar: undefined,
      verified: true,
    },
    description: '🔥 Remember when 6 seconds was all you needed? Bringing back that Vine energy with modern tech! #VineVibes #ShortForm #Nostalgia',
    likes: 15200,
    comments: 1200,
    shares: 890,
    isLiked: false,
    isBookmarked: false,
    algorithmScore: 0.94,
    algorithmFactors: ['Viral potential', 'Nostalgic content', 'High completion rate'],
  },
];

export function VideoFeed() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {mockVideos.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
}