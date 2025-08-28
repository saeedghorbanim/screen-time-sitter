import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Heart, Star, MessageSquare, ThumbsUp, Calendar, Award, Plus, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const Testimonials = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  // Fetch testimonials
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles manually for each testimonial
      const testimonialsWithProfiles = await Promise.all(
        data.map(async (testimonial) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', testimonial.user_id)
            .maybeSingle();

          return {
            ...testimonial,
            profiles: profile,
          };
        })
      );

      return testimonialsWithProfiles;
    },
  });

  // Submit testimonial mutation
  const submitTestimonialMutation = useMutation({
    mutationFn: async ({ title, content, rating }: { title: string; content: string; rating: number }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('testimonials')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          rating,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your testimonial has been submitted successfully.",
      });
      setTitle('');
      setContent('');
      setRating(5);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Required fields",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    submitTestimonialMutation.mutate({ title, content, rating });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const renderInteractiveStars = (currentRating: number, onRatingChange: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 cursor-pointer transition-colors ${
          i < currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
        }`}
        onClick={() => onRatingChange(i + 1)}
      />
    ));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-wellness-enhanced floating-orbs flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view and share testimonials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wellness-enhanced floating-orbs">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-primary rounded-xl p-1.5 sm:p-2">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-primary">Success Stories</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Community Achievements</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                <Link to="/dashboard">← Back</Link>
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)}
                size="sm"
                className="bg-gradient-primary hover:opacity-90 text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl space-y-4 sm:space-y-6">

        {/* Hero Section */}
        <div className="text-center py-4 sm:py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">Community Successes</h2>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Real stories from people transforming their digital wellness
          </p>
        </div>

        {/* Submit Form */}
        {showForm && (
          <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                Share Your Success
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Help inspire others by sharing your digital wellness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 'Reduced screen time by 3 hours!'"
                  className="mt-1 text-sm"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium">Your Success</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience and how the app helped..."
                  className="mt-1 min-h-[100px] sm:min-h-[120px] text-sm"
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {renderInteractiveStars(rating, setRating)}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitTestimonialMutation.isPending}
                  size="sm"
                  className="bg-gradient-primary hover:opacity-90 text-xs sm:text-sm"
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {submitTestimonialMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Card */}
        <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-primary">{testimonials.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Successes</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-primary">
                  {testimonials.length > 0 ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1) : '0'}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-primary">
                  {testimonials.filter(t => t.is_featured).length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Featured</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8 sm:py-12">
            <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-primary mb-4 animate-pulse" />
            <p className="text-sm sm:text-base text-muted-foreground">Loading successes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && testimonials.length === 0 && (
          <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6 text-center py-8 sm:py-12">
              <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No successes yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
                Be the first to share your success with the community!
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                size="sm"
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Share Your Success
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Testimonials List */}
        <div className="space-y-4 sm:space-y-6">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className={`border-2 ${testimonial.is_featured ? 'border-yellow-200 bg-gradient-to-r from-yellow-50/80 to-white/80' : 'border-primary/10 bg-white/80'} backdrop-blur-sm`}
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {testimonial.is_featured && (
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                      )}
                      <CardTitle className="text-sm sm:text-lg leading-tight">{testimonial.title}</CardTitle>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="truncate">By {testimonial.profiles?.display_name || testimonial.profiles?.username || 'Anonymous User'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                  {testimonial.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Helpful success</span>
                  </div>
                  {testimonial.is_featured && (
                     <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                       Featured
                     </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </main>
    </div>
  );
};

export default Testimonials;