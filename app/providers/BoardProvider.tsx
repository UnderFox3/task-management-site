'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import type { AppState, Board, Card, Column, Priority } from '@/lib/types';
import { generateId, loadState, saveState } from '@/lib/store';

// ─── Context Types ──────────────────────────────────────────────────────────

interface BoardContextValue {
  state: AppState;
  // Board operations
  addBoard: (title: string, accent: string) => string;
  updateBoard: (boardId: string, changes: Partial<Pick<Board, 'title' | 'accent'>>) => void;
  deleteBoard: (boardId: string) => void;
  // Column operations
  addColumn: (boardId: string, title: string) => void;
  updateColumn: (columnId: string, title: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  // Card operations
  addCard: (columnId: string, title: string) => string;
  updateCard: (cardId: string, changes: Partial<Omit<Card, 'id' | 'createdAt'>>) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  // Drag & Drop
  moveColumn: (boardId: string, fromColumnId: string, toIndex: number) => void;
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void;
}

// ─── Reducer ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD'; payload: AppState }
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
  | { type: 'MOVE_CARD'; cardId: string; fromColumnId: string; toColumnId: string; toIndex: number };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return action.payload;

    case 'ADD_BOARD': {
      return {
        ...state,
        boards: { ...state.boards, [action.board.id]: action.board },
        boardOrder: [...state.boardOrder, action.board.id],
      };
    }

    case 'UPDATE_BOARD': {
      return {
        ...state,
        boards: {
          ...state.boards,
          [action.boardId]: { ...state.boards[action.boardId], ...action.changes },
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

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null as unknown as AppState);

  // Load from localStorage on mount
  useEffect(() => {
    dispatch({ type: 'LOAD', payload: loadState() });
  }, []);

  // Persist to localStorage on every state change (after initial load)
  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  const addBoard = useCallback((title: string, accent: string): string => {
    const board: Board = {
      id: generateId(),
      title,
      accent,
      columnIds: [],
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_BOARD', board });
    return board.id;
  }, []);

  const updateBoard = useCallback(
    (boardId: string, changes: Partial<Pick<Board, 'title' | 'accent'>>) => {
      dispatch({ type: 'UPDATE_BOARD', boardId, changes });
    },
    []
  );

  const deleteBoard = useCallback((boardId: string) => {
    dispatch({ type: 'DELETE_BOARD', boardId });
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

  if (!state) return null; // hydrating

  return (
    <BoardContext.Provider
      value={{
        state,
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
