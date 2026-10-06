import type { AppState, Board, User } from './types';

export const STORAGE_KEY = 'taskflow_state_v3';
export const ADMIN_ID = 'usr_admin';
export const JANE_ID = 'usr_jane';
export const ALEX_ID = 'usr_alex';
export const ADMIN_PASSWORD_HASH =
  'pbkdf2_sha256$100000$841155d438abacf0da2570f42fb31886$8ddc3ad164022e7f04342553e88feedd2ff2576ba80980f622184880bc093323';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function createSeedData(): AppState {
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

  const users: Record<string, User> = {
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
  };

  const boards: Record<string, Board> = {
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
  };

  return {
    currentUserId: ADMIN_ID,
    users,
    boardOrder: [b1, b2, b3],
    boards,
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

export function loadState(): AppState {
  const initialState: AppState = process.env.NODE_ENV === 'development'
    ? createSeedData()
    : { currentUserId: null, users: {}, boards: {}, columns: {}, cards: {}, boardOrder: [] };

  if (typeof window === 'undefined') return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      saveState(initialState);
      return initialState;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    const nextState: AppState = {
      ...initialState,
      ...parsed,
      users: { ...initialState.users, ...(parsed.users ?? {}) },
      boards: { ...initialState.boards, ...(parsed.boards ?? {}) },
      columns: { ...initialState.columns, ...(parsed.columns ?? {}) },
      cards: { ...initialState.cards, ...(parsed.cards ?? {}) },
      boardOrder: parsed.boardOrder ?? initialState.boardOrder,
      currentUserId: parsed.currentUserId !== undefined ? parsed.currentUserId : initialState.currentUserId,
    };

    return nextState;
  } catch {
    saveState(initialState);
    return initialState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export { generateId };
