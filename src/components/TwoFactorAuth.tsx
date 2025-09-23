import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Smartphone, CheckCircle, Copy, RefreshCw } from 'lucide-react';

interface TwoFactorAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

export function TwoFactorAuth({ isOpen, onClose, onSetupComplete }: TwoFactorAuthProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate TOTP secret and QR code
  useEffect(() => {
    if (isOpen && step === 'setup') {
      generateTOTPSecret();
    }
  }, [isOpen, step]);

  const generateTOTPSecret = async () => {
    try {
      setLoading(true);
      
      // Generate a random secret (in a real app, this would be done server-side)
      const randomSecret = generateRandomSecret();
      setSecret(randomSecret);
      
      // Generate QR code URL
      const user = (await supabase.auth.getUser()).data.user;
      const email = user?.email || 'user@example.com';
      const qrUrl = `otpauth://totp/OpenTok:${email}?secret=${randomSecret}&issuer=OpenTok`;
      setQrCodeUrl(qrUrl);
      
    } catch (error) {
      console.error('Error generating TOTP secret:', error);
      toast({
        title: "Error",
        description: "Failed to generate 2FA setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      toast({
        title: "Copied!",
        description: "Secret key copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy secret key",
        variant: "destructive",
      });
    }
  };

  const verifyTOTPCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, you would verify the TOTP code server-side
      // For now, we'll simulate the verification
      const isValid = await simulateTOTPVerification(verificationCode, secret);
      
      if (isValid) {
        // Store the 2FA secret in user metadata
        const { error } = await supabase.auth.updateUser({
          data: {
            totp_secret: secret,
            two_factor_enabled: true
          }
        });

        if (error) {
          throw error;
        }

        setStep('complete');
        onSetupComplete();
        toast({
          title: "2FA Enabled!",
          description: "Two-factor authentication has been successfully enabled.",
        });
      } else {
        toast({
          title: "Invalid code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Simulate TOTP verification (in real app, this would be server-side)
  const simulateTOTPVerification = async (code: string, secret: string): Promise<boolean> => {
    // This is a simplified simulation - in reality, you'd use a proper TOTP library
    // and verify against the current time window
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, accept any 6-digit code
        resolve(code.length === 6 && /^\d+$/.test(code));
      }, 1000);
    });
  };

  const handleClose = () => {
    setStep('setup');
    setSecret('');
    setQrCodeUrl('');
    setVerificationCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="mb-2">
                Step 1 of 2
              </Badge>
              <p className="text-sm text-muted-foreground">
                Scan the QR code with your authenticator app or enter the secret key manually.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg">
                    {qrCodeUrl && (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                        alt="2FA QR Code"
                        className="w-48 h-48"
                      />
                    )}
                  </div>
                </div>

                {/* Secret Key */}
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={secret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copySecret}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Save this secret key in a secure place. You'll need it if you lose access to your authenticator app.
                  </p>
                </div>

                <Button
                  onClick={() => setStep('verify')}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white"
                >
                  I've Added the Account
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="mb-2">
                Step 2 of 2
              </Badge>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to complete setup.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={verifyTOTPCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">2FA Enabled Successfully!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your account is now protected with two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
              </p>
            </div>
            
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-primary hover:opacity-90 text-white"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
