import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, User, AlertTriangle, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [newUsername, setNewUsername] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Invalid Username",
        description: "Please enter a valid username",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingUsername(true);
    
    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', newUsername.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        toast({
          title: "Username Taken",
          description: "This username is already taken. Please try another one.",
          variant: "destructive",
        });
        return;
      }

      // Update username
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Username Updated",
        description: "Your username has been successfully updated!",
      });

      setNewUsername("");
      
      // Refresh the page to update username everywhere
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      toast({
        title: "Invalid Password",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated!",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeletingAccount(true);

    try {
      // Delete user's profile and related data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Delete daily usage data
      const { error: usageError } = await supabase
        .from('daily_usage')
        .delete()
        .eq('user_id', user.id);

      if (usageError) throw usageError;

      // Delete buddy relationships
      const { error: buddyError } = await supabase
        .from('buddies')
        .delete()
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (buddyError) throw buddyError;

      // Delete buddy requests
      const { error: requestError } = await supabase
        .from('buddy_requests')
        .delete()
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (requestError) throw requestError;

      // Delete testimonials
      const { error: testimonialError } = await supabase
        .from('testimonials')
        .delete()
        .eq('user_id', user.id);

      if (testimonialError) throw testimonialError;

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      // Sign out after successful deletion
      await signOut();
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Username Change */}
      <Card className="shadow-wellness border-2 border-primary/10 bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <User className="w-5 h-5" />
            Change Username
          </CardTitle>
          <CardDescription>
            Update your username. This will be visible to your accountability buddies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-username">New Username</Label>
            <Input
              id="new-username"
              type="text"
              placeholder="Enter new username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Button 
            onClick={handleUsernameChange}
            disabled={isUpdatingUsername || !newUsername.trim()}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isUpdatingUsername ? "Updating..." : "Update Username"}
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="shadow-wellness border-2 border-primary/10 bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password for better security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Button 
            onClick={handlePasswordChange}
            disabled={isUpdatingPassword || !newPassword.trim() || !confirmPassword.trim()}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="shadow-wellness border-2 border-destructive/20 bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex items-center gap-2"
                disabled={isDeletingAccount}
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data including usage history, buddy connections,
                  and testimonials from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};