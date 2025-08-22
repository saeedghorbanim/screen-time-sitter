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

const suggestionPool = [
  {
    title: "Try the Pomodoro Technique",
    description: "Work in 25-minute focused blocks, then take a 5-minute break. This naturally limits screen time while boosting productivity.",
    icon: "Clock",
    color: "blue"
  },
  {
    title: "Create Morning Phone-Free Time", 
    description: "Keep your phone away for the first hour after waking up. Start your day with intention instead of notifications.",
    icon: "CheckCircle",
    color: "green"
  },
  {
    title: "Use Grayscale Mode",
    description: "Switch your phone to grayscale to make it less visually appealing and reduce the urge to mindlessly scroll.",
    icon: "AlertTriangle", 
    color: "amber"
  },
  {
    title: "Set App Time Limits",
    description: "Use built-in screen time controls to set daily limits on your most-used social media and entertainment apps.",
    icon: "Clock",
    color: "indigo"
  },
  {
    title: "Practice the 5-4-3-2-1 Grounding",
    description: "When you feel the urge to check your phone, notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
    icon: "CheckCircle",
    color: "purple"
  },
  {
    title: "Charge Your Phone Outside the Bedroom",
    description: "Keep your phone in another room while sleeping. Use a traditional alarm clock instead of your phone.",
    icon: "TrendingUp",
    color: "green"
  },
  {
    title: "Take Walking Breaks",
    description: "Every hour, take a 5-minute walk without your phone. Fresh air and movement help reset your focus.",
    icon: "Clock",
    color: "blue"
  },
  {
    title: "Use Do Not Disturb Liberally",
    description: "Schedule automatic Do Not Disturb during work hours, meals, and family time. You control your notifications, not the other way around.",
    icon: "AlertTriangle",
    color: "amber"
  },
  {
    title: "Practice Single-Tasking",
    description: "When eating, just eat. When talking to someone, just listen. Give your full attention to one thing at a time.",
    icon: "CheckCircle",
    color: "green"
  },
  {
    title: "Create Tech-Free Meals",
    description: "Make all meals phone-free zones. This improves digestion, conversation, and mindful eating habits.",
    icon: "TrendingUp",
    color: "purple"
  },
  {
    title: "Use Physical Books Instead",
    description: "Replace some of your digital reading with physical books or magazines. It's easier on your eyes and more engaging.",
    icon: "Clock",
    color: "indigo"
  },
  {
    title: "Practice Deep Breathing",
    description: "Before picking up your phone, take three deep breaths. Ask yourself: 'Do I really need to check this right now?'",
    icon: "CheckCircle",
    color: "blue"
  }
];

const getRandomSuggestions = (count: number) => {
  const shuffled = [...suggestionPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
  
  const suggestions = getRandomSuggestions(4);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock':
        return Clock;
      case 'CheckCircle':
        return CheckCircle;
      case 'AlertTriangle':
        return AlertTriangle;
      case 'TrendingUp':
        return TrendingUp;
      default:
        return CheckCircle;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50/50',
          border: 'border-blue-200/50',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          descColor: 'text-blue-700'
        };
      case 'green':
        return {
          bg: 'bg-green-50/50',
          border: 'border-green-200/50',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          descColor: 'text-green-700'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50/50',
          border: 'border-amber-200/50',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-800',
          descColor: 'text-amber-700'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50/50',
          border: 'border-purple-200/50',
          iconColor: 'text-purple-600',
          titleColor: 'text-purple-800',
          descColor: 'text-purple-700'
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50/50',
          border: 'border-indigo-200/50',
          iconColor: 'text-indigo-600',
          titleColor: 'text-indigo-800',
          descColor: 'text-indigo-700'
        };
      default:
        return {
          bg: 'bg-blue-50/50',
          border: 'border-blue-200/50',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          descColor: 'text-blue-700'
        };
    }
  };

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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {suggestions.map((suggestion, index) => {
              const IconComponent = getIcon(suggestion.icon);
              const colors = getColorClasses(suggestion.color);
              
              return (
                <div key={index} className={`flex items-start gap-3 p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
                  <IconComponent className={`w-5 h-5 ${colors.iconColor} mt-0.5`} />
                  <div>
                    <div className={`text-lg font-bold ${colors.titleColor}`}>{suggestion.title}</div>
                    <div className={`text-base ${colors.descColor}`}>
                      {suggestion.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};