import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingDown, Target, Flame, Crown, Medal, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Leaderboards = () => {
  const { user } = useAuth();

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboards'],
    queryFn: async () => {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Get last 7 days for streaks
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      // Fetch recent usage data
      const { data: usageData, error } = await supabase
        .from('daily_usage')
        .select('user_id, usage_minutes, daily_limit_minutes, status, date')
        .gte('date', sevenDaysAgoStr)
        .order('date', { ascending: false });

      if (error) throw error;

      // Get unique user IDs from usage data
      const userIds = [...new Set(usageData.map(record => record.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', userIds);

      // Create a map for quick profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Calculate metrics per user
      const userMetrics = new Map();
      
      usageData.forEach(record => {
        if (!userMetrics.has(record.user_id)) {
          const profile = profilesMap.get(record.user_id);
          userMetrics.set(record.user_id, {
            userId: record.user_id,
            username: profile?.username || profile?.display_name || 'User',
            todayUsage: 0,
            todayLimit: 120,
            totalDays: 0,
            successfulDays: 0,
            currentStreak: 0,
            longestStreak: 0,
            tempStreak: 0,
            avgUsage: 0,
            totalUsage: 0,
            improvement: 0
          });
        }

        const metrics = userMetrics.get(record.user_id);
        metrics.totalDays++;
        metrics.totalUsage += record.usage_minutes;
        
        if (record.date === today) {
          metrics.todayUsage = record.usage_minutes;
          metrics.todayLimit = record.daily_limit_minutes;
        }

        if (record.status === 'success') {
          metrics.successfulDays++;
          metrics.tempStreak++;
          metrics.longestStreak = Math.max(metrics.longestStreak, metrics.tempStreak);
        } else {
          metrics.tempStreak = 0;
        }
      });

      // Convert to array and calculate final metrics
      const users = Array.from(userMetrics.values()).map(metrics => {
        metrics.avgUsage = metrics.totalUsage / Math.max(metrics.totalDays, 1);
        metrics.successRate = (metrics.successfulDays / Math.max(metrics.totalDays, 1)) * 100;
        metrics.currentStreak = metrics.tempStreak;
        
        // Calculate improvement (lower usage = better improvement)
        const recentAvg = metrics.todayUsage;
        const overallAvg = metrics.avgUsage;
        metrics.improvement = Math.max(0, overallAvg - recentAvg);
        
        return metrics;
      });

      // Create different leaderboards
      return {
        lowestUsage: users
          .filter(u => u.todayUsage > 0)
          .sort((a, b) => (a.todayUsage / a.todayLimit) - (b.todayUsage / b.todayLimit))
          .slice(0, 10),
        longestStreaks: users
          .filter(u => u.longestStreak > 0)
          .sort((a, b) => b.longestStreak - a.longestStreak)
          .slice(0, 10),
        bestGoalAchievement: users
          .filter(u => u.totalDays >= 3)
          .sort((a, b) => b.successRate - a.successRate)
          .slice(0, 10),
        mostImproved: users
          .filter(u => u.improvement > 0)
          .sort((a, b) => b.improvement - a.improvement)
          .slice(0, 10)
      };
    },
    enabled: !!user,
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-wellness flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view the community leaderboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-wellness p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold text-primary mb-2">Community Leaderboards</h1>
            <p className="text-muted-foreground">Loading rankings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-wellness p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-4xl font-bold text-primary mb-4">Community Leaderboards</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how you stack up against the community! All rankings are anonymous to protect privacy.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/50 border border-primary/10">
            <TabsTrigger value="usage" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Low Usage</span>
              <span className="xs:hidden">Usage</span>
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Goal Achievement</span>
              <span className="xs:hidden">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="improved" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Most Improved</span>
              <span className="xs:hidden">Improved</span>
            </TabsTrigger>
          </TabsList>

          {/* Lowest Usage Today */}
          <TabsContent value="usage">
            <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-green-500" />
                  Lowest Screen Time Today
                </CardTitle>
                <CardDescription>
                  Users with the lowest screen time relative to their daily limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData?.lowestUsage?.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-primary/5">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(user.todayUsage)} / {formatTime(user.todayLimit)} limit
                          </p>
                        </div>
                      </div>
                      <Badge variant={user.todayUsage <= user.todayLimit ? "default" : "destructive"}>
                        {Math.round((user.todayUsage / user.todayLimit) * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Longest Streaks */}
          <TabsContent value="streaks">
            <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  Longest Success Streaks
                </CardTitle>
                <CardDescription>
                  Users with the longest streaks of staying under their daily limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData?.longestStreaks?.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-primary/5">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            Current streak: {user.currentStreak} days
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {user.longestStreak} days
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goal Achievement */}
          <TabsContent value="goals">
            <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-500" />
                  Best Goal Achievement
                </CardTitle>
                <CardDescription>
                  Users with the highest percentage of days meeting their limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData?.bestGoalAchievement?.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-primary/5">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.successfulDays}/{user.totalDays} successful days
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">
                        {Math.round(user.successRate)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Most Improved */}
          <TabsContent value="improved">
            <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-purple-500" />
                  Most Improved
                </CardTitle>
                <CardDescription>
                  Users who have reduced their screen time the most compared to their average
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData?.mostImproved?.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-primary/5">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            Avg: {formatTime(Math.round(user.avgUsage))} → Today: {formatTime(user.todayUsage)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">
                        -{formatTime(Math.round(user.improvement))}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Privacy Notice */}
        <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium mb-2">🏆 Community Rankings</p>
              <p>
                Rankings show usernames from user profiles and are updated in real-time. 
                Compete with your community and celebrate each other's digital wellness achievements!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboards;