import type { AppState } from './types';

const STORAGE_KEY = 'taskflow_state';

// ─── Seed Data ─────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function createSeedData(): AppState {
  // Board 1 – Product Dev
  const b1 = generateId();
  const b1c1 = generateId(), b1c2 = generateId(), b1c3 = generateId();
  const card1 = generateId(), card2 = generateId(), card3 = generateId(),
        card4 = generateId(), card5 = generateId(), card6 = generateId();

  // Board 2 – Marketing
  const b2 = generateId();
  const b2c1 = generateId(), b2c2 = generateId(), b2c3 = generateId();
  const card7 = generateId(), card8 = generateId(), card9 = generateId();

  // Board 3 – Personal
  const b3 = generateId();
  const b3c1 = generateId(), b3c2 = generateId();
  const card10 = generateId(), card11 = generateId();

  const now = new Date().toISOString();

  return {
    boardOrder: [b1, b2, b3],
    boards: {
      [b1]: { id: b1, title: 'Product Development', accent: '#7c3aed', columnIds: [b1c1, b1c2, b1c3], createdAt: now },
      [b2]: { id: b2, title: 'Marketing Campaign', accent: '#0ea5e9', columnIds: [b2c1, b2c2, b2c3], createdAt: now },
      [b3]: { id: b3, title: 'Personal Tasks',      accent: '#10b981', columnIds: [b3c1, b3c2],      createdAt: now },
    },
    columns: {
      [b1c1]: { id: b1c1, title: 'Backlog',    cardIds: [card1, card2] },
      [b1c2]: { id: b1c2, title: 'In Progress', cardIds: [card3, card4] },
      [b1c3]: { id: b1c3, title: 'Done',        cardIds: [card5, card6] },
      [b2c1]: { id: b2c1, title: 'Ideas',       cardIds: [card7] },
      [b2c2]: { id: b2c2, title: 'In Review',   cardIds: [card8, card9] },
      [b2c3]: { id: b2c3, title: 'Published',   cardIds: [] },
      [b3c1]: { id: b3c1, title: 'To Do',       cardIds: [card10, card11] },
      [b3c2]: { id: b3c2, title: 'Done',         cardIds: [] },
    },
    cards: {
      [card1]:  { id: card1,  title: 'Design new onboarding flow',        description: 'Redesign the onboarding screens to improve conversion rates.', priority: 'high',   dueDate: '2026-09-01', createdAt: now },
      [card2]:  { id: card2,  title: 'Refactor authentication module',    description: 'Move from JWT cookies to httpOnly tokens with refresh logic.',  priority: 'medium', dueDate: '2026-08-30', createdAt: now },
      [card3]:  { id: card3,  title: 'Implement drag-and-drop for cards', description: 'Use native HTML5 drag and drop API across all board columns.',   priority: 'urgent', dueDate: '2026-08-25', createdAt: now },
      [card4]:  { id: card4,  title: 'Add dark mode support',             description: 'System-level dark mode toggle with CSS variables.',              priority: 'low',    dueDate: null,         createdAt: now },
      [card5]:  { id: card5,  title: 'Set up CI/CD pipeline',             description: 'GitHub Actions workflow for test, lint, and deploy to Vercel.',  priority: 'high',   dueDate: '2026-08-20', createdAt: now },
      [card6]:  { id: card6,  title: 'Write API documentation',           description: 'Document all REST endpoints using OpenAPI 3.0 spec.',            priority: 'low',    dueDate: '2026-08-18', createdAt: now },
      [card7]:  { id: card7,  title: 'Q3 newsletter concept',             description: 'Draft ideas for the September newsletter campaign.',              priority: 'medium', dueDate: '2026-09-05', createdAt: now },
      [card8]:  { id: card8,  title: 'Landing page copy review',          description: 'Proofread and update hero section and feature callouts.',         priority: 'high',   dueDate: '2026-08-28', createdAt: now },
      [card9]:  { id: card9,  title: 'A/B test email subject lines',      description: 'Run a 50/50 split test on two subject variants.',                 priority: 'medium', dueDate: '2026-09-10', createdAt: now },
      [card10]: { id: card10, title: 'Read "Atomic Habits"',              description: 'Finish the last 4 chapters and take notes.',                     priority: 'low',    dueDate: '2026-09-15', createdAt: now },
      [card11]: { id: card11, title: 'Plan weekend hiking trip',          description: 'Choose a trail, pack gear, and check the weather forecast.',      priority: 'medium', dueDate: '2026-08-30', createdAt: now },
    },
  };
}

// ─── Storage Helpers ────────────────────────────────────────────────────────

export function loadState(): AppState {
  if (typeof window === 'undefined') return createSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedData();
      saveState(seed);
      return seed;
    }
    return JSON.parse(raw) as AppState;
  } catch {
    const seed = createSeedData();
    saveState(seed);
    return seed;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export { generateId };
