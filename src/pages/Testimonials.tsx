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
      <div className="min-h-screen bg-gradient-wellness flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-wellness p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <Heart className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-4xl font-bold text-primary mb-4">Community Success Stories</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from real people who have transformed their digital wellness with MindfulTime.
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Button asChild variant="outline">
              <Link to="/">← Back to Dashboard</Link>
            </Button>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </div>
        </div>

        {/* Submit Form */}
        {showForm && (
          <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Share Your Success Story
              </CardTitle>
              <CardDescription>
                Help inspire others by sharing how MindfulTime has helped improve your digital wellness.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 'Reduced my screen time by 3 hours daily!'"
                  className="mt-1"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Your Story</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience, challenges you overcame, and how the app helped you..."
                  className="mt-1 min-h-[120px]"
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {renderInteractiveStars(rating, setRating)}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitTestimonialMutation.isPending}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitTestimonialMutation.isPending ? 'Submitting...' : 'Submit Story'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Card */}
        <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{testimonials.length}</div>
                <div className="text-sm text-muted-foreground">Success Stories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {testimonials.length > 0 ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1) : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {testimonials.filter(t => t.is_featured).length}
                </div>
                <div className="text-sm text-muted-foreground">Featured Stories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-primary mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading success stories...</p>
          </div>
        )}

        {/* Testimonials Grid */}
        {!isLoading && testimonials.length === 0 && (
          <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6 text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your success story with the community!
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Share Your Story
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Testimonials List */}
        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className={`border-2 ${testimonial.is_featured ? 'border-yellow-200 bg-gradient-to-r from-yellow-50/80 to-white/80' : 'border-primary/10 bg-white/80'} backdrop-blur-sm`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {testimonial.is_featured && (
                        <Award className="w-5 h-5 text-yellow-500" />
                      )}
                      <CardTitle className="text-lg">{testimonial.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>By {testimonial.profiles?.display_name || testimonial.profiles?.username || 'Anonymous User'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {testimonial.content}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Helpful story</span>
                  </div>
                  {testimonial.is_featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Featured Story
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Testimonials;