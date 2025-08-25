import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature?: string;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ 
  children, 
  feature = "feature" 
}) => {
  const { subscribed, createCheckout, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (subscribed) {
    return <>{children}</>;
  }

  return (
    <Card className="shadow-wellness border-2 border-primary/10 bg-white/80">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-primary text-2xl">
          Upgrade to Premium
        </CardTitle>
        <CardDescription className="text-lg">
          Unlock {feature} and all premium features
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-left">
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
            <span>Advanced usage analytics and insights</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
            <span>AI-powered personalized recommendations</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
            <span>Connect with accountability buddies</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
            <span>Comprehensive progress tracking</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
          <div className="text-3xl font-bold text-primary mb-2">$30/year</div>
          <div className="text-sm text-muted-foreground">That's just $2.50 per month!</div>
        </div>

        <Button 
          onClick={createCheckout}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3"
          size="lg"
        >
          Start Your Premium Journey
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Cancel anytime. No commitment required.
        </p>
      </CardContent>
    </Card>
  );
};