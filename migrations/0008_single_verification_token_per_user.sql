DELETE FROM verification_tokens
WHERE rowid NOT IN (
    SELECT rowid
    FROM verification_tokens AS current_token
    WHERE rowid = (
        SELECT rowid
        FROM verification_tokens AS newest_token
        WHERE newest_token.user_id = current_token.user_id
        ORDER BY newest_token.created_at DESC, newest_token.rowid DESC
        LIMIT 1
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_tokens_user_id
    ON verification_tokens(user_id);
