-- Coin balance: 1 coin = 1 word for free-tier tool usage (replaces daily IP limits for coin-based flows).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS coin_balance integer NOT NULL DEFAULT 400;

COMMENT ON COLUMN public.users.coin_balance IS 'Word credits; deducted per tool run (1 coin per word) for non-Pro users.';

-- Atomic deduct; returns new balance, or -1 if insufficient funds.
CREATE OR REPLACE FUNCTION public.try_deduct_coins(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  IF p_amount < 0 THEN
    RAISE EXCEPTION 'invalid amount';
  END IF;
  IF p_amount = 0 THEN
    SELECT coin_balance INTO new_balance FROM public.users WHERE id = p_user_id;
    RETURN COALESCE(new_balance, -1);
  END IF;
  UPDATE public.users
  SET coin_balance = coin_balance - p_amount, updated_at = now()
  WHERE id = p_user_id AND coin_balance >= p_amount
  RETURNING coin_balance INTO new_balance;
  IF new_balance IS NULL THEN
    RETURN -1;
  END IF;
  RETURN new_balance;
END;
$$;

-- Refund after failed AI call (e.g. OpenAI error).
CREATE OR REPLACE FUNCTION public.refund_coins(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    SELECT coin_balance INTO new_balance FROM public.users WHERE id = p_user_id;
    RETURN COALESCE(new_balance, 0);
  END IF;
  UPDATE public.users
  SET coin_balance = coin_balance + p_amount, updated_at = now()
  WHERE id = p_user_id
  RETURNING coin_balance INTO new_balance;
  RETURN COALESCE(new_balance, 0);
END;
$$;
