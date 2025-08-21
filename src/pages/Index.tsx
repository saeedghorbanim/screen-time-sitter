import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressCircle } from "@/components/ProgressCircle";
import { TimeDisplay } from "@/components/TimeDisplay";
import { TimeLimitSettings } from "@/components/TimeLimitSettings";
import { MotivationalModal } from "@/components/MotivationalModal";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Settings, BarChart3, Play, Pause, RotateCcw } from "lucide-react";

const Index = () => {
  // State management
  const [dailyLimit, setDailyLimit] = useState(120); // 2 hours default
  const [currentUsage, setCurrentUsage] = useState(85); // Demo usage
  const [isTracking, setIsTracking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const { toast } = useToast();

  // Calculate progress percentage
  const progressPercentage = (currentUsage / dailyLimit) * 100;
  const remainingTime = Math.max(0, dailyLimit - currentUsage);

  // Demo timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking) {
      interval = setInterval(() => {
        setCurrentUsage(prev => {
          const newUsage = prev + 1;
          
          // Show warning when approaching or exceeding limit
          if (newUsage >= dailyLimit && !hasShownWarning) {
            setShowModal(true);
            setHasShownWarning(true);
          }
          
          return newUsage;
        });
      }, 1000); // Increase usage by 1 minute every second for demo
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, dailyLimit, hasShownWarning]);

  const handleLimitChange = (newLimit: number) => {
    setDailyLimit(newLimit);
    setHasShownWarning(false);
    toast({
      title: "Limit Updated",
      description: `Daily limit set to ${Math.floor(newLimit / 60)}h ${newLimit % 60}m`,
    });
  };

  const handleStartTracking = () => {
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

  const handleModalAcknowledge = () => {
    setShowModal(false);
    setIsTracking(false);
    toast({
      title: "Good choice! 🌟",
      description: "Taking a break is great for your wellbeing",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-wellness">
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 border border-primary/10">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
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
                      minutes={currentUsage}
                      label="Used Today"
                      variant={progressPercentage > 100 ? "warning" : progressPercentage > 80 ? "warning" : "success"}
                    />
                    <TimeDisplay
                      minutes={remainingTime}
                      label="Remaining"
                      variant={remainingTime === 0 ? "warning" : "default"}
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

          <TabsContent value="settings">
            <TimeLimitSettings
              currentLimit={dailyLimit}
              onLimitChange={handleLimitChange}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="shadow-wellness border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-primary">Weekly Insights</CardTitle>
                <CardDescription>
                  Track your progress and build healthier habits
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Coming Soon!</p>
                  <p>Detailed analytics and insights will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Motivational Modal */}
      <MotivationalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAcknowledge={handleModalAcknowledge}
      />
    </div>
  );
};

export default Index;