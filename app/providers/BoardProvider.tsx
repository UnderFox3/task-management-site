'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { AppState, Board, BoardAccessRole, Card, Column, Priority, User } from '@/lib/types';
import { generateId, loadState, saveState } from '@/lib/store';
import { canAccessBoard, normalizeEmail, verifyPassword, hashPassword, getEffectiveRole } from '@/lib/rbac';

interface LoginResult {
  success: boolean;
  message: string;
}

interface BoardContextValue {
  state: AppState;
  currentUser: User | null;
  isBoardAccessible: (boardId: string) => boolean;
  canManageBoard: (boardId: string, minimumRole?: BoardAccessRole) => boolean;
  getBoardRole: (boardId: string) => BoardAccessRole | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  switchUser: (userId: string) => void;
  inviteUserToBoard: (boardId: string, email: string, role?: BoardAccessRole) => { success: boolean; message: string };
  addBoard: (title: string, accent: string, visibility?: 'public' | 'private') => string;
  updateBoard: (boardId: string, changes: Partial<Pick<Board, 'title' | 'accent' | 'visibility'>>) => void;
  deleteBoard: (boardId: string) => void;
  addColumn: (boardId: string, title: string) => void;
  updateColumn: (columnId: string, title: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  addCard: (columnId: string, title: string) => string;
  updateCard: (cardId: string, changes: Partial<Omit<Card, 'id' | 'createdAt'>>) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  moveColumn: (boardId: string, fromColumnId: string, toIndex: number) => void;
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void;
}

type Action =
  | { type: 'LOAD'; payload: AppState }
  | { type: 'SET_CURRENT_USER'; currentUserId: string | null }
  | { type: 'ADD_USER'; user: User }
  | { type: 'ADD_BOARD'; board: Board }
  | { type: 'UPDATE_BOARD'; boardId: string; changes: Partial<Board> }
  | { type: 'DELETE_BOARD'; boardId: string }
  | { type: 'ADD_COLUMN'; boardId: string; column: Column }
  | { type: 'UPDATE_COLUMN'; columnId: string; title: string }
  | { type: 'DELETE_COLUMN'; boardId: string; columnId: string }
  | { type: 'ADD_CARD'; columnId: string; card: Card }
  | { type: 'UPDATE_CARD'; cardId: string; changes: Partial<Card> }
  | { type: 'DELETE_CARD'; columnId: string; cardId: string }
  | { type: 'MOVE_COLUMN'; boardId: string; fromColumnId: string; toIndex: number }
  | { type: 'MOVE_CARD'; cardId: string; fromColumnId: string; toColumnId: string; toIndex: number }
  | { type: 'INVITE_USER'; boardId: string; userId: string; role: BoardAccessRole };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'SET_CURRENT_USER':
      return { ...state, currentUserId: action.currentUserId };
    case 'ADD_USER':
      return { ...state, users: { ...state.users, [action.user.id]: action.user }, currentUserId: action.user.id };
    case 'ADD_BOARD': {
      return {
        ...state,
        boards: { ...state.boards, [action.board.id]: action.board },
        boardOrder: state.boardOrder.includes(action.board.id) ? state.boardOrder : [...state.boardOrder, action.board.id],
      };
    }
    case 'UPDATE_BOARD': {
      const existingBoard = state.boards[action.boardId];
      if (!existingBoard) return state;
      return {
        ...state,
        boards: {
          ...state.boards,
          [action.boardId]: { ...existingBoard, ...action.changes },
        },
      };
    }
    case 'DELETE_BOARD': {
      const board = state.boards[action.boardId];
      if (!board) return state;
      const newBoards = { ...state.boards };
      delete newBoards[action.boardId];
      const newColumns = { ...state.columns };
      const newCards = { ...state.cards };
      for (const colId of board.columnIds) {
        const col = newColumns[colId];
        if (col) {
          for (const cardId of col.cardIds) delete newCards[cardId];
          delete newColumns[colId];
        }
      }
      return {
        ...state,
        boards: newBoards,
        columns: newColumns,
        cards: newCards,
        boardOrder: state.boardOrder.filter((id) => id !== action.boardId),
      };
    }
    case 'ADD_COLUMN': {
      return {
        ...state,
        columns: { ...state.columns, [action.column.id]: action.column },
        boards: {
          ...state.boards,
          [action.boardId]: {
            ...state.boards[action.boardId],
            columnIds: [...state.boards[action.boardId].columnIds, action.column.id],
          },
        },
      };
    }
    case 'UPDATE_COLUMN': {
      return {
        ...state,
        columns: {
          ...state.columns,
          [action.columnId]: { ...state.columns[action.columnId], title: action.title },
        },
      };
    }
    case 'DELETE_COLUMN': {
      const col = state.columns[action.columnId];
      if (!col) return state;
      const newColumns = { ...state.columns };
      delete newColumns[action.columnId];
      const newCards = { ...state.cards };
      for (const cardId of col.cardIds) delete newCards[cardId];
      return {
        ...state,
        columns: newColumns,
        cards: newCards,
        boards: {
          ...state.boards,
          [action.boardId]: {
            ...state.boards[action.boardId],
            columnIds: state.boards[action.boardId].columnIds.filter(
              (id) => id !== action.columnId
            ),
          },
        },
      };
    }
    case 'ADD_CARD': {
      return {
        ...state,
        cards: { ...state.cards, [action.card.id]: action.card },
        columns: {
          ...state.columns,
          [action.columnId]: {
            ...state.columns[action.columnId],
            cardIds: [...state.columns[action.columnId].cardIds, action.card.id],
          },
        },
      };
    }
    case 'UPDATE_CARD': {
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.cardId]: { ...state.cards[action.cardId], ...action.changes },
        },
      };
    }
    case 'DELETE_CARD': {
      const newCards = { ...state.cards };
      delete newCards[action.cardId];
      return {
        ...state,
        cards: newCards,
        columns: {
          ...state.columns,
          [action.columnId]: {
            ...state.columns[action.columnId],
            cardIds: state.columns[action.columnId].cardIds.filter(
              (id) => id !== action.cardId
            ),
          },
        },
      };
    }
    case 'MOVE_COLUMN': {
      const { boardId, fromColumnId, toIndex } = action;
      const board = state.boards[boardId];
      if (!board) return state;
      const currentIndex = board.columnIds.indexOf(fromColumnId);
      if (currentIndex === -1) return state;
      const nextColumnIds = [...board.columnIds];
      const [moved] = nextColumnIds.splice(currentIndex, 1);
      nextColumnIds.splice(toIndex, 0, moved);
      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: { ...board, columnIds: nextColumnIds },
        },
      };
    }
    case 'MOVE_CARD': {
      const { cardId, fromColumnId, toColumnId, toIndex } = action;
      const fromCol = state.columns[fromColumnId];
      const toCol = state.columns[toColumnId];
      if (!fromCol || !toCol) return state;
      const fromCardIds = fromCol.cardIds.filter((id) => id !== cardId);
      let toCardIds: string[];
      if (fromColumnId === toColumnId) {
        toCardIds = [...fromCardIds];
      } else {
        toCardIds = toCol.cardIds.filter((id) => id !== cardId);
      }
      toCardIds.splice(toIndex, 0, cardId);
      return {
        ...state,
        columns: {
          ...state.columns,
          [fromColumnId]: { ...fromCol, cardIds: fromCardIds },
          [toColumnId]: { ...toCol, cardIds: toCardIds },
        },
      };
    }
    case 'INVITE_USER': {
      const board = state.boards[action.boardId];
      if (!board) return state;
      return {
        ...state,
        boards: {
          ...state.boards,
          [action.boardId]: {
            ...board,
            members: {
              ...board.members,
              [action.userId]: {
                userId: action.userId,
                role: action.role,
                invitedAt: new Date().toISOString(),
              },
            },
          },
        },
      };
    }
    default:
      return state;
  }
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null as unknown as AppState);

  // Initialize from localStorage immediately, then fetch fresh SQLite state from /api/state
  useEffect(() => {
    const local = loadState();
    dispatch({ type: 'LOAD', payload: local });

    fetch('/api/state')
      .then((res) => res.ok ? (res.json() as Promise<AppState>) : null)
      .then((serverState) => {
        if (serverState && serverState.boards) {
          const currentId = local.currentUserId;
          const merged: AppState = {
            ...local,
            ...serverState,
            users: { ...local.users, ...serverState.users },
            boards: { ...local.boards, ...serverState.boards },
            columns: { ...local.columns, ...serverState.columns },
            cards: { ...local.cards, ...serverState.cards },
            boardOrder: serverState.boardOrder && serverState.boardOrder.length > 0 ? serverState.boardOrder : local.boardOrder,
            currentUserId: currentId ?? serverState.currentUserId,
          };
          dispatch({ type: 'LOAD', payload: merged });
          saveState(merged);
        }
      })
      .catch((err) => console.warn('Could not sync with server state, using local:', err));
  }, []);

  // Save changes to localStorage and push to backend SQLite
  useEffect(() => {
    if (!state) return;
    saveState(state);

    const timer = setTimeout(() => {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      }).catch(() => { });
    }, 300);

    return () => clearTimeout(timer);
  }, [state]);

  const currentUser = useMemo(() => {
    if (!state?.currentUserId) return null;
    return state.users[state.currentUserId] ?? null;
  }, [state]);

  const getBoardRole = useCallback((boardId: string): BoardAccessRole | null => {
    const board = state?.boards[boardId];
    if (!board) return null;
    return getEffectiveRole(state.currentUserId, board.members, board.visibility, board.ownerId);
  }, [state]);

  const isBoardAccessible = useCallback((boardId: string) => {
    const board = state?.boards[boardId];
    if (!board) return false;
    return canAccessBoard(state.currentUserId, board.visibility, board.members, board.ownerId);
  }, [state]);

  const canManageBoard = useCallback((boardId: string, minimumRole: BoardAccessRole = 'owner') => {
    const board = state?.boards[boardId];
    if (!board) return false;
    const role = getBoardRole(boardId);
    if (!role) return false;
    const roleOrder: Record<BoardAccessRole, number> = { owner: 3, editor: 2, viewer: 1 };
    return roleOrder[role] >= roleOrder[minimumRole];
  }, [state, getBoardRole]);

  const deleteBoard = useCallback((boardId: string) => {
    dispatch({ type: 'DELETE_BOARD', boardId });
  }, []);

  const addBoard = useCallback((title: string, accent: string, visibility: 'public' | 'private' = 'private'): string => {
    if (!state?.currentUserId) return '';
    const boardId = generateId();
    const board: Board = {
      id: boardId,
      title,
      accent,
      columnIds: [],
      createdAt: new Date().toISOString(),
      ownerId: state.currentUserId,
      visibility,
      members: {
        [state.currentUserId]: {
          userId: state.currentUserId,
          role: 'owner',
          invitedAt: new Date().toISOString(),
        },
      },
    };
    dispatch({ type: 'ADD_BOARD', board });
    return board.id;
  }, [state]);

  const updateBoard = useCallback(
    (boardId: string, changes: Partial<Pick<Board, 'title' | 'accent' | 'visibility'>>) => {
      dispatch({ type: 'UPDATE_BOARD', boardId, changes });
    },
    []
  );

  const inviteUserToBoard = useCallback((boardId: string, email: string, role: BoardAccessRole = 'viewer') => {
    const board = state?.boards[boardId];
    if (!board || !state.currentUserId) {
      return { success: false, message: 'You are not signed in.' };
    }

    const isOwner = board.ownerId === state.currentUserId || board.members[state.currentUserId]?.role === 'owner';
    if (!isOwner) {
      return { success: false, message: 'Only the board owner can invite collaborators.' };
    }

    const normalizedEmail = normalizeEmail(email);
    const user = Object.values(state.users).find((candidate) => normalizeEmail(candidate.email) === normalizedEmail);
    if (!user) {
      return { success: false, message: 'No user found with that email address.' };
    }

    dispatch({ type: 'INVITE_USER', boardId, userId: user.id, role });
    return { success: true, message: `${user.username} has been invited as a ${role}.` };
  }, [state]);

  type loginApiResponse = {
    success: boolean;
    message: string;
    user?: {
      id: string;
      email: string;
      username: string;
      createdAt: string;
    };
  };

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const normalizedEmail = normalizeEmail(email);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const data = (await res.json()) as loginApiResponse;
      if (res.ok && data.success && data.user) {
        dispatch({ type: 'SET_CURRENT_USER', currentUserId: data.user.id });
        return { success: true, message: data.message };
      }
    } catch {
      // offline fallback
    }

    const user = Object.values(state?.users ?? {}).find((candidate) => normalizeEmail(candidate.email) === normalizedEmail);
    if (!user) return { success: false, message: 'No account was found for that email.' };

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return { success: false, message: 'Incorrect password.' };

    dispatch({ type: 'SET_CURRENT_USER', currentUserId: user.id });
    return { success: true, message: `Welcome back, ${user.username}!` };
  }, [state]);

  type registerApiResponse = {
    success: boolean;
    message: string;
    user?: {
      id: string;
      email: string;
      username: string;
      createdAt: string;
    };
  };

  const register = useCallback(async (email: string, username: string, password: string): Promise<LoginResult> => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || password.length < 8) {
      return { success: false, message: 'Please provide a valid email and a password with at least 8 characters.' };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, username, password }),
      });
      const data = (await res.json()) as registerApiResponse;
      if (res.ok && data.success && data.user) {
        const nextUser: User = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          passwordHash: '',
          createdAt: data.user.createdAt,
        };
        dispatch({ type: 'ADD_USER', user: nextUser });
        return { success: true, message: data.message };
      } else if (data.message) {
        return { success: false, message: data.message };
      }
    } catch {
      // offline fallback
    }

    const existingUser = Object.values(state?.users ?? {}).find((candidate) => normalizeEmail(candidate.email) === normalizedEmail);
    if (existingUser) return { success: false, message: 'An account with that email already exists.' };

    const userId = generateId();
    const nextUser: User = {
      id: userId,
      email: normalizedEmail,
      username: username.trim() || `user${userId.slice(0, 4)}`,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_USER', user: nextUser });
    return { success: true, message: 'Account created successfully. You are now signed in.' };
  }, [state]);

  const switchUser = useCallback((userId: string) => {
    dispatch({ type: 'SET_CURRENT_USER', currentUserId: userId });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_USER', currentUserId: null });
  }, []);

  const addColumn = useCallback((boardId: string, title: string) => {
    const column: Column = { id: generateId(), title, cardIds: [] };
    dispatch({ type: 'ADD_COLUMN', boardId, column });
  }, []);

  const updateColumn = useCallback((columnId: string, title: string) => {
    dispatch({ type: 'UPDATE_COLUMN', columnId, title });
  }, []);

  const deleteColumn = useCallback((boardId: string, columnId: string) => {
    dispatch({ type: 'DELETE_COLUMN', boardId, columnId });
  }, []);

  const addCard = useCallback((columnId: string, title: string) => {
    const card: Card = {
      id: generateId(),
      title,
      description: '',
      priority: 'medium' as Priority,
      dueDate: null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CARD', columnId, card });
    return card.id;
  }, []);

  const updateCard = useCallback(
    (cardId: string, changes: Partial<Omit<Card, 'id' | 'createdAt'>>) => {
      dispatch({ type: 'UPDATE_CARD', cardId, changes });
    },
    []
  );

  const deleteCard = useCallback((columnId: string, cardId: string) => {
    dispatch({ type: 'DELETE_CARD', columnId, cardId });
  }, []);

  const moveColumn = useCallback((boardId: string, fromColumnId: string, toIndex: number) => {
    dispatch({ type: 'MOVE_COLUMN', boardId, fromColumnId, toIndex });
  }, []);

  const moveCard = useCallback(
    (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
      dispatch({ type: 'MOVE_CARD', cardId, fromColumnId, toColumnId, toIndex });
    },
    []
  );

  if (!state) return null;

  return (
    <BoardContext.Provider
      value={{
        state,
        currentUser,
        isBoardAccessible,
        canManageBoard,
        getBoardRole,
        login,
        register,
        logout,
        switchUser,
        inviteUserToBoard,
        addBoard,
        updateBoard,
        deleteBoard,
        addColumn,
        updateColumn,
        deleteColumn,
        addCard,
        updateCard,
        deleteCard,
        moveColumn,
        moveCard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext(): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoardContext must be used inside <BoardProvider>');
  return ctx;
}
