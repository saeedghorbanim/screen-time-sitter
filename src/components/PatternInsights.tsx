import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Brain,
  Target
} from 'lucide-react';

interface PatternData {
  weeklyTrend: 'increasing' | 'decreasing' | 'stable';
  peakUsageDays: string[];
  averageDaily: number;
  bingeSessions: number;
  triggerPatterns: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface PatternInsightsProps {
  patterns: PatternData;
  aiInsights: string[];
  isLoading?: boolean;
}

export const PatternInsights: React.FC<PatternInsightsProps> = ({
  patterns,
  aiInsights,
  isLoading = false
}) => {
  const getTrendIcon = () => {
    switch (patterns.weeklyTrend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskColor = () => {
    switch (patterns.riskLevel) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRiskProgress = () => {
    switch (patterns.riskLevel) {
      case 'high':
        return 85;
      case 'medium':
        return 50;
      default:
        return 20;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Your Patterns...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Pattern Analysis
          </CardTitle>
          <CardDescription>
            AI-powered insights from your last 30 days of usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Usage Risk Level</span>
              <Badge variant={getRiskColor()}>{patterns.riskLevel.toUpperCase()}</Badge>
            </div>
            <Progress value={getRiskProgress()} className="h-2" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Daily Average</span>
              </div>
              <p className="text-lg font-semibold">
                {Math.floor(patterns.averageDaily / 60)}h {patterns.averageDaily % 60}m
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className="text-sm text-muted-foreground">Weekly Trend</span>
              </div>
              <p className="text-lg font-semibold capitalize">{patterns.weeklyTrend}</p>
            </div>
          </div>

          {/* Binge Sessions Alert */}
          {patterns.bingeSessions > 0 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">
                <strong>{patterns.bingeSessions}</strong> binge session{patterns.bingeSessions > 1 ? 's' : ''} detected
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Peak Usage Days */}
      {patterns.peakUsageDays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Peak Usage Days</CardTitle>
            <CardDescription>Days when you tend to use your phone the most</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patterns.peakUsageDays.map((day, index) => (
                <Badge key={index} variant="outline">
                  {day}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trigger Patterns */}
      {patterns.triggerPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Triggers</CardTitle>
            <CardDescription>Patterns that may lead to increased usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {patterns.triggerPatterns.map((pattern, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  {pattern}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>Personalized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {aiInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};