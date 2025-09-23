import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PWAInstallPrompt, FloatingInstallButton } from "@/components/PWAInstallPrompt";
import { usePWA } from "@/hooks/usePWA";
import keepAliveService from "@/utils/keepAlive";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { subscribeToPushNotifications } = usePWA();

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile/:username" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <PWAInstallPrompt />
          <FloatingInstallButton />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
