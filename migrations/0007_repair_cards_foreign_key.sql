CREATE TABLE cards_repaired (
    id TEXT PRIMARY KEY,
    column_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(column_id) REFERENCES columns(id) ON DELETE CASCADE
);

INSERT INTO cards_repaired (
    id,
    column_id,
    title,
    description,
    priority,
    due_date,
    completed,
    created_at
)
SELECT
    id,
    column_id,
    title,
    description,
    priority,
    due_date,
    completed,
    created_at
FROM cards;

DROP TABLE cards;
ALTER TABLE cards_repaired RENAME TO cards;