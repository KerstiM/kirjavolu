-- Jõulupass: one AI letter rewritten on the parent's request ("Paranda AI-ga") uses one of
-- fixes_left, apart from generations_left, so the AI cannot be asked without end.
ALTER TABLE season_passes ADD COLUMN fixes_left INTEGER NOT NULL DEFAULT 30 CHECK (fixes_left >= 0);
