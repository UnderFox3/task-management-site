import type { AppState, Board, BoardMember, Card, Column, User } from './types';

// ---------------------------------------------------------------------------
// Seed constants — kept identical to the original dummy data
// ---------------------------------------------------------------------------
export const ADMIN_ID = 'usr_admin';
export const JANE_ID = 'usr_jane';
export const ALEX_ID = 'usr_alex';
export const ADMIN_PASSWORD_HASH =
  'pbkdf2_sha256$220000$841155d438abacf0da2570f42fb31886$8ddc3ad164022e7f04342553e88feedd2ff2576ba80980f622184880bc093323';

export function getInitialSeed(): AppState {
  const now = new Date().toISOString();

  const b1 = 'board_prod_dev';
  const b1c1 = 'col_b1_1', b1c2 = 'col_b1_2', b1c3 = 'col_b1_3';
  const card1 = 'c1', card2 = 'c2', card3 = 'c3', card4 = 'c4', card5 = 'c5', card6 = 'c6';

  const b2 = 'board_marketing';
  const b2c1 = 'col_b2_1', b2c2 = 'col_b2_2', b2c3 = 'col_b2_3';
  const card7 = 'c7', card8 = 'c8', card9 = 'c9';

  const b3 = 'board_personal';
  const b3c1 = 'col_b3_1', b3c2 = 'col_b3_2';
  const card10 = 'c10', card11 = 'c11';

  return {
    currentUserId: ADMIN_ID,
    users: {
      [ADMIN_ID]: { id: ADMIN_ID, email: 'admin@itask.local', username: 'admin', passwordHash: ADMIN_PASSWORD_HASH, emailVerified: true, createdAt: now },
      [JANE_ID]: { id: JANE_ID, email: 'jane@itask.local', username: 'jane', passwordHash: ADMIN_PASSWORD_HASH, emailVerified: true, createdAt: now },
      [ALEX_ID]: { id: ALEX_ID, email: 'alex@itask.local', username: 'alex', passwordHash: ADMIN_PASSWORD_HASH, emailVerified: true, createdAt: now },
    },
    boardOrder: [b1, b2, b3],
    boards: {
      [b1]: {
        id: b1, title: 'Product Development', accent: '#7c3aed', columnIds: [b1c1, b1c2, b1c3], createdAt: now, ownerId: ADMIN_ID, visibility: 'public',
        members: { [ADMIN_ID]: { userId: ADMIN_ID, role: 'owner', invitedAt: now } }
      },
      [b2]: {
        id: b2, title: 'Marketing Campaign', accent: '#0ea5e9', columnIds: [b2c1, b2c2, b2c3], createdAt: now, ownerId: ADMIN_ID, visibility: 'private',
        members: { [ADMIN_ID]: { userId: ADMIN_ID, role: 'owner', invitedAt: now }, [JANE_ID]: { userId: JANE_ID, role: 'editor', invitedAt: now }, [ALEX_ID]: { userId: ALEX_ID, role: 'viewer', invitedAt: now } }
      },
      [b3]: {
        id: b3, title: 'Personal Tasks', accent: '#10b981', columnIds: [b3c1, b3c2], createdAt: now, ownerId: JANE_ID, visibility: 'private',
        members: { [JANE_ID]: { userId: JANE_ID, role: 'owner', invitedAt: now }, [ADMIN_ID]: { userId: ADMIN_ID, role: 'viewer', invitedAt: now } }
      },
    },
    columns: {
      [b1c1]: { id: b1c1, title: 'Backlog', cardIds: [card1, card2] },
      [b1c2]: { id: b1c2, title: 'In Progress', cardIds: [card3, card4] },
      [b1c3]: { id: b1c3, title: 'Done', cardIds: [card5, card6] },
      [b2c1]: { id: b2c1, title: 'Ideas', cardIds: [card7] },
      [b2c2]: { id: b2c2, title: 'In Review', cardIds: [card8, card9] },
      [b2c3]: { id: b2c3, title: 'Published', cardIds: [] },
      [b3c1]: { id: b3c1, title: 'To Do', cardIds: [card10, card11] },
      [b3c2]: { id: b3c2, title: 'Done', cardIds: [] },
    },
    cards: {
      [card1]: { id: card1, title: 'Design new onboarding flow', description: 'Redesign the onboarding screens to improve conversion rates.', priority: 'high', dueDate: '2026-09-01', completed: false, createdAt: now },
      [card2]: { id: card2, title: 'Refactor authentication module', description: 'Move from JWT cookies to httpOnly tokens with refresh logic.', priority: 'medium', dueDate: '2026-08-30', completed: false, createdAt: now },
      [card3]: { id: card3, title: 'Implement drag-and-drop for cards', description: 'Use native HTML5 drag and drop API across all board columns.', priority: 'urgent', dueDate: '2026-08-25', completed: false, createdAt: now },
      [card4]: { id: card4, title: 'Add dark mode support', description: 'System-level dark mode toggle with CSS variables.', priority: 'low', dueDate: null, completed: false, createdAt: now },
      [card5]: { id: card5, title: 'Set up CI/CD pipeline', description: 'GitHub Actions workflow for test, lint, and deploy to Vercel.', priority: 'high', dueDate: '2026-08-20', completed: true, createdAt: now },
      [card6]: { id: card6, title: 'Write API documentation', description: 'Document all REST endpoints using OpenAPI 3.0 spec.', priority: 'low', dueDate: '2026-08-18', completed: true, createdAt: now },
      [card7]: { id: card7, title: 'Q3 newsletter concept', description: 'Draft ideas for the September newsletter campaign.', priority: 'medium', dueDate: '2026-09-05', completed: false, createdAt: now },
      [card8]: { id: card8, title: 'Landing page copy review', description: 'Proofread and update hero section and feature callouts.', priority: 'high', dueDate: '2026-08-28', completed: false, createdAt: now },
      [card9]: { id: card9, title: 'A/B test email subject lines', description: 'Run a 50/50 split test on two subject variants.', priority: 'medium', dueDate: '2026-09-10', completed: false, createdAt: now },
      [card10]: { id: card10, title: 'Read "Atomic Habits"', description: 'Finish the last 4 chapters and take notes.', priority: 'low', dueDate: '2026-09-15', completed: false, createdAt: now },
      [card11]: { id: card11, title: 'Plan weekend hiking trip', description: 'Choose a trail, pack gear, and check the weather forecast.', priority: 'medium', dueDate: '2026-08-30', completed: false, createdAt: now },
    },
  };
}

