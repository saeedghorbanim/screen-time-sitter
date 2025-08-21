interface TimeDisplayProps {
  minutes: number;
  label: string;
  variant?: "default" | "warning" | "success";
}

export const TimeDisplay = ({ minutes, label, variant = "default" }: TimeDisplayProps) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  const formatTime = () => {
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "text-warning bg-warning/10 border-warning/20";
      case "success":
        return "text-success bg-success/10 border-success/20";
      default:
        return "text-foreground bg-card border-border";
    }
  };

  return (
    <div className={`rounded-xl p-4 border-2 transition-all ${getVariantStyles()}`}>
      <div className="text-2xl font-bold mb-1">{formatTime()}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
};