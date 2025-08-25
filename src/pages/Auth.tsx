import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Smartphone, Users, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Auth = () => {
  const { signUp, signIn, user } = useAuth();
  const { createCheckout } = useSubscription();
  const [loading, setLoading] = useState(false);
  
  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  });
  
  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signUp(signUpData.email, signUpData.password, signUpData.username, signUpData.displayName);
      if (result.needsSubscription && !result.error) {
        // Wait a moment for auth to process, then redirect to checkout
        setTimeout(() => {
          createCheckout();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(signInData.email, signInData.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-wellness flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="text-center lg:text-left space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-primary font-heading">
              Digital Wellness Together
            </h1>
            <p className="text-xl text-muted-foreground">
              Join the accountability buddy system and transform your screen time habits with support from friends and family.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg">
              <Target className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium">Set Goals</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg">
              <Users className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium">Find Buddies</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg">
              <Smartphone className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium">Track Progress</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <Card className="shadow-wellness border-2 border-primary/10 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email or Username</Label>
                    <Input
                      id="signin-email"
                      type="text"
                      placeholder="Enter your email or username"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">Annual Subscription - $30/year</h3>
                  <p className="text-sm text-muted-foreground">
                    Join Digital Wellness Premium for advanced analytics, AI insights, and accountability features. 
                    Cancel anytime.
                  </p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose username"
                        value={signUpData.username}
                        onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-displayname">Display Name</Label>
                      <Input
                        id="signup-displayname"
                        type="text"
                        placeholder="Your display name"
                        value={signUpData.displayName}
                        onChange={(e) => setSignUpData({ ...signUpData, displayName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account & Subscribe ($30/year)'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-primary hover:underline">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};