// ---------------------------------------------------------------------------
// Row types returned by D1 queries
// ---------------------------------------------------------------------------
interface UserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role?: string;
  email_verified?: number;
  created_at: string;
}

interface BoardRow {
  id: string;
  title: string;
  accent: string;
  owner_id: string;
  visibility: string;
  column_ids: string;
  created_at: string;
}

interface MemberRow {
  board_id: string;
  user_id: string;
  role: string;
  invited_at: string;
}

interface ColumnRow {
  id: string;
  board_id: string;
  title: string;
  card_ids: string;
}

interface CardRow {
  id: string;
  column_id: string;
  title: string;
  description: string;
  priority: string;
  due_date: string | null;
  completed: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Seed database with dummy data (idempotent — skips if users already exist)
// ---------------------------------------------------------------------------
export async function seedDatabaseIfEmpty(db: D1Database): Promise<{ seeded: boolean }> {
  const result = await db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
  if ((result?.count ?? 0) > 0) {
    return { seeded: false };
  }

  const seed = getInitialSeed();
  const stmts: D1PreparedStatement[] = [];

  // Board order
  stmts.push(db.prepare('INSERT OR REPLACE INTO app_meta (key, val) VALUES (?, ?)')
    .bind('board_order', JSON.stringify(seed.boardOrder)));

  // Users
  for (const u of Object.values(seed.users)) {
    stmts.push(db.prepare('INSERT OR REPLACE INTO users (id, email, username, password_hash, email_verified, created_at) VALUES (?, ?, ?, ?, 1, ?)')
      .bind(u.id, u.email.toLowerCase(), u.username, u.passwordHash, u.createdAt));
  }

  // Boards & members
  for (const b of Object.values(seed.boards)) {
    stmts.push(db.prepare('INSERT OR REPLACE INTO boards (id, title, accent, owner_id, visibility, column_ids, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(b.id, b.title, b.accent, b.ownerId, b.visibility, JSON.stringify(b.columnIds), b.createdAt));

    for (const m of Object.values(b.members)) {
      stmts.push(db.prepare('INSERT OR REPLACE INTO board_members (board_id, user_id, role, invited_at) VALUES (?, ?, ?, ?)')
        .bind(b.id, m.userId, m.role, m.invitedAt));
    }
  }

  // Columns
  for (const [colId, col] of Object.entries(seed.columns)) {
    const board = Object.values(seed.boards).find((b) => b.columnIds.includes(colId));
    stmts.push(db.prepare('INSERT OR REPLACE INTO columns (id, board_id, title, card_ids) VALUES (?, ?, ?, ?)')
      .bind(col.id, board?.id ?? '', col.title, JSON.stringify(col.cardIds)));
  }

  // Cards
  for (const [cardId, card] of Object.entries(seed.cards)) {
    const col = Object.values(seed.columns).find((c) => c.cardIds.includes(cardId));
    stmts.push(db.prepare('INSERT OR REPLACE INTO cards (id, column_id, title, description, priority, due_date, completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(card.id, col?.id ?? '', card.title, card.description, card.priority, card.dueDate, card.completed ? 1 : 0, card.createdAt));
  }

  await db.batch(stmts);
  return { seeded: true };
}

// ---------------------------------------------------------------------------
// Read the full app state from D1
// ---------------------------------------------------------------------------
export async function getFullStateFromD1(db: D1Database): Promise<AppState> {
  // Ensure default seed exists if the database is fresh
  const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
  if ((userCount?.count ?? 0) === 0) {
    await seedDatabaseIfEmpty(db);
  }

  const [usersResult, boardsResult, membersResult, columnsResult, cardsResult, metaResult] = await Promise.all([
    db.prepare('SELECT * FROM users').all<UserRow>(),
    db.prepare('SELECT * FROM boards').all<BoardRow>(),
    db.prepare('SELECT * FROM board_members').all<MemberRow>(),
    db.prepare('SELECT * FROM columns').all<ColumnRow>(),
    db.prepare('SELECT * FROM cards').all<CardRow>(),
    db.prepare("SELECT val FROM app_meta WHERE key = 'board_order'").first<{ val: string }>(),
  ]);

  const users: Record<string, User> = {};
  for (const row of (usersResult.results ?? [])) {
    users[row.id] = {
      id: row.id,
      email: row.email,
      username: row.username,
      passwordHash: row.password_hash,
      emailVerified: row.email_verified === 1,
      createdAt: row.created_at,
    };
  }

  const membersByBoard: Record<string, Record<string, BoardMember>> = {};
  for (const row of (membersResult.results ?? [])) {
    if (!membersByBoard[row.board_id]) membersByBoard[row.board_id] = {};
    membersByBoard[row.board_id][row.user_id] = { userId: row.user_id, role: row.role as BoardMember['role'], invitedAt: row.invited_at ?? '' };
  }

  const boards: Record<string, Board> = {};
  for (const row of (boardsResult.results ?? [])) {
    let parsedColumnIds: string[] = [];
    try {
      parsedColumnIds = Array.isArray(row.column_ids) ? row.column_ids : JSON.parse(row.column_ids ?? '[]');
    } catch {
      parsedColumnIds = [];
    }
    boards[row.id] = {
      id: row.id,
      title: row.title,
      accent: row.accent,
      ownerId: row.owner_id,
      visibility: row.visibility as Board['visibility'],
      columnIds: parsedColumnIds,
      createdAt: row.created_at,
      members: membersByBoard[row.id] ?? {},
    };
  }

  const columns: Record<string, Column> = {};
  for (const row of (columnsResult.results ?? [])) {
    let parsedCardIds: string[] = [];
    try {
      parsedCardIds = Array.isArray(row.card_ids) ? row.card_ids : JSON.parse(row.card_ids ?? '[]');
    } catch {
      parsedCardIds = [];
    }
    columns[row.id] = {
      id: row.id,
      title: row.title,
      cardIds: parsedCardIds,
    };
  }

  const cards: Record<string, Card> = {};
  for (const row of (cardsResult.results ?? [])) {
    cards[row.id] = {
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority as Card['priority'],
      dueDate: row.due_date,
      completed: row.completed === 1,
      createdAt: row.created_at,
    };
  }

  let boardOrder: string[] = Object.keys(boards);
  if (metaResult?.val) {
    try {
      boardOrder = JSON.parse(metaResult.val) as string[];
    } catch {
      boardOrder = Object.keys(boards);
    }
  }

  return { users, boards, columns, cards, boardOrder, currentUserId: null };
}

// ---------------------------------------------------------------------------
// Persist the full app state back to D1 (upsert everything)
// ---------------------------------------------------------------------------
export async function saveFullStateToD1(db: D1Database, state: AppState): Promise<void> {
  const stmts: D1PreparedStatement[] = [];

  // 1. Upsert users first so boards foreign key constraint (owner_id -> users.id) succeeds
  for (const u of Object.values(state.users ?? {})) {
    stmts.push(
      db.prepare(`
        INSERT INTO users (id, email, username, password_hash, email_verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          email = excluded.email,
          username = excluded.username,
          password_hash = CASE WHEN excluded.password_hash != '' THEN excluded.password_hash ELSE users.password_hash END,
          email_verified = CASE WHEN excluded.email_verified = 1 THEN 1 ELSE users.email_verified END
      `).bind(
        u.id,
        u.email.toLowerCase(),
        u.username,
        u.passwordHash ?? '',
        u.emailVerified ? 1 : 0,
        u.createdAt || new Date().toISOString()
      )
    );
  }

  // 2. Persist board order
  stmts.push(
    db.prepare('INSERT OR REPLACE INTO app_meta (key, val) VALUES (?, ?)')
      .bind('board_order', JSON.stringify(state.boardOrder ?? []))
  );

  // 3. Persist boards and their members
  for (const b of Object.values(state.boards ?? {})) {
    const columnIds = Array.isArray(b.columnIds)
      ? b.columnIds
      : (typeof b.columnIds === 'string' ? JSON.parse(b.columnIds || '[]') : []);

    stmts.push(
      db.prepare('INSERT OR REPLACE INTO boards (id, title, accent, owner_id, visibility, column_ids, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(b.id, b.title, b.accent, b.ownerId, b.visibility, JSON.stringify(columnIds), b.createdAt)
    );

    if (b.members) {
      for (const m of Object.values(b.members)) {
        stmts.push(
          db.prepare('INSERT OR REPLACE INTO board_members (board_id, user_id, role, invited_at) VALUES (?, ?, ?, ?)')
            .bind(b.id, m.userId, m.role, m.invitedAt ?? '')
        );
      }
    }
  }

  // 4. Persist columns, matching them to their boards
  for (const col of Object.values(state.columns ?? {})) {
    const cardIds = Array.isArray(col.cardIds)
      ? col.cardIds
      : (typeof col.cardIds === 'string' ? JSON.parse(col.cardIds || '[]') : []);

    const board = Object.values(state.boards ?? {}).find((b) => {
      const list = Array.isArray(b.columnIds) ? b.columnIds : [];
      return list.includes(col.id);
    });

    if (board) {
      stmts.push(
        db.prepare('INSERT OR REPLACE INTO columns (id, board_id, title, card_ids) VALUES (?, ?, ?, ?)')
          .bind(col.id, board.id, col.title, JSON.stringify(cardIds))
      );
    }
  }

  // 5. Persist cards, matching them to their columns
  for (const card of Object.values(state.cards ?? {})) {
    const col = Object.values(state.columns ?? {}).find((c) => {
      const list = Array.isArray(c.cardIds) ? c.cardIds : [];
      return list.includes(card.id);
    });

    if (col) {
      stmts.push(
        db.prepare('INSERT OR REPLACE INTO cards (id, column_id, title, description, priority, due_date, completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(card.id, col.id, card.title, card.description, card.priority, card.dueDate, card.completed ? 1 : 0, card.createdAt)
      );
    }
  }

  // Execute in statement chunks to respect Cloudflare D1 batch limits
  const BATCH_SIZE = 40;
  try {
    for (let i = 0; i < stmts.length; i += BATCH_SIZE) {
      const chunk = stmts.slice(i, i + BATCH_SIZE);
      await db.batch(chunk);
    }
  } catch (err) {
    console.error('Failed to save state to D1:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// User helpers
// ---------------------------------------------------------------------------
export async function findUserByEmailInD1(db: D1Database, email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  const row = await db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').bind(normalized).first<UserRow>();

  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    emailVerified: row.email_verified === 1,
    createdAt: row.created_at,
  };
}

export async function insertUserInD1(db: D1Database, user: User): Promise<void> {
  const verified = user.emailVerified ? 1 : 0;
  await db.prepare('INSERT INTO users (id, email, username, password_hash, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(user.id, user.email.toLowerCase(), user.username, user.passwordHash, verified, user.createdAt)
    .run();
}

export async function verifyUserEmailInD1(db: D1Database, userId: string): Promise<void> {
  await db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?')
    .bind(userId)
    .run();
}
