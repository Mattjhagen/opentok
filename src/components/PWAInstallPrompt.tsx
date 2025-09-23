import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
}

export function PWAInstallPrompt({ onDismiss }: PWAInstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissedPrompt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedPrompt) {
      const dismissTime = new Date(dismissedPrompt);
      const daysSinceDismiss = (Date.now() - dismissTime.getTime()) / (1000 * 60 * 60 * 24);
      
      // Show prompt again after 7 days
      if (daysSinceDismiss < 7) {
        setDismissed(true);
        return;
      }
    }

    // Show prompt if installable and not installed
    if (isInstallable && !isInstalled && !dismissed) {
      // Delay showing the prompt to avoid being too aggressive
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    try {
      await installApp();
      setIsVisible(false);
      toast({
        title: "Installing OpenTok",
        description: "The app is being installed on your device.",
      });
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "Installation Failed",
        description: "Failed to install the app. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    onDismiss?.();
  };

  const getDeviceIcon = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />;
  };

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);

    if (isIOS) {
      return {
        title: "Install on iOS",
        steps: [
          "Tap the Share button in Safari",
          "Scroll down and tap 'Add to Home Screen'",
          "Tap 'Add' to install the app"
        ]
      };
    } else if (isAndroid && isChrome) {
      return {
        title: "Install on Android",
        steps: [
          "Tap the menu button (three dots)",
          "Select 'Install app' or 'Add to Home screen'",
          "Tap 'Install' to add the app"
        ]
      };
    } else {
      return {
        title: "Install on Desktop",
        steps: [
          "Click the install button below",
          "Or look for the install icon in your browser's address bar",
          "Click 'Install' when prompted"
        ]
      };
    }
  };

  if (!isVisible || isInstalled) return null;

  const instructions = getInstallInstructions();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <Card className="bg-card/95 backdrop-blur-sm border border-border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getDeviceIcon()}
              <CardTitle className="text-lg">Install OpenTok</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Get the full app experience with offline access and push notifications
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Offline video viewing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Push notifications</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Faster loading</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>App-like experience</span>
            </div>
          </div>

          {/* Install Instructions for iOS/Android */}
          {!isInstallable && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{instructions.title}</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs w-5 h-5 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isInstallable ? (
              <Button
                onClick={handleInstall}
                className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            ) : (
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                Got it
              </Button>
            )}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
            >
              Maybe later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Floating install button for when the prompt is dismissed
export function FloatingInstallButton() {
  const [showFloating, setShowFloating] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWA();

  useEffect(() => {
    const dismissedPrompt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedPrompt && isInstallable && !isInstalled) {
      setShowFloating(true);
    }
  }, [isInstallable, isInstalled]);

  if (!showFloating || isInstalled) return null;

  return (
    <Button
      onClick={installApp}
      className="fixed bottom-20 right-4 z-40 bg-gradient-primary hover:opacity-90 text-white shadow-lg rounded-full w-12 h-12 p-0"
      title="Install OpenTok"
    >
      <Download className="w-5 h-5" />
    </Button>
  );
}
