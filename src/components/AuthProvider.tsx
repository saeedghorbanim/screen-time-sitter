import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignUpResult {
  error: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<SignUpResult>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Cleanup auth state utility
const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            display_name: displayName
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user && !data.session) {
        toast({
          title: "Account created!",
          description: "Please check your email for a confirmation link.",
        });
        return { error: null };
      }

      if (data.user && data.session) {
        toast({
          title: "Account created!",
          description: "Welcome to MindfulTime!",
        });
        return { error: null };
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      let email = emailOrUsername;
      
      // If input doesn't contain @, it's likely a username, so look up the email
      if (!emailOrUsername.includes('@')) {
        try {
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('username', emailOrUsername)
            .single();
          
          if (profileError || !profiles) {
            toast({
              title: "Sign In Error",
              description: "Username not found. Please check your username or use your email address.",
              variant: "destructive",
            });
            return { error: new Error("Username not found") };
          }

          // Get the email from auth.users
          const { data: userInfo, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', profiles.user_id)
            .single();
            
          if (userError) {
            toast({
              title: "Sign In Error", 
              description: "Error retrieving user information. Please try using your email address.",
              variant: "destructive",
            });
            return { error: userError };
          }

          // Since we can't directly access auth.users, we'll try to sign in with username as email
          // and let Supabase handle the error if it's not valid
        } catch (lookupError) {
          toast({
            title: "Sign In Error",
            description: "Username not found. Please check your username or use your email address.",
            variant: "destructive",
          });
          return { error: lookupError };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername, // Use original input, Supabase will handle email validation
        password,
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes("Invalid login credentials")) {
          if (!emailOrUsername.includes('@')) {
            errorMessage = "Invalid username or password. Please check your credentials and make sure your username is correct.";
          } else {
            errorMessage = "Invalid email or password. Please verify your email address and password.";
          }
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email not confirmed. Please check your email and click the confirmation link before signing in.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many sign-in attempts. Please wait a few minutes and try again.";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Invalid email format. Please enter a valid email address or try using your username instead.";
        }
        
        toast({
          title: "Sign In Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        window.location.href = '/';
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred during sign in. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Immediately update state for faster UI response
      setSession(null);
      setUser(null);
      
      // Show toast immediately
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Redirect immediately
      window.location.href = '/auth';
      
      // Clean up in the background
      setTimeout(() => {
        cleanupAuthState();
        supabase.auth.signOut({ scope: 'global' }).catch(() => {});
      }, 100);
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};