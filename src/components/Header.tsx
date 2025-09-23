import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Settings, Menu, LogOut, User, MessageCircle, Bell, Home, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { VideoUpload } from './VideoUpload';
import { ChatSystem } from './ChatSystem';
import { NotificationSystem, useNotificationCount } from './NotificationSystem';
import { SettingsModal } from './SettingsModal';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unreadCount = useNotificationCount();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu and Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">O</span>
                  </div>
                  OpenTok
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {/* User Profile Section */}
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{user?.user_metadata?.display_name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                )}
                
                {/* Navigation Items */}
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Home className="w-4 h-4 mr-3" />
                    Home
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      const username = user?.user_metadata?.username || 'me';
                      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
                      navigate(`/profile/${cleanUsername}`);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      setIsUploadOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Upload Video
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      setIsChatOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-3" />
                    Messages
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      setIsNotificationsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Bell className="w-4 h-4 mr-3" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <h1 className="font-bold text-xl text-foreground">
              OpenTok
            </h1>
          </div>
        </div>

        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search videos, users, or topics..."
              className="pl-10 bg-secondary/50 border-border focus:ring-primary"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile: Only show essential buttons */}
          <div className="md:hidden flex items-center gap-1">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-gradient-primary hover:opacity-90 text-white shadow-glow-primary px-3"
              onClick={() => setIsUploadOpen(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            
            {/* User Profile - Direct navigation on mobile */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1"
              onClick={() => {
                const username = user?.user_metadata?.username || 'me';
                const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
                navigate(`/profile/${cleanUsername}`);
              }}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-primary text-white text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>

          {/* Desktop: Show all buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-gradient-primary hover:opacity-90 text-white shadow-glow-primary"
              onClick={() => setIsUploadOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload
            </Button>

            {/* Chat Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsChatOpen(true)}
              className="relative"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            {/* Notifications Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-white text-xs">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onClick={() => {
                    const username = user?.user_metadata?.username || 'me';
                    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
                    navigate(`/profile/${cleanUsername}`);
                  }}
                >
                  <User className="w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user?.user_metadata?.display_name || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Video Upload Modal */}
      <VideoUpload 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />

      {/* Chat System */}
      <ChatSystem
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Notification System */}
      <NotificationSystem
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
}