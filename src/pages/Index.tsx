import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { VideoFeed } from '@/components/VideoFeed';
import { AlgorithmPanel } from '@/components/AlgorithmPanel';

const Index = () => {
  const [isAlgorithmPanelOpen, setIsAlgorithmPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="pt-16 relative">
        {/* Video Feed */}
        <VideoFeed />
        
        {/* Floating Algorithm Button */}
        <Button
          onClick={() => setIsAlgorithmPanelOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-gradient-primary hover:opacity-90 text-white shadow-glow-primary animate-pulse-glow"
          size="lg"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Algorithm
        </Button>
        
        {/* Algorithm Transparency Panel */}
        <AlgorithmPanel
          isOpen={isAlgorithmPanelOpen}
          onClose={() => setIsAlgorithmPanelOpen(false)}
        />
      </main>
    </div>
  );
};

export default Index;
