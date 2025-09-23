import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Video, Shield } from 'lucide-react';
import { PasswordRecovery } from '@/components/PasswordRecovery';
import { TwoFactorVerification } from '@/components/TwoFactorVerification';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth component - checking session:', { 
        hasUser: !!session?.user, 
        currentPath: window.location.pathname,
        currentUrl: window.location.href 
      });
      
      if (session?.user) {
        // Don't redirect if we're on a password reset page or if there are URL parameters
        const currentPath = window.location.pathname;
        const hasUrlParams = window.location.search.length > 0;
        
        if (currentPath !== '/reset-password' && !hasUrlParams) {
          console.log('Redirecting authenticated user to home page');
          navigate('/');
        } else {
          console.log('Not redirecting - on reset password page or has URL params');
        }
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        // Check if user has 2FA enabled
        const user = data.user;
        if (user?.user_metadata?.two_factor_enabled) {
          // Store user data and show 2FA verification
          setPendingUser(user);
          setShow2FA(true);
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
        navigate('/');
      } else {
        // Sign up
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username,
              display_name: displayName,
            },
          },
        });

        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerification = async (code: string): Promise<boolean> => {
    try {
      // In a real implementation, you would verify the TOTP code server-side
      // For now, we'll simulate the verification
      const isValid = await simulateTOTPVerification(code, pendingUser?.user_metadata?.totp_secret);
      
      if (isValid) {
        // Complete the login process
        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
        navigate('/');
        return true;
      }
      return false;
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    }
  };

  // Simulate TOTP verification (in real app, this would be server-side)
  const simulateTOTPVerification = async (code: string, secret: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, accept any 6-digit code
        resolve(code.length === 6 && /^\d+$/.test(code));
      }, 1000);
    });
  };

  const handleBackFrom2FA = () => {
    setShow2FA(false);
    setPendingUser(null);
    // Sign out the user since 2FA failed
    supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Welcome back' : 'Create account'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Sign in to continue sharing your creativity' 
                : 'Join the community and start creating'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="@username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 text-white"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          
          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  console.log('Forgot password clicked');
                  setShowPasswordRecovery(true);
                }}
                className="text-sm text-primary hover:text-primary/80 transition-colors underline font-medium"
              >
                Forgot your password?
              </button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Password Recovery Modal */}
      <PasswordRecovery
        isOpen={showPasswordRecovery}
        onClose={() => setShowPasswordRecovery(false)}
        onBackToLogin={() => setShowPasswordRecovery(false)}
      />

      {/* 2FA Verification Modal */}
      <TwoFactorVerification
        isOpen={show2FA}
        onClose={() => setShow2FA(false)}
        onVerify={handle2FAVerification}
        onBack={handleBackFrom2FA}
      />
    </div>
  );
};

export default Auth;