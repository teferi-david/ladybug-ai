-- Run in Supabase SQL editor if migrations are not applied automatically.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end boolean DEFAULT false;

COMMENT ON COLUMN public.users.subscription_cancel_at_period_end IS
  'True when Stripe subscription.cancel_at_period_end is set (scheduled cancellation at period end).';
