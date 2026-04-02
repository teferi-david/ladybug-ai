/** Max words per request for premium humanizer, paraphraser, and similar tools */
export const PREMIUM_MAX_WORDS_PER_REQUEST = 1000

/** Free tier (signed in or not): humanizer runs per calendar day before upgrade required */
export const FREE_TIER_DAILY_HUMANIZER_LIMIT = 2

/** Extra humanizer runs granted when `public.users` is first created (same day, after base daily cap). */
export const SIGNUP_BONUS_HUMANIZER_RUNS = 2

/** Free tier max words per humanizer run (used for signup bonus messaging). */
export const FREE_TIER_MAX_WORDS_PER_RUN = 200

/** Signup bonus messaging: extra runs × max words per free run. */
export const SIGNUP_BONUS_FREE_WORDS =
  SIGNUP_BONUS_HUMANIZER_RUNS * FREE_TIER_MAX_WORDS_PER_RUN
