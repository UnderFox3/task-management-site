ALTER TABLE columns RENAME TO columns_old;

CREATE TABLE columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    title TEXT NOT NULL,
    FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE
);

INSERT INTO columns (
    id,
    board_id,
    title
) SELECT id, board_id, title FROM columns_old;

DROP TABLE columns_old;