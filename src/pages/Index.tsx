import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressCircle } from "@/components/ProgressCircle";
import { TimeDisplay } from "@/components/TimeDisplay";
import { TimeLimitSettings } from "@/components/TimeLimitSettings";
import { AccountSettings } from "@/components/AccountSettings";
import { InsightsView } from "@/components/InsightsView";
import { MotivationalModal } from "@/components/MotivationalModal";
import { WelcomeBackModal } from "@/components/WelcomeBackModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Smartphone, Settings, BarChart3, Play, Pause, RotateCcw, LogOut, LogIn, Trophy, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL RETURNS
  const { user, signOut, loading } = useAuth();
  const [dailyLimit, setDailyLimit] = useState(120 * 60); // 2 hours in seconds
  const [currentUsage, setCurrentUsage] = useState(85 * 60); // Demo usage in seconds
  const [isTracking, setIsTracking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username?: string; display_name?: string } | null>(null);
  const [hasShownWelcomeBack, setHasShownWelcomeBack] = useState(false);
  const [dailyExtensions, setDailyExtensions] = useState(0);
  const { toast } = useToast();
  
  // Track daily extensions - reset each day
  useEffect(() => {
    if (user) {
      const today = new Date().toDateString();
      const extensionKey = `dailyExtensions_${user.id}_${today}`;
      const stored = localStorage.getItem(extensionKey);
      setDailyExtensions(stored ? parseInt(stored) : 0);
    }
  }, [user]);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(data);
    };

    fetchUserProfile();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const displayName = userProfile?.username || userProfile?.display_name || user?.email?.split('@')[0] || "User";

  // Calculate progress percentage
  const progressPercentage = (currentUsage / dailyLimit) * 100;
  const remainingTime = Math.max(0, dailyLimit - currentUsage);
  
  // Convert seconds to minutes for display
  const currentUsageMinutes = Math.floor(currentUsage / 60);
  const remainingTimeMinutes = Math.floor(remainingTime / 60);
  const dailyLimitMinutes = Math.floor(dailyLimit / 60);

  // Demo timer effect - ALL useEffect calls must be before conditional returns
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && currentUsage < dailyLimit) {
      interval = setInterval(() => {
        setCurrentUsage(prev => {
          const newUsage = prev + 1;
          
          // Show warning and stop tracking when limit is reached
          if (newUsage >= dailyLimit && !hasShownWarning) {
            setShowModal(true);
            setHasShownWarning(true);
            setIsTracking(false); // Stop tracking automatically
          }
          
          return newUsage;
        });
      }, 1000); // Increase usage by 1 second every second (real time)
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, dailyLimit, hasShownWarning, currentUsage]);

  // Show welcome back modal only once per day on first sign-in
  useEffect(() => {
    if (user && !loading && !hasShownWelcomeBack) {
      const today = new Date().toDateString();
      const lastShownDate = localStorage.getItem(`welcomeBackDate_${user.id}`);
      
      // Show modal if it hasn't been shown today
      if (lastShownDate !== today) {
        const timer = setTimeout(() => {
          setShowWelcomeBack(true);
          setHasShownWelcomeBack(true);
          // Store today's date to prevent showing again today
          localStorage.setItem(`welcomeBackDate_${user.id}`, today);
        }, 800);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading, hasShownWelcomeBack]);

  // NOW we can do conditional returns after all hooks are called
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-wellness-enhanced floating-orbs flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-primary">Loading...</div>
        </Card>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    // Redirect to auth page using React Router
    navigate('/', { replace: true });
    return null;
  }

  const handleLimitChange = (newLimit: number) => {
    setDailyLimit(newLimit * 60); // Convert minutes to seconds
    setHasShownWarning(false);
    toast({
      title: "Limit Updated",
      description: `Daily limit set to ${Math.floor(newLimit / 60)}h ${newLimit % 60}m`,
    });
  };

  const handleStartTracking = () => {
    if (currentUsage >= dailyLimit) {
      toast({
        title: "Daily Limit Reached",
        description: "Reset your usage or wait until tomorrow to continue tracking",
        variant: "destructive"
      });
      return;
    }
    setIsTracking(true);
    toast({
      title: "Tracking Started",
      description: "Your screen time is now being monitored",
    });
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    toast({
      title: "Tracking Paused",
      description: "Screen time monitoring paused",
    });
  };

  const handleReset = () => {
    setCurrentUsage(0);
    setHasShownWarning(false);
    setIsTracking(false);
    toast({
      title: "Usage Reset",
      description: "Daily screen time has been reset to 0",
    });
  };

  const handleModalExtend = () => {
    if (dailyExtensions >= 2 || !user) return;
    
    const newExtensionCount = dailyExtensions + 1;
    setDailyExtensions(newExtensionCount);
    
    // Store in localStorage with date
    const today = new Date().toDateString();
    const extensionKey = `dailyExtensions_${user.id}_${today}`;
    localStorage.setItem(extensionKey, newExtensionCount.toString());
    
    setDailyLimit(prev => prev + (5 * 60)); // Add 5 minutes in seconds
    setShowModal(false);
    setHasShownWarning(false); // Reset warning so it can show again at new limit
    setIsTracking(true); // Resume tracking
    toast({
      title: "Extended! ⏰",
      description: `Added 5 more minutes to your daily limit. Extensions left today: ${2 - newExtensionCount}`,
    });
  };

  const handleModalAcknowledge = () => {
    setShowModal(false);
    setIsTracking(false);
    toast({
      title: "Good choice! 🌟",
      description: "Taking a break is great for your wellbeing",
    });
  };

  return (
    <div className="min-h-screen bg-wellness-enhanced floating-orbs px-4 py-2">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary rounded-xl p-2">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">MindfulTime</h1>
                <p className="text-sm text-muted-foreground">Digital Wellness Companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-primary">
                  {displayName}
                </div>
              </div>
              
              <Button
                onClick={signOut}
                variant="outline" 
                size="sm"
                className="border-primary/20 hover:bg-primary/5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 border border-primary/10">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboards
            </TabsTrigger>
            <TabsTrigger 
              value="testimonials" 
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Successes
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Main Progress Card */}
            <Card className="shadow-floating border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center bg-gradient-wellness">
                <CardTitle className="text-2xl text-primary">Today's Progress</CardTitle>
                <CardDescription>
                  Track your screen time and maintain digital wellness
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-8 pb-6">
                <div className="flex flex-col items-center space-y-6">
                  <ProgressCircle 
                    percentage={progressPercentage}
                    size={160}
                    strokeWidth={12}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <TimeDisplay
                      minutes={currentUsageMinutes}
                      label="Used Today"
                      variant={progressPercentage > 100 ? "warning" : progressPercentage > 80 ? "warning" : "success"}
                    />
                    <TimeDisplay
                      minutes={remainingTimeMinutes}
                      label="Remaining"
                      variant={remainingTimeMinutes === 0 ? "warning" : "default"}
                    />
                  </div>
                  
                  <div className="flex gap-3 w-full max-w-md">
                    {!isTracking ? (
                      <Button 
                        onClick={handleStartTracking}
                        className="flex-1 bg-gradient-primary hover:opacity-90 shadow-gentle"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Tracking
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStopTracking}
                        variant="outline"
                        className="flex-1 border-primary/20 hover:bg-primary/5"
                        size="lg"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Tracking
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                      className="border-primary/20 hover:bg-primary/5"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {progressPercentage > 80 && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 w-full max-w-md">
                      <p className="text-warning text-sm font-medium text-center">
                        {progressPercentage > 100 
                          ? "🚨 You've exceeded your daily limit!" 
                          : "⚠️ Approaching your daily limit"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboards">
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-4">Community Leaderboards</h2>
              <p className="text-muted-foreground mb-6">
                Check out how you compare with the community in anonymous rankings!
              </p>
              <Button asChild className="bg-gradient-primary hover:opacity-90">
                <Link to="/leaderboards">View Full Leaderboards</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="testimonials">
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-4">Success Stories</h2>
              <p className="text-muted-foreground mb-6">
                Read inspiring stories from our community and share your own digital wellness journey!
              </p>
              <Button asChild className="bg-gradient-primary hover:opacity-90">
                <Link to="/testimonials">View All Success Stories</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-wellness border-2 border-primary/10 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Settings className="w-5 h-5" />
                  Daily Limit Settings
                </CardTitle>
                <CardDescription>
                  Customize your daily screen time limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimeLimitSettings
                  currentLimit={dailyLimitMinutes}
                  onLimitChange={handleLimitChange}
                />
              </CardContent>
            </Card>
            
            <AccountSettings />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsView />
          </TabsContent>
        </Tabs>
      </main>

      {/* Motivational Modal */}
      <MotivationalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onExtend={handleModalExtend}
        onAcknowledge={handleModalAcknowledge}
        dailyExtensions={dailyExtensions}
      />

      {/* Welcome Back Modal */}
      <WelcomeBackModal
        isOpen={showWelcomeBack}
        onClose={() => setShowWelcomeBack(false)}
        userName={displayName}
      />
    </div>
  );
};

export default Index;
