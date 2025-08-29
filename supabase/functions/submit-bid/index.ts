import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BidSubmission {
  contractId: string;
  bidAmount: number;
  bidMessage?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    console.log('Authenticated user:', user.id);

    // Parse the request body
    const { contractId, bidAmount, bidMessage }: BidSubmission = await req.json();

    // Validate input
    if (!contractId || !bidAmount || bidAmount <= 0) {
      throw new Error("Contract ID and valid bid amount are required");
    }

    console.log('Submitting bid:', { contractId, bidAmount, bidMessage, userId: user.id });

    // Check if user has bidder role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'bidder')
      .single();

    if (roleError || !roleData) {
      throw new Error("User does not have bidder permissions");
    }

    // Check if contract exists and is open
    const { data: contractData, error: contractError } = await supabaseClient
      .from('contract_bidding_opportunities')
      .select('*')
      .eq('id', contractId)
      .eq('contract_status', 'open')
      .single();

    if (contractError || !contractData) {
      throw new Error("Contract not found or not open for bidding");
    }

    // Check if user has already bid on this contract
    const { data: existingBid, error: existingBidError } = await supabaseClient
      .from('contract_bids')
      .select('id')
      .eq('contract_id', contractId)
      .eq('bidder_id', user.id)
      .single();

    if (existingBid) {
      throw new Error("You have already submitted a bid for this contract");
    }

    // Submit the bid
    const { data: bidData, error: bidError } = await supabaseClient
      .from('contract_bids')
      .insert({
        contract_id: contractId,
        bidder_id: user.id,
        bid_amount_eur: bidAmount,
        bid_message: bidMessage || null,
        status: 'pending'
      })
      .select()
      .single();

    if (bidError) {
      throw new Error(`Failed to submit bid: ${bidError.message}`);
    }

    console.log('Bid submitted successfully:', bidData.id);

    return new Response(JSON.stringify({
      success: true,
      bidId: bidData.id,
      message: "Bid submitted successfully"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in submit-bid function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});