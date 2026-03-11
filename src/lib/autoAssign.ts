import { supabase } from '@/integrations/supabase/client';

/**
 * Workload-balanced agent assignment.
 * Picks the active agent with the fewest open (non-booked, non-lost) leads.
 * Tie-breaks on least recently assigned.
 */
export async function autoAssignAgent(): Promise<string | null> {
  const { data: agents, error: agentsErr } = await supabase
    .from('agents')
    .select('id, name, updated_at')
    .eq('is_active', true);

  if (agentsErr || !agents || agents.length === 0) return null;

  const { data: leads, error: leadsErr } = await supabase
    .from('leads')
    .select('assigned_agent_id, status')
    .not('status', 'in', '("booked","lost")');

  if (leadsErr) return null;

  // Count active leads per agent
  const counts: Record<string, number> = {};
  agents.forEach(a => { counts[a.id] = 0; });
  (leads || []).forEach(l => {
    if (l.assigned_agent_id && counts[l.assigned_agent_id] !== undefined) {
      counts[l.assigned_agent_id]++;
    }
  });

  // Sort by count asc, then by updated_at asc (least recently assigned wins tie)
  const sorted = agents.slice().sort((a, b) => {
    const diff = counts[a.id] - counts[b.id];
    if (diff !== 0) return diff;
    return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
  });

  return sorted[0].id;
}
