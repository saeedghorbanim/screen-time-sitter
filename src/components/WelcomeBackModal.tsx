import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Heart,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsagePatterns {
  weeklyTrend: 'improving' | 'declining' | 'stable';
  averageDaily: number;
  riskLevel: 'low' | 'medium' | 'high';
  peakUsageDays: string[];
}

interface WelcomeBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const WelcomeBackModal = ({ isOpen, onClose, userName }: WelcomeBackModalProps) => {
  const [patterns, setPatterns] = useState<UsagePatterns | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchUsagePatterns();
    }
  }, [isOpen]);

  const fetchUsagePatterns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('analyze-usage-patterns');
      
      if (error) {
        console.error('Error fetching patterns:', error);
        setLoading(false);
        return;
      }

      setPatterns(data.patterns);
      setInsights(data.aiInsights || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMotivationalMessage = () => {
    if (!patterns) return null;

    const { weeklyTrend, averageDaily, riskLevel } = patterns;
    const avgHours = Math.floor(averageDaily / 60);
    const avgMinutes = averageDaily % 60;

    if (weeklyTrend === 'improving') {
      return {
        type: 'success',
        title: `🎉 Amazing Progress, ${userName}!`,
        message: `You've improved your screen time this week! Your average daily usage is now ${avgHours}h ${avgMinutes}m. Keep up the fantastic work!`,
        encouragement: "You're building healthier digital habits. Every small step counts!",
        icon: <TrendingUp className="w-6 h-6 text-green-600" />
      };
    }

    if (weeklyTrend === 'declining') {
      return {
        type: 'challenge',
        title: `💪 Let's Turn This Around, ${userName}`,
        message: `Your screen time increased this week (${avgHours}h ${avgMinutes}m daily). That's okay - every journey has ups and downs!`,
        encouragement: "What do you think contributed to the increase? Remember, tomorrow is a fresh start!",
        icon: <TrendingDown className="w-6 h-6 text-orange-500" />
      };
    }

    return {
      type: 'stable',
      title: `✨ Steady as You Go, ${userName}!`,
      message: `You're maintaining consistent usage patterns (${avgHours}h ${avgMinutes}m daily). Consistency is key to lasting change!`,
      encouragement: "Ready to take the next step in your digital wellness journey?",
      icon: <Target className="w-6 h-6 text-blue-600" />
    };
  };

  const motivationalContent = getMotivationalMessage();

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm sm:max-w-md mx-auto mobile-modal">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!motivationalContent) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-lg mx-auto mobile-modal p-3 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            {motivationalContent.icon}
            <DialogTitle className="text-base sm:text-xl">{motivationalContent.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-4">
              <p className="text-foreground mb-3">{motivationalContent.message}</p>
              <p className="text-sm text-muted-foreground italic">
                {motivationalContent.encouragement}
              </p>
            </CardContent>
          </Card>

          {patterns && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Risk Level:</span>
                <Badge 
                  variant={patterns.riskLevel === 'low' ? 'default' : patterns.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                >
                  {patterns.riskLevel}
                </Badge>
              </div>
            </div>
          )}

          {insights.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">AI Insight for Today:</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {insights[0]}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              <Heart className="w-4 h-4 mr-2" />
              Let's Do This!
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};