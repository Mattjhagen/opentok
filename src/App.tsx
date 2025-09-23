import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { VideoProvider } from "@/contexts/VideoContext";
import { PWAInstallPrompt, FloatingInstallButton } from "@/components/PWAInstallPrompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePWA } from "@/hooks/usePWA";
import keepAliveService from "@/utils/keepAlive";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Video from "./pages/Video";
import ResetPassword from "./pages/ResetPassword";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { subscribeToPushNotifications } = usePWA();

  // Mobile debugging and error handling
  React.useEffect(() => {
    console.log('App component loaded');
    console.log('User Agent:', navigator.userAgent);
    console.log('Is Mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);
    console.log('Device Pixel Ratio:', window.devicePixelRatio);
    
    // Check for common mobile issues
    if (window.innerWidth < 768) {
      console.log('Mobile device detected');
    }
    
    // Global error handler for mobile debugging
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }, []);

  // Subscribe to push notifications on app load
  React.useEffect(() => {
    // Only subscribe if user is authenticated and notifications are supported
    if (Notification.permission === 'default') {
      subscribeToPushNotifications();
    }
  }, [subscribeToPushNotifications]);

  // Start keep-alive service to prevent Render from sleeping
  React.useEffect(() => {
    console.log('🚀 Starting keep-alive service for Render');
    keepAliveService.start();
    
    // Cleanup on unmount
    return () => {
      keepAliveService.stop();
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <VideoProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route path="/video/:videoId" element={<Video />} />
                  <Route path="/chat/:userId" element={<Chat />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              <PWAInstallPrompt />
              <FloatingInstallButton />
            </TooltipProvider>
          </VideoProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
