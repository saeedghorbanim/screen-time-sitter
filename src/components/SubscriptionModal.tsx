import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import { Check, Clock, Star, AlertCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { toast } from '@/hooks/use-toast';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubscriptionModal = ({ isOpen, onClose, onSuccess }: SubscriptionModalProps) => {
  const [showTrialOffer, setShowTrialOffer] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isYearly, setIsYearly] = useState(true);
  const { purchaseSubscription, isLoading } = useSubscription();

  const handleClose = () => {
    if (!showTrialOffer && !showConfirmation) {
      setShowConfirmation(true);
    } else {
      // Reset states and close
      setShowTrialOffer(false);
      setShowConfirmation(false);
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmation(false);
    setShowTrialOffer(true);
  };

  const handleReallyCancel = () => {
    setShowTrialOffer(false);
    setShowConfirmation(false);
    onClose();
  };

  const handleDirectClose = () => {
    // Direct close without state transitions to prevent flash
    setShowTrialOffer(false);
    setShowConfirmation(false);
    onClose();
  };

  const handlePurchase = async (productId: string) => {
    try {
      const success = await purchaseSubscription(productId);
      if (success) {
        toast({
          title: "Success!",
          description: "Subscription activated successfully!",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      if (error.message === 'CANCELLED') {
        // User cancelled during purchase, show trial offer
        setShowTrialOffer(true);
      } else {
        toast({
          title: "Error",
          description: "Purchase failed. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTrialPurchase = async () => {
    try {
      const success = await purchaseSubscription('mindfultime_annual_trial');
      if (success) {
        toast({
          title: "Free trial started!",
          description: "Enjoy 3 days free.",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      if (error.message !== 'CANCELLED') {
        toast({
          title: "Error",
          description: "Failed to start trial. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Confirmation dialog when user tries to cancel
  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm sm:max-w-md mx-auto mobile-modal p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-2xl font-bold text-primary flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Wait! Are you sure?
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              You're about to miss out on transforming your digital wellness
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-2 sm:py-4">
            <p className="text-muted-foreground mb-4 text-sm">
              MindfulTime helps thousands of people build healthier relationships with their devices. 
              Are you sure you don't want to join them?
            </p>
            
            <div className="space-y-2 sm:space-y-3">
              <Button 
                onClick={handleConfirmCancel}
                className="w-full bg-gradient-primary hover:opacity-90 text-sm py-2 sm:py-3"
              >
                Actually, I'm interested - show me options
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReallyCancel}
                className="w-full text-sm py-2 sm:py-3"
              >
                No thanks, maybe later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showTrialOffer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm sm:max-w-md mx-auto mobile-modal p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-2xl font-bold text-primary">
              Choose Your Plan 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              Select the perfect plan for your digital wellness journey
            </DialogDescription>
          </DialogHeader>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`text-sm ${!isYearly ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isYearly ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 58%
              </span>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Main Plan */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex justify-center mb-2 sm:mb-3">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  {isYearly ? '3-Day Free Trial' : 'Monthly Plan'}
                </h3>
                {isYearly && (
                  <p className="text-muted-foreground mb-2 sm:mb-3 text-sm">
                    Try MindfulTime risk-free, then continue for just
                  </p>
                )}
                
                <div className="text-center mb-2 sm:mb-3">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {isYearly ? '$19.99' : '$4.99'}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {isYearly ? '/year' : '/month'}
                  </span>
                  {isYearly && (
                    <div className="text-xs sm:text-sm text-muted-foreground line-through">
                      Was $24.99/year
                    </div>
                  )}
                </div>
                
                <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-left">
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-xs sm:text-sm">Screen time tracking & insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-xs sm:text-sm">Personalized wellness recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-xs sm:text-sm">Progress tracking & achievements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-xs sm:text-sm">Cancel anytime</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handlePurchase(isYearly ? 'mindfultime_annual_trial' : 'mindfultime_monthly')}
                  disabled={isLoading}
                  className="w-full bg-gradient-primary hover:opacity-90 mb-2 sm:mb-3 text-sm py-2 sm:py-3"
                >
                  {isLoading ? 'Processing...' : (isYearly ? 'Start Free Trial' : 'Subscribe Monthly')}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleDirectClose}
            className="w-full text-muted-foreground text-sm py-1 sm:py-2 mt-2"
          >
            Maybe later
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm sm:max-w-md mx-auto mobile-modal">
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
              onClick={handleClose}
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