
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressCircle } from '@/components/ProgressCircle';
import { TimeDisplay } from '@/components/TimeDisplay';
import { Users, TrendingUp, Clock } from 'lucide-react';

export const BuddiesList = () => {
  const { user } = useAuth();

  // Fetch buddies and their latest usage data
  const { data: buddies = [] } = useQuery({
    queryKey: ['buddies', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buddies')
        .select(`
          *,
          user1:profiles!buddies_user1_id_fkey(display_name, username, user_id),
          user2:profiles!buddies_user2_id_fkey(display_name, username, user_id)
        `)
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

      if (error) throw error;

      // Get the buddy (not the current user) from each relationship
      const buddyProfiles = data.map(buddy => {
        const isUser1 = buddy.user1_id === user?.id;
        return {
          ...buddy,
          buddy_profile: isUser1 ? buddy.user2 : buddy.user1,
        };
      });

      // Fetch today's usage data for each buddy
      const buddiesWithUsage = await Promise.all(
        buddyProfiles.map(async (buddy) => {
          const { data: usage } = await supabase
            .from('daily_usage')
            .select('usage_minutes, daily_limit_minutes, status')
            .eq('user_id', buddy.buddy_profile.user_id)
            .eq('date', new Date().toISOString().split('T')[0])
            .single();

          return {
            ...buddy,
            usage: usage || { usage_minutes: 0, daily_limit_minutes: 120, status: 'success' },
          };
        })
      );

      return buddiesWithUsage;
    },
    enabled: !!user?.id,
  });

  if (buddies.length === 0) {
    return (
      <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm text-center py-12">
        <CardContent>
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No Accountability Buddies Yet</CardTitle>
          <CardDescription>
            Send buddy requests to start building your accountability network!
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Accountability Buddies
          </CardTitle>
          <CardDescription>
            See how your buddies are doing with their digital wellness goals.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {buddies.map((buddy) => {
          const progressPercentage = (buddy.usage.usage_minutes / buddy.usage.daily_limit_minutes) * 100;
          const remainingTime = Math.max(0, buddy.usage.daily_limit_minutes - buddy.usage.usage_minutes);
          
          return (
            <Card key={buddy.id} className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">
                  {buddy.buddy_profile.display_name || buddy.buddy_profile.username || 'Unknown User'}
                </CardTitle>
                <CardDescription>Today's Progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <ProgressCircle
                    percentage={progressPercentage}
                    size={120}
                    strokeWidth={8}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <TimeDisplay
                    minutes={buddy.usage.usage_minutes}
                    label="Used Today"
                    variant={progressPercentage > 100 ? "warning" : progressPercentage > 80 ? "warning" : "success"}
                  />
                  <TimeDisplay
                    minutes={remainingTime}
                    label="Remaining"
                    variant={remainingTime === 0 ? "warning" : "default"}
                  />
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Limit: {Math.floor(buddy.usage.daily_limit_minutes / 60)}h {buddy.usage.daily_limit_minutes % 60}m
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {buddy.usage.status === 'success' ? 'On Track' : 'Over Limit'}
                  </div>
                </div>

                {progressPercentage > 80 && (
                  <div className={`text-center p-2 rounded-lg text-sm font-medium ${
                    progressPercentage > 100 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {progressPercentage > 100 ? '🚨 Over daily limit!' : '⚠️ Approaching limit'}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
