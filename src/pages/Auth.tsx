import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Smartphone, Users, Target, ArrowRight, ArrowLeft, Clock, Heart, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthStep = 'welcome' | 'onboarding' | 'signup' | 'signin';

interface OnboardingData {
  mostUsedApps: string[];
  dailyHours: string;
  digitalGoals: string[];
  currentChallenges: string[];
  motivations: string[];
}

export const Auth = () => {
  const { signUp, signIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AuthStep>('welcome');
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Onboarding data
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    mostUsedApps: [],
    dailyHours: '',
    digitalGoals: [],
    currentChallenges: [],
    motivations: []
  });
  
  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  });
  
  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signUp(signUpData.email, signUpData.password, signUpData.username, signUpData.displayName);
      if (result.error) {
        // Error handling is done in AuthProvider
        return;
      }
      // Success - user will be redirected automatically
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(signInData.email, signInData.password);
    } finally {
      setLoading(false);
    }
  };

  const onboardingQuestions = [
    {
      title: "What apps do you use most?",
      subtitle: "Select all that apply",
      options: ["Social Media", "Gaming", "Streaming", "Shopping", "News", "Productivity", "Dating", "Other"],
      key: "mostUsedApps" as keyof OnboardingData,
      multiple: true
    },
    {
      title: "How many hours do you think you're on your phone each day?",
      subtitle: "Choose the range that feels most accurate",
      options: ["Less than 2 hours", "2-4 hours", "4-6 hours", "6-8 hours", "More than 8 hours"],
      key: "dailyHours" as keyof OnboardingData,
      multiple: false
    },
    {
      title: "What are your digital wellness goals?",
      subtitle: "What would you like to achieve?",
      options: ["Reduce overall screen time", "Better sleep habits", "More focus time", "Healthier app usage", "Digital detox periods", "Mindful usage"],
      key: "digitalGoals" as keyof OnboardingData,
      multiple: true
    },
    {
      title: "What challenges do you face?",
      subtitle: "What makes it hard to manage screen time?",
      options: ["Mindless scrolling", "FOMO", "Work demands", "Boredom", "Habit", "Notifications"],
      key: "currentChallenges" as keyof OnboardingData,
      multiple: true
    },
    {
      title: "What motivates you to change?",
      subtitle: "What's driving your digital wellness journey?",
      options: ["Better relationships", "Improved productivity", "Mental health", "Physical health", "Better sleep", "Personal growth"],
      key: "motivations" as keyof OnboardingData,
      multiple: true
    }
  ];

  const handleOptionSelect = (questionKey: keyof OnboardingData, option: string, multiple: boolean) => {
    setOnboardingData(prev => {
      if (multiple) {
        const currentValues = prev[questionKey] as string[];
        const isSelected = currentValues.includes(option);
        return {
          ...prev,
          [questionKey]: isSelected 
            ? currentValues.filter(v => v !== option)
            : [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [questionKey]: option
        };
      }
    });
  };

  const canProceedToNext = () => {
    const currentQuestion = onboardingQuestions[onboardingStep];
    const currentData = onboardingData[currentQuestion.key];
    
    if (currentQuestion.multiple) {
      return (currentData as string[]).length > 0;
    } else {
      return currentData !== '';
    }
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-primary">
          Welcome to MindfulTime
        </h1>
        <p className="text-xl text-muted-foreground">
          Your Digital Wellness Journey Starts Here
        </p>
      </div>
      
      <div className="space-y-4 max-w-md mx-auto">
        <Button 
          onClick={() => setCurrentStep('onboarding')}
          className="w-full h-16 text-lg bg-gradient-primary hover:opacity-90"
          size="lg"
        >
          <Heart className="w-6 h-6 mr-3" />
          Let's get to know you better
        </Button>
        
        <Button 
          onClick={() => setCurrentStep('signin')}
          variant="outline"
          className="w-full h-12 border-primary/20 hover:bg-primary/5"
          size="lg"
        >
          Already have an account? Sign In
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
        <div className="flex flex-col items-center p-6 bg-white/50 rounded-lg">
          <Target className="w-8 h-8 text-primary mb-2" />
          <span className="text-sm font-medium">Set Goals</span>
        </div>
        <div className="flex flex-col items-center p-6 bg-white/50 rounded-lg">
          <Users className="w-8 h-8 text-primary mb-2" />
          <span className="text-sm font-medium">Find Buddies</span>
        </div>
        <div className="flex flex-col items-center p-6 bg-white/50 rounded-lg">
          <Smartphone className="w-8 h-8 text-primary mb-2" />
          <span className="text-sm font-medium">Track Progress</span>
        </div>
      </div>
    </div>
  );

  const renderOnboardingStep = () => {
    const currentQuestion = onboardingQuestions[onboardingStep];
    const progress = ((onboardingStep + 1) / onboardingQuestions.length) * 100;

    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Question {onboardingStep + 1} of {onboardingQuestions.length}
          </p>
          <h2 className="text-2xl font-bold text-primary">{currentQuestion.title}</h2>
          <p className="text-muted-foreground">{currentQuestion.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option) => {
            const currentData = onboardingData[currentQuestion.key];
            const isSelected = currentQuestion.multiple 
              ? (currentData as string[]).includes(option)
              : currentData === option;

            return (
              <Button
                key={option}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto p-4 justify-start text-left ${
                  isSelected 
                    ? "bg-gradient-primary text-white" 
                    : "border-primary/20 hover:bg-primary/5"
                }`}
                onClick={() => handleOptionSelect(currentQuestion.key, option, currentQuestion.multiple)}
              >
                <div className="flex items-center w-full">
                  {isSelected && <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />}
                  <span className="flex-1">{option}</span>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (onboardingStep === 0) {
                setCurrentStep('welcome');
              } else {
                setOnboardingStep(prev => prev - 1);
              }
            }}
            className="border-primary/20 hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={() => {
              if (onboardingStep === onboardingQuestions.length - 1) {
                setCurrentStep('signup');
              } else {
                setOnboardingStep(prev => prev + 1);
              }
            }}
            disabled={!canProceedToNext()}
            className="bg-gradient-primary hover:opacity-90"
          >
            {onboardingStep === onboardingQuestions.length - 1 ? "Continue to Sign Up" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderSignUpStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">Create Your Account</h2>
        <p className="text-muted-foreground">
          Great! Now let's create your account to get started
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signup-username">Username</Label>
            <Input
              id="signup-username"
              type="text"
              placeholder="Choose username"
              value={signUpData.username}
              onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-displayname">Display Name</Label>
            <Input
              id="signup-displayname"
              type="text"
              placeholder="Your display name"
              value={signUpData.displayName}
              onChange={(e) => setSignUpData({ ...signUpData, displayName: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            value={signUpData.email}
            onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Create a password"
            value={signUpData.password}
            onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
            required
            minLength={6}
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOnboardingStep(onboardingQuestions.length - 1);
              setCurrentStep('onboarding');
            }}
            className="border-primary/20 hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderSignInStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">Welcome Back</h2>
        <p className="text-muted-foreground">
          Sign in to continue your digital wellness journey
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email or Username</Label>
          <Input
            id="signin-email"
            type="text"
            placeholder="Enter your email or username"
            value={signInData.email}
            onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            placeholder="Enter your password"
            value={signInData.password}
            onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
            required
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep('welcome')}
            className="border-primary/20 hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <button
          onClick={() => setCurrentStep('onboarding')}
          className="text-sm text-primary hover:underline"
        >
          New here? Let's get to know you better
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-wellness floating-orbs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-wellness border-2 border-primary/10 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {currentStep === 'welcome' && renderWelcomeStep()}
            {currentStep === 'onboarding' && renderOnboardingStep()}
            {currentStep === 'signup' && renderSignUpStep()}
            {currentStep === 'signin' && renderSignInStep()}
            
            <div className="mt-8 text-center">
              <Link to="/" className="text-sm text-primary hover:underline">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};