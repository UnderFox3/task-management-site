export async function isBoardOwner(
  db: D1Database,
  boardId: string,
  userId: string,
): Promise<boolean> {
  const board = await db.prepare('SELECT owner_id FROM boards WHERE id = ?')
    .bind(boardId)
    .first<{ owner_id: string }>();
  return board?.owner_id === userId;
}
