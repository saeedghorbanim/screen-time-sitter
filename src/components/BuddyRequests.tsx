
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Check, X, Mail } from 'lucide-react';

export const BuddyRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Fetch pending requests (sent and received)
  const { data: requests = [] } = useQuery({
    queryKey: ['buddy-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buddy_requests')
        .select(`
          *,
          sender:profiles!buddy_requests_sender_id_fkey(display_name, username),
          receiver:profiles!buddy_requests_receiver_id_fkey(display_name, username)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .eq('status', 'pending');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Send buddy request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async ({ email, message }: { email: string; message: string }) => {
      // First, find the user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', email.split('@')[0]) // Try username first
        .single();

      let receiverId;
      if (profileError || !profiles) {
        // If not found by username, try to find by email through auth metadata
        // For now, we'll use a simpler approach and ask users to use usernames
        throw new Error('User not found. Please use their username instead of email.');
      } else {
        receiverId = profiles.user_id;
      }

      if (receiverId === user?.id) {
        throw new Error("You can't send a buddy request to yourself!");
      }

      // Check if request already exists
      const { data: existing } = await supabase
        .from('buddy_requests')
        .select('id')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user?.id})`)
        .single();

      if (existing) {
        throw new Error('A buddy request already exists between you and this user.');
      }

      // Check if already buddies
      const { data: buddyExists } = await supabase
        .from('buddies')
        .select('id')
        .or(`and(user1_id.eq.${user?.id},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${user?.id})`)
        .single();

      if (buddyExists) {
        throw new Error('You are already buddies with this user.');
      }

      const { error } = await supabase
        .from('buddy_requests')
        .insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          message: message || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: "Your buddy request has been sent successfully.",
      });
      setEmail('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['buddy-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Accept/reject request mutations
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'accepted' | 'rejected' }) => {
      const { data: request, error: fetchError } = await supabase
        .from('buddy_requests')
        .select('sender_id, receiver_id')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Update request status
      const { error: updateError } = await supabase
        .from('buddy_requests')
        .update({ status })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If accepted, create buddy relationship
      if (status === 'accepted') {
        const { error: buddyError } = await supabase
          .from('buddies')
          .insert({
            user1_id: request.sender_id,
            user2_id: request.receiver_id,
          });

        if (buddyError) throw buddyError;
      }
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === 'accepted' ? "Request Accepted!" : "Request Rejected",
        description: status === 'accepted' 
          ? "You now have a new accountability buddy!" 
          : "The buddy request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['buddy-requests'] });
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const receivedRequests = requests.filter(r => r.receiver_id === user?.id);
  const sentRequests = requests.filter(r => r.sender_id === user?.id);

  return (
    <div className="space-y-6">
      {/* Send Request Card */}
      <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Send Buddy Request
          </CardTitle>
          <CardDescription>
            Find someone to be accountable with for your digital wellness goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter their username"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Message (Optional)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="mt-1"
              rows={3}
            />
          </div>
          <Button
            onClick={() => sendRequestMutation.mutate({ email, message })}
            disabled={!email || sendRequestMutation.isPending}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <Mail className="w-4 h-4 mr-2" />
            {sendRequestMutation.isPending ? 'Sending...' : 'Send Request'}
          </Button>
        </CardContent>
      </Card>

      {/* Received Requests */}
      {receivedRequests.length > 0 && (
        <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Buddy Requests Received</CardTitle>
            <CardDescription>
              People who want to be your accountability buddy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {receivedRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-primary/10 rounded-lg">
                <div>
                  <p className="font-medium">
                    {request.sender?.display_name || request.sender?.username || 'Unknown User'}
                  </p>
                  {request.message && (
                    <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: 'accepted' })}
                    disabled={respondToRequestMutation.isPending}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: 'rejected' })}
                    disabled={respondToRequestMutation.isPending}
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Pending Requests Sent</CardTitle>
            <CardDescription>
              Requests you've sent that are waiting for a response.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-primary/10 rounded-lg">
                <div>
                  <p className="font-medium">
                    {request.receiver?.display_name || request.receiver?.username || 'Unknown User'}
                  </p>
                  {request.message && (
                    <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Pending...
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
