import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingDown, TrendingUp, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface DayData {
  day: string;
  date: string;
  usage: number; // in minutes
  limit: number; // in minutes
  status: 'success' | 'warning' | 'exceeded';
}

const weeklyData: DayData[] = [
  { day: 'Monday', date: 'Dec 16', usage: 95, limit: 120, status: 'success' },
  { day: 'Tuesday', date: 'Dec 17', usage: 142, limit: 120, status: 'exceeded' },
  { day: 'Wednesday', date: 'Dec 18', usage: 88, limit: 120, status: 'success' },
  { day: 'Thursday', date: 'Dec 19', usage: 156, limit: 120, status: 'exceeded' },
  { day: 'Friday', date: 'Dec 20', usage: 103, limit: 120, status: 'warning' },
  { day: 'Saturday', date: 'Dec 21', usage: 78, limit: 120, status: 'success' },
  { day: 'Today', date: 'Dec 22', usage: 85, limit: 120, status: 'success' },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case 'exceeded':
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'exceeded':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const InsightsView = () => {
  const totalUsage = weeklyData.reduce((sum, day) => sum + day.usage, 0);
  const averageUsage = Math.round(totalUsage / weeklyData.length);
  const successDays = weeklyData.filter(day => day.status === 'success').length;
  const exceededDays = weeklyData.filter(day => day.status === 'exceeded').length;

  return (
    <div className="space-y-6">
      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{formatTime(totalUsage)}</div>
            <div className="text-sm text-muted-foreground">Total This Week</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatTime(averageUsage)}</div>
            <div className="text-sm text-muted-foreground">Daily Average</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{successDays}</div>
            <div className="text-sm text-muted-foreground">Good Days</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{exceededDays}</div>
            <div className="text-sm text-muted-foreground">Over Limit</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card className="shadow-wellness border-2 border-primary/10 bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="w-5 h-5" />
            Weekly Breakdown
          </CardTitle>
          <CardDescription>
            Your daily screen time patterns for this week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyData.map((day, index) => {
            const percentage = (day.usage / day.limit) * 100;
            const isToday = day.day === 'Today';
            
            return (
              <div key={index} className={`p-4 rounded-lg border ${isToday ? 'bg-primary/5 border-primary/20' : 'bg-gray-50/50 border-gray-200/50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(day.status)}
                      <span className={`font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {day.day}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{day.date}</span>
                    {isToday && (
                      <Badge variant="secondary" className="text-xs">
                        Today
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatTime(day.usage)}</div>
                    <div className="text-xs text-muted-foreground">
                      of {formatTime(day.limit)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage Progress</span>
                    <span className={percentage > 100 ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600'}>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  {percentage > 100 && (
                    <div className="text-xs text-red-600 font-medium">
                      Exceeded by {formatTime(day.usage - day.limit)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card className="shadow-wellness border-2 border-primary/10 bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <TrendingUp className="w-5 h-5" />
            Improvement Suggestions
          </CardTitle>
          <CardDescription>
            Personalized tips to help you achieve your digital wellness goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {averageUsage > 120 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-800">Set Smaller Daily Goals</div>
                  <div className="text-sm text-amber-700">
                    Try reducing your daily limit by 15-30 minutes. Gradual changes are more sustainable than drastic cuts.
                  </div>
                </div>
              </div>
            )}
            
            {exceededDays >= 3 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">Create Phone-Free Zones</div>
                  <div className="text-sm text-blue-700">
                    Designate certain areas (like your bedroom or dining table) as phone-free spaces to build healthy habits.
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg border border-green-200/50">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Use the 20-20-20 Rule</div>
                <div className="text-sm text-green-700">
                  Every 20 minutes, look at something 20 feet away for 20 seconds. This helps reduce eye strain and creates natural breaks.
                </div>
              </div>
            </div>
            
            {successDays >= 5 ? (
              <div className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-200/50">
                <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-800">You're Doing Great!</div>
                  <div className="text-sm text-purple-700">
                    Consider challenging yourself with a slightly lower daily limit or explore new offline hobbies.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-200/50">
                <Clock className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <div className="font-medium text-indigo-800">Schedule Breaks</div>
                  <div className="text-sm text-indigo-700">
                    Set reminders to take 5-minute breaks every hour. Use this time to stretch, breathe, or look outside.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};