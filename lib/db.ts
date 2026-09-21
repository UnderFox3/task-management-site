import type { AppState, Board, Column, Card, User, BoardMember } from './types';
import fs from 'node:fs';
import path from 'node:path';

export const ADMIN_ID = 'usr_admin';
export const JANE_ID = 'usr_jane';
export const ALEX_ID = 'usr_alex';
export const ADMIN_PASSWORD_HASH =
  'pbkdf2_sha256$220000$841155d438abacf0da2570f42fb31886$8ddc3ad164022e7f04342553e88feedd2ff2576ba80980f622184880bc093323';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'itask.db');

interface DBRow {
  [key: string]: unknown;
}

// Global in-memory cache / fallback if SQLite cannot be loaded
let memoryFallbackState: AppState | null = null;

function getInitialSeed(): AppState {
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
      [ADMIN_ID]: {
        id: ADMIN_ID,
        email: 'admin@itask.local',
        username: 'admin',
        passwordHash: ADMIN_PASSWORD_HASH,
        createdAt: now,
      },
      [JANE_ID]: {
        id: JANE_ID,
        email: 'jane@itask.local',
        username: 'jane',
        passwordHash: ADMIN_PASSWORD_HASH,
        createdAt: now,
      },
      [ALEX_ID]: {
        id: ALEX_ID,
        email: 'alex@itask.local',
        username: 'alex',
        passwordHash: ADMIN_PASSWORD_HASH,
        createdAt: now,
      },
    },
    boardOrder: [b1, b2, b3],
    boards: {
      [b1]: {
        id: b1,
        title: 'Product Development',
        accent: '#7c3aed',
        columnIds: [b1c1, b1c2, b1c3],
        createdAt: now,
        ownerId: ADMIN_ID,
        visibility: 'public',
        members: {
          [ADMIN_ID]: { userId: ADMIN_ID, role: 'owner', invitedAt: now },
        },
      },
      [b2]: {
        id: b2,
        title: 'Marketing Campaign',
        accent: '#0ea5e9',
        columnIds: [b2c1, b2c2, b2c3],
        createdAt: now,
        ownerId: ADMIN_ID,
        visibility: 'private',
        members: {
          [ADMIN_ID]: { userId: ADMIN_ID, role: 'owner', invitedAt: now },
          [JANE_ID]: { userId: JANE_ID, role: 'editor', invitedAt: now },
          [ALEX_ID]: { userId: ALEX_ID, role: 'viewer', invitedAt: now },
        },
      },
      [b3]: {
        id: b3,
        title: 'Personal Tasks',
        accent: '#10b981',
        columnIds: [b3c1, b3c2],
        createdAt: now,
        ownerId: JANE_ID,
        visibility: 'private',
        members: {
          [JANE_ID]: { userId: JANE_ID, role: 'owner', invitedAt: now },
          [ADMIN_ID]: { userId: ADMIN_ID, role: 'viewer', invitedAt: now },
        },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: any = null;

function getSqliteDb() {
  if (dbInstance) return dbInstance;

  try {
    // Dynamic require for node:sqlite
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require('node:sqlite');
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const db = new DatabaseSync(DB_PATH);

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        username TEXT,
        password_hash TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        title TEXT,
        accent TEXT,
        owner_id TEXT,
        visibility TEXT,
        column_ids TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS board_members (
        board_id TEXT,
        user_id TEXT,
        role TEXT,
        invited_at TEXT,
        PRIMARY KEY (board_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS columns (
        id TEXT PRIMARY KEY,
        board_id TEXT,
        title TEXT,
        card_ids TEXT
      );

      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        column_id TEXT,
        title TEXT,
        description TEXT,
        priority TEXT,
        due_date TEXT,
        completed INTEGER,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        val TEXT
      );
    `);

    // Check if initial users exist, seed if not
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count === 0) {
      const seed = getInitialSeed();
      syncStateToDb(db, seed);
    }

    dbInstance = db;
    return dbInstance;
  } catch (err) {
    console.warn('SQLite initialization failed, falling back to memory state:', err);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function syncStateToDb(db: any, state: AppState) {
  // Sync users
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, username, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const u of Object.values(state.users)) {
    insertUser.run(u.id, u.email.toLowerCase(), u.username, u.passwordHash, u.createdAt);
  }

  // Sync boardOrder
  db.prepare('INSERT OR REPLACE INTO app_meta (key, val) VALUES (?, ?)').run('board_order', JSON.stringify(state.boardOrder));

  // Sync boards & members
  const insertBoard = db.prepare(`
    INSERT OR REPLACE INTO boards (id, title, accent, owner_id, visibility, column_ids, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMember = db.prepare(`
    INSERT OR REPLACE INTO board_members (board_id, user_id, role, invited_at)
    VALUES (?, ?, ?, ?)
  `);

  for (const b of Object.values(state.boards)) {
    insertBoard.run(b.id, b.title, b.accent, b.ownerId, b.visibility, JSON.stringify(b.columnIds), b.createdAt);
    if (b.members) {
      for (const m of Object.values(b.members)) {
        insertMember.run(b.id, m.userId, m.role, m.invitedAt);
      }
    }
  }

  // Sync columns
  const insertColumn = db.prepare(`
    INSERT OR REPLACE INTO columns (id, board_id, title, card_ids)
    VALUES (?, ?, ?, ?)
  `);
  for (const [colId, col] of Object.entries(state.columns)) {
    // find boardId for col
    const board = Object.values(state.boards).find((b) => b.columnIds.includes(colId));
    insertColumn.run(col.id, board?.id ?? '', col.title, JSON.stringify(col.cardIds));
  }

  // Sync cards
  const insertCard = db.prepare(`
    INSERT OR REPLACE INTO cards (id, column_id, title, description, priority, due_date, completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const [cardId, card] of Object.entries(state.cards)) {
    const col = Object.values(state.columns).find((c) => c.cardIds.includes(cardId));
    insertCard.run(
      card.id,
      col?.id ?? '',
      card.title,
      card.description,
      card.priority,
      card.dueDate,
      card.completed ? 1 : 0,
      card.createdAt
    );
  }
}

export function getFullDatabaseState(): AppState {
  const db = getSqliteDb();
  if (!db) {
    if (!memoryFallbackState) memoryFallbackState = getInitialSeed();
    return memoryFallbackState;
  }

  try {
    // Read users
    const usersRows = db.prepare('SELECT * FROM users').all() as DBRow[];
    const users: Record<string, User> = {};
    for (const r of usersRows) {
      users[r.id as string] = {
        id: r.id as string,
        email: (r.email as string).toLowerCase(),
        username: r.username as string,
        passwordHash: r.password_hash as string,
        createdAt: r.created_at as string,
      };
    }

    // Read board_order
    const orderRow = db.prepare("SELECT val FROM app_meta WHERE key = 'board_order'").get() as DBRow | undefined;
    let boardOrder: string[] = [];
    if (orderRow?.val) {
      try {
        boardOrder = JSON.parse(orderRow.val as string);
      } catch {
        boardOrder = [];
      }
    }

    // Read boards
    const boardRows = db.prepare('SELECT * FROM boards').all() as DBRow[];
    const memberRows = db.prepare('SELECT * FROM board_members').all() as DBRow[];
    const boards: Record<string, Board> = {};

    for (const r of boardRows) {
      const bId = r.id as string;
      let columnIds: string[] = [];
      try {
        columnIds = JSON.parse((r.column_ids as string) || '[]');
      } catch {
        columnIds = [];
      }

      const boardMembers: Record<string, BoardMember> = {};
      for (const m of memberRows) {
        if (m.board_id === bId) {
          boardMembers[m.user_id as string] = {
            userId: m.user_id as string,
            role: m.role as BoardMember['role'],
            invitedAt: m.invited_at as string,
          };
        }
      }

      boards[bId] = {
        id: bId,
        title: r.title as string,
        accent: r.accent as string,
        columnIds,
        createdAt: r.created_at as string,
        ownerId: r.owner_id as string,
        visibility: r.visibility as Board['visibility'],
        members: boardMembers,
      };
    }

    // Ensure all board IDs are in boardOrder
    for (const bId of Object.keys(boards)) {
      if (!boardOrder.includes(bId)) {
        boardOrder.push(bId);
      }
    }

    // Read columns
    const colRows = db.prepare('SELECT * FROM columns').all() as DBRow[];
    const columns: Record<string, Column> = {};
    for (const r of colRows) {
      let cardIds: string[] = [];
      try {
        cardIds = JSON.parse((r.card_ids as string) || '[]');
      } catch {
        cardIds = [];
      }
      columns[r.id as string] = {
        id: r.id as string,
        title: r.title as string,
        cardIds,
      };
    }

    // Read cards
    const cardRows = db.prepare('SELECT * FROM cards').all() as DBRow[];
    const cards: Record<string, Card> = {};
    for (const r of cardRows) {
      cards[r.id as string] = {
        id: r.id as string,
        title: r.title as string,
        description: (r.description as string) || '',
        priority: r.priority as Card['priority'],
        dueDate: (r.due_date as string) || null,
        completed: Boolean(r.completed),
        createdAt: r.created_at as string,
      };
    }

    return {
      currentUserId: ADMIN_ID,
      users,
      boardOrder,
      boards,
      columns,
      cards,
    };
  } catch (err) {
    console.error('Error reading from SQLite database:', err);
    if (!memoryFallbackState) memoryFallbackState = getInitialSeed();
    return memoryFallbackState;
  }
}

export function saveFullDatabaseState(state: AppState): void {
  const db = getSqliteDb();
  if (!db) {
    memoryFallbackState = state;
    return;
  }

  try {
    syncStateToDb(db, state);
  } catch (err) {
    console.error('Error writing to SQLite database:', err);
  }
}

export function findUserByEmail(email: string): User | null {
  const normalized = email.trim().toLowerCase();
  const db = getSqliteDb();
  if (!db) {
    const s = getFullDatabaseState();
    return Object.values(s.users).find((u) => u.email === normalized) ?? null;
  }

  try {
    const row = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(normalized) as DBRow | undefined;
    if (!row) return null;
    return {
      id: row.id as string,
      email: (row.email as string).toLowerCase(),
      username: row.username as string,
      passwordHash: row.password_hash as string,
      createdAt: row.created_at as string,
    };
  } catch {
    return null;
  }
}

export function insertUser(user: User): void {
  const db = getSqliteDb();
  if (!db) {
    if (!memoryFallbackState) memoryFallbackState = getInitialSeed();
    memoryFallbackState.users[user.id] = user;
    return;
  }

  try {
    db.prepare(`
      INSERT OR REPLACE INTO users (id, email, username, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.id, user.email.toLowerCase(), user.username, user.passwordHash, user.createdAt);
  } catch (err) {
    console.error('Error inserting user to DB:', err);
  }
}
