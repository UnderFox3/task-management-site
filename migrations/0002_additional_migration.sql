CREATE TABLE columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    title TEXT NOT NULL
);

CREATE TABLE cards (
    id TEXT PRIMARY KEY,
    column_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);