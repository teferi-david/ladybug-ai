-- Extra humanizer runs for new accounts (consumed after base free-tier daily cap per IP).
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS signup_bonus_humanizer_runs_remaining integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.users.signup_bonus_humanizer_runs_remaining IS
  'Bonus humanizer runs after daily IP cap; granted on first public.users insert (e.g. signup).';
