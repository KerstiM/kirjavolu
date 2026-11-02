-- Jõulupass: one row per paid Stripe Checkout Session. The code is what the buyer types in;
-- generations_left counts down as the AI writes, valid_until is the end of 31 January.
CREATE TABLE season_passes (
  code TEXT PRIMARY KEY,
  checkout_session_id TEXT NOT NULL UNIQUE,
  generations_left INTEGER NOT NULL CHECK (generations_left >= 0),
  valid_until TEXT NOT NULL,
  created_at TEXT NOT NULL
);
