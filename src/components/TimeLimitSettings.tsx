import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Clock, Target, Zap } from "lucide-react";

interface TimeLimitSettingsProps {
  currentLimit: number;
  onLimitChange: (minutes: number) => void;
}

export const TimeLimitSettings = ({ currentLimit, onLimitChange }: TimeLimitSettingsProps) => {
  const [tempLimit, setTempLimit] = useState(currentLimit);

  const handleSave = () => {
    onLimitChange(tempLimit);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const presetLimits = [
    { label: "Focused", minutes: 60, icon: Target, color: "text-green-600" },
    { label: "Balanced", minutes: 120, icon: Clock, color: "text-blue-600" },
    { label: "Relaxed", minutes: 180, icon: Zap, color: "text-purple-600" }
  ];

  return (
    <Card className="shadow-wellness border-2 border-primary/10">
      <CardHeader className="bg-gradient-wellness">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Clock className="w-5 h-5" />
          Daily Screen Time Goal
        </CardTitle>
        <CardDescription>
          Set your ideal daily phone usage limit to maintain digital wellness
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Quick Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Quick Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            {presetLimits.map((preset) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.label}
                  variant="outline"
                  className={`flex flex-col gap-2 h-auto p-4 ${
                    tempLimit === preset.minutes 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:bg-accent/50"
                  }`}
                  onClick={() => setTempLimit(preset.minutes)}
                >
                  <Icon className={`w-5 h-5 ${preset.color}`} />
                  <div className="text-center">
                    <div className="text-sm font-medium">{preset.label}</div>
                    <div className="text-xs opacity-70">{formatTime(preset.minutes)}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Custom Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-muted-foreground">Custom Limit</Label>
            <div className="text-2xl font-bold text-primary">
              {formatTime(tempLimit)}
            </div>
          </div>
          
          <div className="px-2">
            <Slider
              value={[tempLimit]}
              onValueChange={(value) => setTempLimit(value[0])}
              max={300}
              min={15}
              step={15}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>15 min</span>
            <span>5 hours</span>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full bg-gradient-primary hover:opacity-90 shadow-gentle"
          size="lg"
        >
          Save Limit
        </Button>

        <div className="text-xs text-center text-muted-foreground">
          Your limit will reset daily at midnight
        </div>
      </CardContent>
    </Card>
  );
};