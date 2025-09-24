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
    
    // Debug CSS loading
    const rootElement = document.getElementById('root');
    if (rootElement) {
      console.log('Root element found:', rootElement);
      const computedStyle = window.getComputedStyle(rootElement);
      console.log('Root element background color:', computedStyle.backgroundColor);
      console.log('Root element color:', computedStyle.color);
    } else {
      console.error('Root element not found!');
    }
    
    // Check if CSS variables are loaded
    const rootStyles = getComputedStyle(document.documentElement);
    const backgroundVar = rootStyles.getPropertyValue('--background');
    console.log('CSS variable --background:', backgroundVar);
    
    // Add a visible indicator if the app is loading
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'app-loading-indicator';
    loadingIndicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0a0a0a;
      color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: system-ui, sans-serif;
    `;
    loadingIndicator.innerHTML = '<div>Loading OpenTok...</div>';
    document.body.appendChild(loadingIndicator);
    
    // Remove loading indicator after a short delay
    setTimeout(() => {
      const indicator = document.getElementById('app-loading-indicator');
      if (indicator) {
        indicator.remove();
      }
    }, 1000);
    
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
