/**
 * Lead Scoring Algorithm — 0 to 100
 *
 * Signals and their max contribution:
 *   Source quality       → up to 20 pts
 *   Pipeline stage       → up to 25 pts
 *   Recency / activity   → up to 20 pts
 *   Budget provided      → up to 15 pts
 *   Location provided    → up to 10 pts
 *   Visit completed      → up to 10 pts
 */

const SOURCE_SCORES: Record<string, number> = {
  whatsapp: 20,
  phone: 18,
  landing_page: 16,
  website: 14,
  instagram: 10,
  facebook: 8,
};

const STAGE_SCORES: Record<string, number> = {
  booked: 25,
  visit_completed: 22,
  visit_scheduled: 18,
  property_suggested: 14,
  requirement_collected: 10,
  contacted: 6,
  new: 2,
  lost: 0,
};

export interface LeadScoringInput {
  source: string;
  status: string;
  last_activity_at?: string | null;
  budget?: string | null;
  preferred_location?: string | null;
  visit_count?: number;
}

export function calculateLeadScore(lead: LeadScoringInput): number {
  let score = 0;

  // 1. Source (up to 20)
  score += SOURCE_SCORES[lead.source] ?? 5;

  // 2. Stage (up to 25)
  score += STAGE_SCORES[lead.status] ?? 0;

  // 3. Recency — decays from 20 → 0 over 30 days
  if (lead.last_activity_at) {
    const daysSinceActivity =
      (Date.now() - new Date(lead.last_activity_at).getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 20 - Math.floor(daysSinceActivity * (20 / 30)));
    score += recencyScore;
  }

  // 4. Budget provided (up to 15)
  if (lead.budget && lead.budget.trim().length > 0) score += 15;

  // 5. Location provided (up to 10)
  if (lead.preferred_location && lead.preferred_location.trim().length > 0) score += 10;

  // 6. Visit done (up to 10)
  if ((lead.visit_count ?? 0) > 0) score += 10;

  return Math.min(100, Math.max(0, score));
}
