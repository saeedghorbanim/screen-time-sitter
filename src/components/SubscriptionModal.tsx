import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Check, Clock, Star } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubscriptionModal = ({ isOpen, onClose, onSuccess }: SubscriptionModalProps) => {
  const [showTrialOffer, setShowTrialOffer] = useState(false);
  const { purchaseSubscription, isLoading } = useSubscription();

  const handlePurchase = async (productId: string) => {
    try {
      const success = await purchaseSubscription(productId);
      if (success) {
        toast.success('Subscription activated successfully!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      if (error.message === 'CANCELLED') {
        // User cancelled, show trial offer
        setShowTrialOffer(true);
      } else {
        toast.error('Purchase failed. Please try again.');
      }
    }
  };

  const handleTrialPurchase = async () => {
    try {
      const success = await purchaseSubscription('mindfultime_annual_trial');
      if (success) {
        toast.success('Free trial started! Enjoy 3 days free.');
        onSuccess();
        onClose();
      }
    } catch (error) {
      if (error.message !== 'CANCELLED') {
        toast.error('Failed to start trial. Please try again.');
      }
    }
  };

  if (showTrialOffer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-primary">
              Special Offer Just for You! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              Don't miss out on transforming your digital wellness
            </DialogDescription>
          </DialogHeader>
          
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2">3-Day Free Trial</h3>
              <p className="text-muted-foreground mb-4">
                Try MindfulTime risk-free, then continue for just
              </p>
              
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-primary">$19.99</span>
                <span className="text-sm text-muted-foreground">/year</span>
                <div className="text-sm text-muted-foreground line-through">
                  Was $24.99/year
                </div>
              </div>
              
              <div className="space-y-2 mb-6 text-left">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Screen time tracking & insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Personalized wellness recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Progress tracking & achievements</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Cancel anytime</span>
                </div>
              </div>
              
              <Button 
                onClick={handleTrialPurchase}
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:opacity-90 mb-3"
              >
                {isLoading ? 'Processing...' : 'Start Free Trial'}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full text-muted-foreground"
              >
                Maybe later
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center">
            Transform your digital wellness journey
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
              </div>
              <h3 className="text-xl font-bold mb-2">MindfulTime Premium</h3>
              <div className="text-3xl font-bold text-primary mb-1">$24.99</div>
              <div className="text-sm text-muted-foreground">per year ($2.08/month)</div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Comprehensive screen time tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">AI-powered usage insights & patterns</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Personalized wellness recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Progress tracking & achievements</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Motivational coaching & reminders</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>
            
            <Button 
              onClick={() => handlePurchase('mindfultime_annual_premium')}
              disabled={isLoading}
              className="w-full bg-gradient-primary hover:opacity-90 mb-3"
            >
              {isLoading ? 'Processing...' : 'Subscribe Now'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};