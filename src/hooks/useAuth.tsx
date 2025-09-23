import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  ensureProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const ensureProfile = async () => {
    if (!user) {
      console.log('No user found in ensureProfile');
      return null;
    }
    
    console.log('ensureProfile called for user:', user.id, user.email);
    
    try {
      // First check if profile exists
      console.log('Checking if profile exists for user:', user.id);
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      console.log('Profile check result:', { existingProfile, checkError });
        
      if (existingProfile && !checkError) {
        console.log('Profile already exists:', existingProfile);
        return existingProfile;
      }
      
      // If profile doesn't exist, create it
      console.log('Profile does not exist, creating new profile...');
      
      // Generate username from email or metadata
      const rawUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
      const cleanUsername = rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername;
      
      // Ensure username is unique by adding a number if needed
      let finalUsername = cleanUsername;
      let counter = 1;
      
      while (true) {
        const { data: existingUsername } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', finalUsername)
          .single();
          
        if (!existingUsername) {
          break; // Username is available
        }
        
        finalUsername = `${cleanUsername}${counter}`;
        counter++;
        
        if (counter > 100) {
          // Fallback to user ID if we can't find a unique username
          finalUsername = `user_${user.id.slice(0, 8)}`;
          break;
        }
      }
      
      const profileData = {
        id: user.id,
        username: finalUsername,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
      };
      
      console.log('Creating profile with data:', profileData);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
        
      console.log('Profile creation result:', { newProfile, createError });
        
      if (createError) {
        console.error('Failed to create profile:', createError);
        
        // If creation fails due to duplicate, try to fetch existing profile
        if (createError.code === '23505') {
          console.log('Profile already exists (duplicate key), fetching it...');
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (existingProfile) {
            console.log('Found existing profile after duplicate error:', existingProfile);
            return existingProfile;
          }
        }
        
        return null;
      }
      
      console.log('Profile created successfully:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in ensureProfile:', error);
      return null;
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    ensureProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};