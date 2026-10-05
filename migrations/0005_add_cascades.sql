ALTER TABLE boards RENAME TO board_old;
CREATE TABLE boards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'PRIVATE',
    created_at TEXT NOT NULL,
    accent TEXT,
    column_ids TEXT,
    FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO boards SELECT * FROM board_old;
DROP TABLE board_old;

ALTER TABLE board_members RENAME TO board_members_old;
CREATE TABLE board_members (
    board_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    invited_at TEXT,
    PRIMARY KEY(board_id, user_id),
    FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO board_members SELECT * FROM board_members_old;
DROP TABLE board_members_old;

ALTER TABLE columns RENAME TO columns_old;
CREATE TABLE columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    title TEXT NOT NULL,
    card_ids TEXT,
    FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE
);
INSERT INTO columns SELECT * FROM columns_old;
DROP TABLE columns_old;

ALTER TABLE cards RENAME TO cards_old;
CREATE TABLE cards (
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
INSERT INTO cards SELECT * FROM cards_old;
DROP TABLE cards_old;

ALTER TABLE verification_tokens RENAME TO verification_tokens_old;
CREATE TABLE verification_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO verification_tokens SELECT * FROM verification_tokens_old;
DROP TABLE verification_tokens_old;