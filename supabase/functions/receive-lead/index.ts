// Gharpayy — receive-lead Edge Function (Deno)
// Webhook endpoint: POST /functions/v1/receive-lead

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SOURCE_SCORES: Record<string, number> = {
  whatsapp: 20, phone: 18, landing_page: 16,
  website: 14, instagram: 10, facebook: 8,
};

function calculateScore(source: string, budget?: string, location?: string): number {
  let score = (SOURCE_SCORES[source] ?? 5) + 2 + 20;
  if (budget?.trim()) score += 15;
  if (location?.trim()) score += 10;
  return Math.min(100, score);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const body = await req.json();
    const { name, phone, email, source = 'website', budget, preferred_location, notes } = body;

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'name and phone are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Duplicate check
    const { data: existing } = await supabase.from('leads').select('id, status').eq('phone', phone).limit(1);
    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ duplicate: true, lead_id: existing[0].id }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Workload-balanced assignment
    const { data: agents } = await supabase.from('agents').select('id, updated_at').eq('is_active', true);
    const { data: activeLeads } = await supabase.from('leads').select('assigned_agent_id').not('status', 'in', '("booked","lost")');
    const counts: Record<string, number> = {};
    (agents || []).forEach(a => { counts[a.id] = 0; });
    (activeLeads || []).forEach(l => { if (l.assigned_agent_id && counts[l.assigned_agent_id] !== undefined) counts[l.assigned_agent_id]++; });
    const sorted = (agents || []).sort((a, b) => { const d = (counts[a.id]??0)-(counts[b.id]??0); return d||new Date(a.updated_at).getTime()-new Date(b.updated_at).getTime(); });
    const agentId = sorted[0]?.id ?? null;

    const leadScore = calculateScore(source, budget, preferred_location);

    const { data: lead, error } = await supabase.from('leads').insert({
      name, phone, email: email||null, source, budget: budget||null,
      preferred_location: preferred_location||null, notes: notes||null,
      assigned_agent_id: agentId, lead_score: leadScore, status: 'new',
      last_activity_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;

    if (agentId) {
      await supabase.from('notifications').insert({
        agent_id: agentId, title: 'New lead assigned',
        message: `${name} (${phone}) via ${source} — score ${leadScore}`,
        lead_id: lead.id, type: 'new_lead',
      });
    }

    return new Response(JSON.stringify({ success: true, lead_id: lead.id, lead_score: leadScore }), {
      status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[receive-lead]', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
