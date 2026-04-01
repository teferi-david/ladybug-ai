-- Basic plan: rolling-year word usage (500k cap). Run in Supabase SQL editor if migrations are not applied automatically.

ALTER TABLE users ADD COLUMN IF NOT EXISTS basic_words_yearly_used int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS basic_words_year_start timestamptz NULL;

COMMENT ON COLUMN users.basic_words_yearly_used IS 'Words used in current rolling year window (Basic plans only)';
COMMENT ON COLUMN users.basic_words_year_start IS 'Start of rolling 365-day window for Basic word cap';
