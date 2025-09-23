import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { VideoFeed } from '@/components/VideoFeed';
import { AlgorithmPanel } from '@/components/AlgorithmPanel';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [isAlgorithmPanelOpen, setIsAlgorithmPanelOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index component - Auth state:', { user: !!user, loading });
    if (!loading && !user) {
      console.log('Index component - Redirecting to auth');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('Index component - Showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('Index component - No user, should redirect to auth');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  console.log('Index component - Rendering main content for user:', user.id, 'VideoFeed should be visible');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="pt-16 relative">
        {/* Temporary simple content to test if the error is with VideoFeed */}
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to OpenTok!</h1>
            <p className="text-muted-foreground mb-4">User: {user.email}</p>
            <p className="text-sm text-muted-foreground">Testing if VideoFeed is causing the error...</p>
          </div>
        </div>
        
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
