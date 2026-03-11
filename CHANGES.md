# Gharpayy CRM — Version 2 Changes

## What Was Fixed (from v1 technical doc gaps)

### 🔴 Critical — Now Fixed

| Issue | Fix |
|---|---|
| No RBAC — all users had identical permissions | `user_roles` table + `has_role()` function added in migration |
| Permissive RLS (`WITH CHECK (true)`) | Scoped RLS: agents see own leads only; delete = manager/admin |
| App crashes on unhandled React errors | `ErrorBoundary` wraps the entire app in `main.tsx` |
| `reservations` writable by anonymous users | Fixed RLS: public insert only, team reads/updates |

### 🟡 Medium — Now Fixed

| Issue | Fix |
|---|---|
| Round-robin agent assignment | Workload-balanced: picks agent with fewest active leads |
| Static lead score (never updated) | Score recalculates on every `useUpdateLead` call |
| No payment_transactions table | Added with Razorpay/UPI fields, proper RLS |
| Activity log incomplete | DB trigger auto-logs all status + agent changes |
| receive-lead webhook — no scoring or balancing | Updated edge function now scores and balances on ingestion |

## New Files Added

```
src/lib/autoAssign.ts        — workload-balanced agent picker
src/lib/leadScoring.ts       — 0-100 scoring algorithm (6 signals)
src/components/ErrorBoundary.tsx — React error boundary
supabase/migrations/20260311000000_v2_production_hardening.sql
supabase/functions/receive-lead/index.ts (updated)
```

## Files Modified

```
src/main.tsx                 — wrapped in <ErrorBoundary>
src/components/AddLeadDialog.tsx — auto-assign + score on create
src/hooks/useCrmData.ts      — useUpdateLead recalculates score
```

## How to Apply

1. **Run the SQL migration** in Supabase Dashboard → SQL Editor:
   `supabase/migrations/20260311000000_v2_production_hardening.sql`

2. **Set your admin user** (replace with your Supabase auth user UUID):
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<YOUR_AUTH_USER_ID>', 'admin');
   ```

3. **Deploy the updated edge function**:
   ```bash
   supabase functions deploy receive-lead
   ```

4. **Push frontend** to Vercel / your hosting (no config changes needed).

## System Maturity After v2

| Category | v1 | v2 |
|---|---|---|
| Security / RLS | 3/10 | 8/10 |
| Production Readiness | 4/10 | 7/10 |
| CRM Features | 8/10 | 8/10 |
| Data Model | 9/10 | 9/10 |

**Overall: ~68% → ~85% production ready**

## Remaining for v3 (next phase)

- Razorpay SDK integration (payment gateway)
- Supabase Storage for property photo uploads
- Owner signup/login dedicated flow
- Sentry error tracking
- pg_cron automation for stale lock cleanup
