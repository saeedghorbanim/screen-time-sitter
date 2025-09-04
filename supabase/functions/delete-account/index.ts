import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Extract the JWT token from the Bearer header
    const jwt = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token using the admin client directly
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error("Unauthorized");
    }

    console.log(`Deleting account for user: ${user.id}`);

    // Delete user's data in the correct order (due to foreign key constraints)
    
    // 1. Delete buddy requests
    const { error: buddyRequestsError } = await supabaseAdmin
      .from('buddy_requests')
      .delete()
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    
    if (buddyRequestsError) {
      console.error('Error deleting buddy requests:', buddyRequestsError);
    }

    // 2. Delete buddy relationships  
    const { error: buddiesError } = await supabaseAdmin
      .from('buddies')
      .delete()
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    
    if (buddiesError) {
      console.error('Error deleting buddies:', buddiesError);
    }

    // 3. Delete daily usage data
    const { error: usageError } = await supabaseAdmin
      .from('daily_usage')
      .delete()
      .eq('user_id', user.id);
    
    if (usageError) {
      console.error('Error deleting usage data:', usageError);
    }

    // 4. Delete testimonials
    const { error: testimonialsError } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('user_id', user.id);
    
    if (testimonialsError) {
      console.error('Error deleting testimonials:', testimonialsError);
    }

    // 5. Delete subscription data
    const { error: subscribersError } = await supabaseAdmin
      .from('subscribers')
      .delete()
      .eq('user_id', user.id);
    
    if (subscribersError) {
      console.error('Error deleting subscription data:', subscribersError);
    }

    // 6. Delete profile (this should be last as it may be referenced by other tables)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', user.id);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // 7. Finally, delete the auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      throw deleteUserError;
    }

    console.log(`Successfully deleted account for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-account function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});