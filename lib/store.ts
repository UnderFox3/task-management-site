import type { AppState, Board, BoardVisibility, User } from './types';

const STORAGE_KEY = 'taskflow_state_v2';
const ADMIN_PASSWORD_HASH = 'pbkdf2_sha256$220000$841155d438abacf0da2570f42fb31886$8ddc3ad164022e7f04342553e88feedd2ff2576ba80980f622184880bc093323';

function getUserStorageKey(userId: string | null): string {
  return userId ? `taskflow_state_v2_user_${userId}` : STORAGE_KEY;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function createSeedData(): AppState {
  const adminId = generateId();
  const janeId = generateId();
  const alexId = generateId();

  const b1 = generateId();
  const b1c1 = generateId(), b1c2 = generateId(), b1c3 = generateId();
  const card1 = generateId(), card2 = generateId(), card3 = generateId(),
        card4 = generateId(), card5 = generateId(), card6 = generateId();

  const b2 = generateId();
  const b2c1 = generateId(), b2c2 = generateId(), b2c3 = generateId();
  const card7 = generateId(), card8 = generateId(), card9 = generateId();

  const b3 = generateId();
  const b3c1 = generateId(), b3c2 = generateId();
  const card10 = generateId(), card11 = generateId();

  const now = new Date().toISOString();

  const users: Record<string, User> = {
    [adminId]: {
      id: adminId,
      email: 'admin@itask.local',
      username: 'admin',
      passwordHash: ADMIN_PASSWORD_HASH,
      createdAt: now,
    },
    [janeId]: {
      id: janeId,
      email: 'jane@itask.local',
      username: 'jane',
      passwordHash: ADMIN_PASSWORD_HASH,
      createdAt: now,
    },
    [alexId]: {
      id: alexId,
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
      ownerId: adminId,
      visibility: 'public',
      members: {
        [adminId]: { userId: adminId, role: 'owner', invitedAt: now },
      },
    },
    [b2]: {
      id: b2,
      title: 'Marketing Campaign',
      accent: '#0ea5e9',
      columnIds: [b2c1, b2c2, b2c3],
      createdAt: now,
      ownerId: adminId,
      visibility: 'private',
      members: {
        [adminId]: { userId: adminId, role: 'owner', invitedAt: now },
        [janeId]: { userId: janeId, role: 'editor', invitedAt: now },
        [alexId]: { userId: alexId, role: 'viewer', invitedAt: now },
      },
    },
    [b3]: {
      id: b3,
      title: 'Personal Tasks',
      accent: '#10b981',
      columnIds: [b3c1, b3c2],
      createdAt: now,
      ownerId: janeId,
      visibility: 'private',
      members: {
        [janeId]: { userId: janeId, role: 'owner', invitedAt: now },
        [adminId]: { userId: adminId, role: 'viewer', invitedAt: now },
      },
    },
  };

  return {
    currentUserId: adminId,
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
      [card1]:  { id: card1, title: 'Design new onboarding flow', description: 'Redesign the onboarding screens to improve conversion rates.', priority: 'high', dueDate: '2026-09-01', completed: false, createdAt: now },
      [card2]:  { id: card2, title: 'Refactor authentication module', description: 'Move from JWT cookies to httpOnly tokens with refresh logic.', priority: 'medium', dueDate: '2026-08-30', completed: false, createdAt: now },
      [card3]:  { id: card3, title: 'Implement drag-and-drop for cards', description: 'Use native HTML5 drag and drop API across all board columns.', priority: 'urgent', dueDate: '2026-08-25', completed: false, createdAt: now },
      [card4]:  { id: card4, title: 'Add dark mode support', description: 'System-level dark mode toggle with CSS variables.', priority: 'low', dueDate: null, completed: false, createdAt: now },
      [card5]:  { id: card5, title: 'Set up CI/CD pipeline', description: 'GitHub Actions workflow for test, lint, and deploy to Vercel.', priority: 'high', dueDate: '2026-08-20', completed: true, createdAt: now },
      [card6]:  { id: card6, title: 'Write API documentation', description: 'Document all REST endpoints using OpenAPI 3.0 spec.', priority: 'low', dueDate: '2026-08-18', completed: true, createdAt: now },
      [card7]:  { id: card7, title: 'Q3 newsletter concept', description: 'Draft ideas for the September newsletter campaign.', priority: 'medium', dueDate: '2026-09-05', completed: false, createdAt: now },
      [card8]:  { id: card8, title: 'Landing page copy review', description: 'Proofread and update hero section and feature callouts.', priority: 'high', dueDate: '2026-08-28', completed: false, createdAt: now },
      [card9]:  { id: card9, title: 'A/B test email subject lines', description: 'Run a 50/50 split test on two subject variants.', priority: 'medium', dueDate: '2026-09-10', completed: false, createdAt: now },
      [card10]: { id: card10, title: 'Read "Atomic Habits"', description: 'Finish the last 4 chapters and take notes.', priority: 'low', dueDate: '2026-09-15', completed: false, createdAt: now },
      [card11]: { id: card11, title: 'Plan weekend hiking trip', description: 'Choose a trail, pack gear, and check the weather forecast.', priority: 'medium', dueDate: '2026-08-30', completed: false, createdAt: now },
    },
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return createSeedData();
  try {
    const sessionState = localStorage.getItem(STORAGE_KEY);
    const currentUserId = sessionState ? JSON.parse(sessionState)?.currentUserId ?? null : null;
    const storageKey = getUserStorageKey(currentUserId);
    const raw = localStorage.getItem(storageKey) ?? sessionState;

    if (!raw) {
      const seed = createSeedData();
      saveState(seed);
      return seed;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    const seed = createSeedData();
    const nextState = {
      ...seed,
      ...parsed,
      users: { ...seed.users, ...(parsed.users ?? {}) },
      boards: { ...seed.boards, ...(parsed.boards ?? {}) },
      columns: { ...seed.columns, ...(parsed.columns ?? {}) },
      cards: { ...seed.cards, ...(parsed.cards ?? {}) },
      boardOrder: parsed.boardOrder ?? seed.boardOrder,
      currentUserId: parsed.currentUserId ?? seed.currentUserId,
    };

    if (nextState.currentUserId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentUserId: nextState.currentUserId }));
    }

    return nextState;
  } catch {
    const seed = createSeedData();
    saveState(seed);
    return seed;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  const currentUserKey = getUserStorageKey(state.currentUserId);
  localStorage.setItem(currentUserKey, JSON.stringify(state));
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentUserId: state.currentUserId }));
}

export { generateId };
