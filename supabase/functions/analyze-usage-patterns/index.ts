import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UsageData {
  date: string;
  usage_minutes: number;
  daily_limit_minutes: number;
  status: string;
}

interface PatternAnalysis {
  weeklyTrend: 'increasing' | 'decreasing' | 'stable';
  peakUsageDays: string[];
  averageDaily: number;
  bingeSessions: number;
  triggerPatterns: string[];
  personalizedTips: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user's usage data for the last 30 days
    const { data: usageData, error } = await supabaseClient
      .from('daily_usage')
      .select('*')
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching usage data:', error);
      throw error;
    }

    const usage = usageData as UsageData[];
    
    // Analyze patterns
    const patterns = analyzeUsagePatterns(usage);
    
    // Generate AI insights
    const aiInsights = await generateAIInsights(usage, patterns);
    
    return new Response(
      JSON.stringify({
        patterns,
        aiInsights,
        dataPoints: usage.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-usage-patterns function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function analyzeUsagePatterns(usage: UsageData[]): PatternAnalysis {
  if (usage.length < 3) {
    return {
      weeklyTrend: 'stable',
      peakUsageDays: [],
      averageDaily: 0,
      bingeSessions: 0,
      triggerPatterns: [],
      personalizedTips: [],
      riskLevel: 'low'
    };
  }

  const usageMinutes = usage.map(d => d.usage_minutes);
  const averageDaily = usageMinutes.reduce((a, b) => a + b, 0) / usage.length;
  
  // Analyze trend (last 7 days vs previous 7 days)
  const recent7 = usageMinutes.slice(-7);
  const previous7 = usageMinutes.slice(-14, -7);
  const recentAvg = recent7.reduce((a, b) => a + b, 0) / recent7.length;
  const previousAvg = previous7.length ? previous7.reduce((a, b) => a + b, 0) / previous7.length : recentAvg;
  
  let weeklyTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  const trendThreshold = averageDaily * 0.15; // 15% threshold
  
  if (recentAvg - previousAvg > trendThreshold) {
    weeklyTrend = 'increasing';
  } else if (previousAvg - recentAvg > trendThreshold) {
    weeklyTrend = 'decreasing';
  }

  // Find peak usage days (above 1.5x average)
  const peakUsageDays = usage
    .filter(d => d.usage_minutes > averageDaily * 1.5)
    .map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'long' }));

  // Count binge sessions (usage > 2x daily limit)
  const bingeSessions = usage.filter(d => d.usage_minutes > d.daily_limit_minutes * 2).length;

  // Analyze day-of-week patterns
  const dayPatterns: { [key: string]: number[] } = {};
  usage.forEach(d => {
    const day = new Date(d.date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!dayPatterns[day]) dayPatterns[day] = [];
    dayPatterns[day].push(d.usage_minutes);
  });

  const triggerPatterns: string[] = [];
  Object.entries(dayPatterns).forEach(([day, minutes]) => {
    const dayAvg = minutes.reduce((a, b) => a + b, 0) / minutes.length;
    if (dayAvg > averageDaily * 1.3) {
      triggerPatterns.push(`High usage on ${day}s`);
    }
  });

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const exceedLimitDays = usage.filter(d => d.usage_minutes > d.daily_limit_minutes).length;
  const exceedPercentage = exceedLimitDays / usage.length;
  
  if (exceedPercentage > 0.5 || bingeSessions > 3) {
    riskLevel = 'high';
  } else if (exceedPercentage > 0.3 || bingeSessions > 1) {
    riskLevel = 'medium';
  }

  return {
    weeklyTrend,
    peakUsageDays: [...new Set(peakUsageDays)],
    averageDaily: Math.round(averageDaily),
    bingeSessions,
    triggerPatterns,
    personalizedTips: [],
    riskLevel
  };
}

async function generateAIInsights(usage: UsageData[], patterns: PatternAnalysis): Promise<string[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return ['Enable AI insights by configuring your OpenAI API key.'];
  }

  try {
    const usageSummary = `
Usage Analysis for Last ${usage.length} Days:
- Average daily usage: ${patterns.averageDaily} minutes
- Weekly trend: ${patterns.weeklyTrend}
- Peak usage days: ${patterns.peakUsageDays.join(', ') || 'None'}
- Binge sessions: ${patterns.bingeSessions}
- Risk level: ${patterns.riskLevel}
- Trigger patterns: ${patterns.triggerPatterns.join(', ') || 'None detected'}
- Days exceeding limit: ${usage.filter(d => d.usage_minutes > d.daily_limit_minutes).length}/${usage.length}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a digital wellness expert helping users understand their phone usage patterns. Provide personalized, actionable insights to reduce excessive screen time. Keep responses concise and motivating.'
          },
          {
            role: 'user',
            content: `Based on this usage data, provide 3-4 specific, actionable tips to help reduce phone usage:\n\n${usageSummary}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return ['Unable to generate AI insights at this time.'];
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;
    
    // Split insights into bullet points
    return insights.split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.replace(/^\d+\.\s*|-\s*|\*\s*/, '').trim())
      .filter((line: string) => line.length > 10)
      .slice(0, 4);
      
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return ['AI insights temporarily unavailable. Try again later.'];
  }
}