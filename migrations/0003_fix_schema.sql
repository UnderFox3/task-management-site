-- Add missing columns to boards table
ALTER TABLE boards ADD COLUMN accent TEXT NOT NULL DEFAULT '';
ALTER TABLE boards ADD COLUMN column_ids TEXT NOT NULL DEFAULT '[]';

-- Add missing column to board_members table
ALTER TABLE board_members ADD COLUMN invited_at TEXT NOT NULL DEFAULT '';

-- Add missing column to columns table
ALTER TABLE columns ADD COLUMN card_ids TEXT NOT NULL DEFAULT '[]';

-- Key-value store for app-level metadata (e.g. board_order)
CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    val TEXT NOT NULL
);
